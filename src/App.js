import React, { useState, useEffect, useRef } from 'react';
import { Container, Tab, Tabs, Navbar, Alert, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ConfigPanel from './components/ConfigPanel';
import Dashboard from './components/Dashboard';
import HistoricalChart from './components/HistoricalChart';
import FilterChart from './components/FilterChart';
import StatusBar from './components/StatusBar';
import EsclavosOverview from './components/EsclavosOverview';
import apiService from './services/api';
import HistoricalData from './models/HistoricalData';
import { INTERVALO_ACTUALIZACION, ESCLAVOS_INFO } from './utils/constants';

function App() {
  // Estado para los datos
  const [currentData, setCurrentData] = useState({});
  const [filterData, setFilterData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  
  // Estado para el control
  const [isConnected, setIsConnected] = useState(false);
  const [polling, setPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');  // Cambiar pestaña por defecto
  
  // Estado para el sistema
  const [systemStatus, setSystemStatus] = useState({ 
    esclavos: [false, false, false, false], 
    emergencia: false 
  });
  const [selectedEsclavo, setSelectedEsclavo] = useState('esclavo1');
  
  // Referencias para controlar el polling
  const pollingRef = useRef(false);
  const pollingIntervalRef = useRef(null);
  const statusIntervalRef = useRef(null);
  
  // Inicializar datos históricos
  useEffect(() => {
    initHistoricalData();
  }, []);
  
  const initHistoricalData = () => {
    const initialHistoricalData = {};
    
    // Inicializar datos históricos para cada esclavo
    Object.keys(ESCLAVOS_INFO).forEach(esclavo => {
      initialHistoricalData[esclavo] = {};
      
      ["temperature", "humidity", "pressure", "light", "rain_value"].forEach(variable => {
        initialHistoricalData[esclavo][variable] = {
          "raw": { timestamps: [], values: [] },
          "kalman": { timestamps: [], values: [] },
          "median": { timestamps: [], values: [] },
          "exp": { timestamps: [], values: [] }
        };
      });
    });
    
    setHistoricalData(initialHistoricalData);
  };
  
  // Manejar la actualización de datos
  const updateData = async () => {
    try {
      console.log("Iniciando actualización de datos...");
      const result = await apiService.getData();
      
      if (result.success) {
        console.log("Datos recibidos del ESP32:", result.data);
        const timestamp = new Date();
        const newCurrentData = {};
        const newFilterData = {};
        const newHistoricalData = { ...historicalData };
        let isAnyEsclavoConnected = false;
        
        // Procesar datos de cada esclavo
        Object.keys(result.data).forEach(esclavo => {
          if (ESCLAVOS_INFO[esclavo]) {
            console.log(`Procesando datos para ${esclavo}:`, result.data[esclavo]);
            isAnyEsclavoConnected = true;
            const esclavoData = result.data[esclavo];
            
            // Extraer valores principales
            newCurrentData[esclavo] = {
              temperature: parseFloat(esclavoData.temperature || 0),
              humidity: parseFloat(esclavoData.humidity || 0),
              pressure: parseFloat(esclavoData.pressure || 0),
              light: parseFloat(esclavoData.light || 0),
              rain: Boolean(esclavoData.rain || false),
              rain_value: parseFloat(esclavoData.rain_value || 0),
              window_open: Boolean(esclavoData.window_open || false)
            };
            
            // Obtener datos de filtros si existen
            if (esclavoData.filtros) {
              console.log(`Datos de filtros encontrados para ${esclavo}:`, esclavoData.filtros);
              newFilterData[esclavo] = esclavoData.filtros;
              
              // Actualizar datos históricos para cada sensor y tipo de filtro
              ["temperature", "humidity", "pressure", "light", "rain_value"].forEach(variable => {
                if (variable in esclavoData.filtros) {
                  const filterValues = esclavoData.filtros[variable];
                  
                  // Añadir valores para cada tipo de filtro
                  ["raw", "kalman", "median", "exp"].forEach(filterType => {
                    if (filterType in filterValues) {
                      const value = parseFloat(filterValues[filterType]);
                      
                      // Inicializar si no existe
                      if (!newHistoricalData[esclavo]) newHistoricalData[esclavo] = {};
                      if (!newHistoricalData[esclavo][variable]) newHistoricalData[esclavo][variable] = {};
                      if (!newHistoricalData[esclavo][variable][filterType]) {
                        newHistoricalData[esclavo][variable][filterType] = { 
                          timestamps: [], 
                          values: [] 
                        };
                      }
                      
                      // Clonar arrays para evitar mutación
                      let timestamps = [...newHistoricalData[esclavo][variable][filterType].timestamps];
                      let values = [...newHistoricalData[esclavo][variable][filterType].values];
                      
                      // Limitar longitud a 100 puntos
                      if (timestamps.length >= 100) {
                        timestamps.shift();
                        values.shift();
                      }
                      
                      timestamps.push(timestamp);
                      values.push(value);
                      
                      newHistoricalData[esclavo][variable][filterType] = {
                        timestamps,
                        values
                      };
                    }
                  });
                }
              });
            } else {
              console.log(`No se encontraron datos de filtros para ${esclavo}. Usando valores principales.`);
              // Si no hay datos de filtros, usar los valores principales
              ["temperature", "humidity", "pressure", "light", "rain_value"].forEach(variable => {
                if (variable in newCurrentData[esclavo]) {
                  const value = newCurrentData[esclavo][variable];
                  
                  // Añadir el mismo valor para todos los tipos de filtro
                  ["raw", "kalman", "median", "exp"].forEach(filterType => {
                    // Inicializar si no existe
                    if (!newHistoricalData[esclavo]) newHistoricalData[esclavo] = {};
                    if (!newHistoricalData[esclavo][variable]) newHistoricalData[esclavo][variable] = {};
                    if (!newHistoricalData[esclavo][variable][filterType]) {
                      newHistoricalData[esclavo][variable][filterType] = { 
                        timestamps: [], 
                        values: [] 
                      };
                    }
                    
                    // Clonar arrays para evitar mutación
                    let timestamps = [...newHistoricalData[esclavo][variable][filterType].timestamps];
                    let values = [...newHistoricalData[esclavo][variable][filterType].values];
                    
                    // Limitar longitud a 100 puntos
                    if (timestamps.length >= 100) {
                      timestamps.shift();
                      values.shift();
                    }
                    
                    timestamps.push(timestamp);
                    values.push(value);
                    
                    newHistoricalData[esclavo][variable][filterType] = {
                      timestamps,
                      values
                    };
                  });
                }
              });
            }
          }
        });
        
        console.log("Datos procesados. Actualizando estado:", {
          currentData: newCurrentData,
          filterData: newFilterData,
          historicalDataLength: Object.keys(newHistoricalData).reduce((acc, esclavo) => {
            acc[esclavo] = {};
            Object.keys(newHistoricalData[esclavo] || {}).forEach(variable => {
              acc[esclavo][variable] = {};
              Object.keys(newHistoricalData[esclavo][variable] || {}).forEach(filterType => {
                acc[esclavo][variable][filterType] = 
                  newHistoricalData[esclavo][variable][filterType].timestamps.length;
              });
            });
            return acc;
          }, {})
        });
        
        setCurrentData(newCurrentData);
        setFilterData(newFilterData);
        setHistoricalData(newHistoricalData);
        setIsConnected(isAnyEsclavoConnected);
        setLastUpdate(timestamp);
        
        return true;
      } else {
        console.log("Error en la respuesta:", result);
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      console.error("Error en updateData:", error);
      setIsConnected(false);
      return false;
    }
  };
  
  // Obtener status del sistema
  const updateSystemStatus = async () => {
    try {
      const result = await apiService.getSystemStatus();
      if (result.success) {
        setSystemStatus(result.data);
      }
    } catch (error) {
      console.error("Error al obtener estado del sistema:", error);
    }
  };
  
  // Restablecer emergencia
  const handleResetEmergency = async () => {
    try {
      const result = await apiService.resetEmergency();
      if (result.success) {
        alert("Emergencia reiniciada correctamente");
        updateSystemStatus();
      } else {
        alert(`Error al reiniciar emergencia: ${result.error}`);
      }
    } catch (error) {
      console.error("Error al reiniciar emergencia:", error);
      alert(`Error al reiniciar emergencia: ${error.message}`);
    }
  };
  
  // Iniciar polling
  const startPolling = () => {
    setPolling(true);
    pollingRef.current = true;
    
    // Limpiar intervalos existentes
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
    }
    
    // Crear nuevo intervalo para datos
    pollingIntervalRef.current = setInterval(() => {
      if (pollingRef.current) {
        updateData();
      }
    }, INTERVALO_ACTUALIZACION);
    
    // Crear nuevo intervalo para estado del sistema
    statusIntervalRef.current = setInterval(() => {
      if (pollingRef.current) {
        updateSystemStatus();
      }
    }, INTERVALO_ACTUALIZACION * 2); // Actualizar estado cada 10 segundos
    
    // Actualizar inmediatamente al iniciar
    updateData();
    updateSystemStatus();
  };
  
  // Detener polling
  const stopPolling = () => {
    setPolling(false);
    pollingRef.current = false;
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  };
  
  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);
  
  // Manejar conexión exitosa
  const handleConnectionSuccess = (data) => {
    setIsConnected(true);
    updateData();
    updateSystemStatus();
  };
  
  // Cambiar esclavo seleccionado
  const handleEsclavoChange = (esclavo) => {
    setSelectedEsclavo(esclavo);
  };
  
  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Sistema de Monitoreo de Invernadero</Navbar.Brand>
          <div className="text-light">
            {isConnected ? (
              <span className="badge bg-success">Conectado</span>
            ) : (
              <span className="badge bg-danger">Desconectado</span>
            )}
          </div>
        </Container>
      </Navbar>
      
      <Container className="mt-3">
        <ConfigPanel 
          onConnectionSuccess={handleConnectionSuccess}
          onPollStart={startPolling}
          onPollStop={stopPolling}
          polling={polling}
        />
        
        {systemStatus.emergencia && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>¡SISTEMA EN EMERGENCIA!</Alert.Heading>
            <p>Se ha activado el estado de emergencia en el sistema.</p>
            <div className="d-flex justify-content-end">
              <Button 
                variant="outline-danger" 
                onClick={handleResetEmergency}
              >
                Reiniciar Emergencia
              </Button>
            </div>
          </Alert>
        )}
        
        <StatusBar 
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          onManualUpdate={updateData}
          esclavos={systemStatus.esclavos}
        />
        
        {Object.keys(currentData).length > 0 && (
          <div className="mb-3">
            <div className="d-flex mb-2">
              {Object.keys(currentData).map((esclavo) => (
                <Button
                  key={esclavo}
                  variant={selectedEsclavo === esclavo ? "primary" : "outline-primary"}
                  onClick={() => handleEsclavoChange(esclavo)}
                  className="me-2"
                >
                  {ESCLAVOS_INFO[esclavo]?.nombre || esclavo}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="overview" title="Visión General">
            <EsclavosOverview 
              currentData={currentData}
              esclavosStatus={systemStatus.esclavos}
            />
            <Dashboard 
              currentData={currentData[selectedEsclavo] || {}}
              historicalData={historicalData[selectedEsclavo] || {}}
              esclavoId={selectedEsclavo}
            />
          </Tab>
          
          <Tab eventKey="dashboard" title="Dashboard">
            <Dashboard 
              currentData={currentData[selectedEsclavo] || {}}
              historicalData={historicalData[selectedEsclavo] || {}}
              esclavoId={selectedEsclavo}
            />
          </Tab>
          
          <Tab eventKey="historical" title="Datos Históricos">
            <HistoricalChart 
              historicalData={historicalData[selectedEsclavo] || {}}
              esclavoId={selectedEsclavo}
            />
          </Tab>
          
          <Tab eventKey="filters" title="Filtros">
            <FilterChart 
              historicalData={historicalData[selectedEsclavo] || {}}
              esclavoId={selectedEsclavo}
            />
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}

export default App;