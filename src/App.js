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
import { INTERVALO_ACTUALIZACION, ESCLAVOS_INFO, VARIABLES_INFO, FILTER_TYPES } from './utils/constants';

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
      
      // Obtenemos las variables específicas para este esclavo
      const variables = ESCLAVOS_INFO[esclavo].variables || 
        // Si no hay variables específicas, usar todas las variables definidas
        Object.keys(VARIABLES_INFO);
      
      variables.forEach(variable => {
        if (VARIABLES_INFO[variable]) {
          initialHistoricalData[esclavo][variable] = {
            "raw": { timestamps: [], values: [] },
            "kalman": { timestamps: [], values: [] },
            "median": { timestamps: [], values: [] },
            "exp": { timestamps: [], values: [] }
          };
        }
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
        console.log("Datos recibidos:", result.data);
        const timestamp = new Date();
        const newCurrentData = {};
        const newFilterData = {};
        const newHistoricalData = { ...historicalData };
        let isAnyEsclavoConnected = false;
        
        // Procesar datos de cada esclavo
        Object.keys(result.data).forEach(esclavoKey => {
          if (esclavoKey.startsWith('esclavo')) {
            console.log(`Procesando datos para ${esclavoKey}:`, result.data[esclavoKey]);
            isAnyEsclavoConnected = true;
            const esclavoData = result.data[esclavoKey];
            
            // Inicializar datos para este esclavo si no existen
            if (!newCurrentData[esclavoKey]) newCurrentData[esclavoKey] = {};
            if (!newFilterData[esclavoKey]) newFilterData[esclavoKey] = {};
            if (!newHistoricalData[esclavoKey]) newHistoricalData[esclavoKey] = {};
            
            // Asegurarnos de procesar TODOS los campos en esclavoData
            Object.entries(esclavoData).forEach(([key, value]) => {
              // No procesar el campo filtros aquí, se hará por separado
              if (key !== 'filtros') {
                // Si es un valor numérico, convertirlo
                if (!isNaN(value) && typeof value !== 'boolean') {
                  newCurrentData[esclavoKey][key] = parseFloat(value);
                } else {
                  newCurrentData[esclavoKey][key] = value;
                }
              }
            });
            
            // Extraer explícitamente temperatura y humedad para estar seguros
            if (esclavoData.temperatura !== undefined) {
              newCurrentData[esclavoKey].temperature = parseFloat(esclavoData.temperatura);
            } else if (esclavoData.temperature !== undefined) {
              newCurrentData[esclavoKey].temperature = parseFloat(esclavoData.temperature);
            }
            
            if (esclavoData.humedad !== undefined) {
              newCurrentData[esclavoKey].humidity = parseFloat(esclavoData.humedad);
            } else if (esclavoData.humidity !== undefined) {
              newCurrentData[esclavoKey].humidity = parseFloat(esclavoData.humidity);
            }
            
            // Obtener datos de filtros si existen
            if (esclavoData.filtros) {
              console.log(`Datos de filtros encontrados para ${esclavoKey}:`, esclavoData.filtros);
              newFilterData[esclavoKey] = esclavoData.filtros;
              
              // Si hay filtros de temperatura, asegurarnos de que se refleje en currentData
              if (esclavoData.filtros.temperatura || esclavoData.filtros.temperature) {
                const tempFilters = esclavoData.filtros.temperatura || esclavoData.filtros.temperature;
                if (tempFilters.kalman !== undefined) {
                  newCurrentData[esclavoKey].temperature = parseFloat(tempFilters.kalman);
                }
              }
              
              // Si hay filtros de humedad, asegurarnos de que se refleje en currentData
              if (esclavoData.filtros.humedad || esclavoData.filtros.humidity) {
                const humFilters = esclavoData.filtros.humedad || esclavoData.filtros.humidity;
                if (humFilters.kalman !== undefined) {
                  newCurrentData[esclavoKey].humidity = parseFloat(humFilters.kalman);
                }
              }
              
              // Procesar cada variable con filtros
              Object.entries(esclavoData.filtros).forEach(([variable, filterValues]) => {
                // Normalizar nombres de variables
                let normalizedVariable = variable;
                if (variable === 'temperatura') normalizedVariable = 'temperature';
                if (variable === 'humedad') normalizedVariable = 'humidity';
                
                // Inicializar la variable en historicalData si no existe
                if (!newHistoricalData[esclavoKey][normalizedVariable]) {
                  newHistoricalData[esclavoKey][normalizedVariable] = {};
                }
                
                // Procesar cada tipo de filtro
                Object.entries(filterValues).forEach(([filterType, value]) => {
                  if (FILTER_TYPES[filterType]) {
                    const numValue = parseFloat(value);
                    
                    // Inicializar el filtro si no existe
                    if (!newHistoricalData[esclavoKey][normalizedVariable][filterType]) {
                      newHistoricalData[esclavoKey][normalizedVariable][filterType] = { 
                        timestamps: [], 
                        values: [] 
                      };
                    }
                    
                    // Clonar arrays para evitar mutación
                    let timestamps = [...newHistoricalData[esclavoKey][normalizedVariable][filterType].timestamps];
                    let values = [...newHistoricalData[esclavoKey][normalizedVariable][filterType].values];
                    
                    // Limitar longitud a 100 puntos
                    if (timestamps.length >= 100) {
                      timestamps.shift();
                      values.shift();
                    }
                    
                    timestamps.push(timestamp);
                    values.push(numValue);
                    
                    newHistoricalData[esclavoKey][normalizedVariable][filterType] = {
                      timestamps,
                      values
                    };
                  }
                });
              });
            } else {
              // Si no hay datos filtrados, usar los valores directos para variables numéricas
              Object.entries(newCurrentData[esclavoKey]).forEach(([variable, value]) => {
                if (typeof value === 'number' && !isNaN(value)) {
                  // Normalizar nombres de variables
                  let normalizedVariable = variable;
                  if (variable === 'temperatura') normalizedVariable = 'temperature';
                  if (variable === 'humedad') normalizedVariable = 'humidity';
                  
                  // Inicializar la variable en historicalData si no existe
                  if (!newHistoricalData[esclavoKey][normalizedVariable]) {
                    newHistoricalData[esclavoKey][normalizedVariable] = {};
                  }
                  
                  // Para cada tipo de filtro, usar el mismo valor
                  Object.keys(FILTER_TYPES).forEach(filterType => {
                    if (!newHistoricalData[esclavoKey][normalizedVariable][filterType]) {
                      newHistoricalData[esclavoKey][normalizedVariable][filterType] = { 
                        timestamps: [], 
                        values: [] 
                      };
                    }
                    
                    // Clonar arrays para evitar mutación
                    let timestamps = [...newHistoricalData[esclavoKey][normalizedVariable][filterType].timestamps];
                    let values = [...newHistoricalData[esclavoKey][normalizedVariable][filterType].values];
                    
                    // Limitar longitud a 100 puntos
                    if (timestamps.length >= 100) {
                      timestamps.shift();
                      values.shift();
                    }
                    
                    timestamps.push(timestamp);
                    values.push(value);
                    
                    newHistoricalData[esclavoKey][normalizedVariable][filterType] = {
                      timestamps,
                      values
                    };
                  });
                }
              });
            }
          }
        });
        
        console.log("Datos procesados. Esclavos encontrados:", Object.keys(newCurrentData));
        
        // Para depuración
        Object.keys(newCurrentData).forEach(esclavo => {
          console.log(`${esclavo} procesado - Temperatura: ${newCurrentData[esclavo].temperature}, Humedad: ${newCurrentData[esclavo].humidity}`);
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
  
  // Una actualización manual
  const handleManualUpdate = () => {
    updateData();
    updateSystemStatus();
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
          onManualUpdate={handleManualUpdate}
          esclavos={systemStatus.esclavos}
        />
        
        {Object.keys(currentData).length > 0 && (
          <div className="mb-3">
            <div className="d-flex flex-wrap mb-2">
              {Object.keys(currentData).map((esclavo) => (
                <Button
                  key={esclavo}
                  variant={selectedEsclavo === esclavo ? "primary" : "outline-primary"}
                  onClick={() => handleEsclavoChange(esclavo)}
                  className="me-2 mb-2"
                  style={{
                    backgroundColor: selectedEsclavo === esclavo ? ESCLAVOS_INFO[esclavo]?.color : 'transparent',
                    borderColor: ESCLAVOS_INFO[esclavo]?.color,
                    color: selectedEsclavo === esclavo ? 'white' : ESCLAVOS_INFO[esclavo]?.color
                  }}
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
            {selectedEsclavo && currentData[selectedEsclavo] && (
              <Dashboard 
                currentData={currentData[selectedEsclavo] || {}}
                historicalData={historicalData[selectedEsclavo] || {}}
                esclavoId={selectedEsclavo}
              />
            )}
          </Tab>
          
          <Tab eventKey="dashboard" title="Dashboard">
            {selectedEsclavo && currentData[selectedEsclavo] && (
              <Dashboard 
                currentData={currentData[selectedEsclavo] || {}}
                historicalData={historicalData[selectedEsclavo] || {}}
                esclavoId={selectedEsclavo}
              />
            )}
          </Tab>
          
          <Tab eventKey="historical" title="Datos Históricos">
            {selectedEsclavo && historicalData[selectedEsclavo] && (
              <HistoricalChart 
                historicalData={historicalData[selectedEsclavo] || {}}
                esclavoId={selectedEsclavo}
              />
            )}
          </Tab>
          
          <Tab eventKey="filters" title="Filtros">
            {selectedEsclavo && historicalData[selectedEsclavo] && (
              <FilterChart 
                historicalData={historicalData[selectedEsclavo] || {}}
                esclavoId={selectedEsclavo}
              />
            )}
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}

export default App;