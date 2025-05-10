import React, { useState, useEffect, useRef } from 'react';
import { Container, Tab, Tabs, Navbar, Alert, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ConfigPanel from './ConfigPanel';
import Dashboard from './Dashboard';
import HistoricalChart from './HistoricalChart';
import FilterChart from './FilterChart';
import StatusBar from './StatusBar';
import SystemInfo from './SystemInfo';
import apiService from '../services/api';
import { INTERVALO_ACTUALIZACION } from '../utils/constants';

function App() {
  // Estado para los datos
  const [currentData, setCurrentData] = useState({});
  const [filterData, setFilterData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  
  // Estado para el control
  const [isConnected, setIsConnected] = useState(false);
  const [polling, setPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estado del sistema
  const [systemStatus, setSystemStatus] = useState({
    esclavos: [false, false, false, false],
    emergencia: false
  });
  
  // Referencias para controlar el polling
  const pollingRef = useRef(false);
  const pollingIntervalRef = useRef(null);
  
  // Inicializar datos históricos
  useEffect(() => {
    initHistoricalData();
  }, []);
  
  const initHistoricalData = () => {
    const initialHistoricalData = {};
    
    ["temperature", "humidity", "pressure", "light", "rain_value"].forEach(variable => {
      initialHistoricalData[variable] = {
        "raw": { timestamps: [], values: [] },
        "kalman": { timestamps: [], values: [] },
        "median": { timestamps: [], values: [] },
        "exp": { timestamps: [], values: [] }
      };
    });
    
    setHistoricalData(initialHistoricalData);
  };
  
  // Función para actualizar el estado del sistema
  const updateSystemStatus = async () => {
    try {
      const result = await apiService.getSystemStatus();
      if (result.success) {
        setSystemStatus(result.data);
      }
    } catch (error) {
      console.error("Error obteniendo estado del sistema:", error);
    }
  };
  
  // Manejar la actualización de datos
  const updateData = async () => {
    try {
      const result = await apiService.getData();
      
      if (result.success) {
        const timestamp = new Date();
        
        // Buscar datos de cada esclavo en la respuesta
        // Nos enfocamos principalmente en esclavo1, pero procesamos todos si están disponibles
        for (let i = 1; i <= 4; i++) {
          const esclavoKey = `esclavo${i}`;
          if (result.data[esclavoKey]) {
            const esclavo = result.data[esclavoKey];
            
            // Si estamos procesando esclavo1, actualizar los datos actuales para el dashboard
            if (i === 1) {
              const newCurrentData = {
                temperature: parseFloat(esclavo.temperature || 0),
                humidity: parseFloat(esclavo.humidity || 0),
                pressure: parseFloat(esclavo.pressure || 0),
                light: parseFloat(esclavo.light || 0),
                rain: Boolean(esclavo.rain || false),
                rain_value: parseFloat(esclavo.rain_value || 0),
                window_open: Boolean(esclavo.window_open || false)
              };
              
              setCurrentData(newCurrentData);
              
              // Procesar datos de filtros si existen
              if (esclavo.filtros) {
                setFilterData(esclavo.filtros);
                
                // Actualizar datos históricos para cada sensor y tipo de filtro
                const newHistoricalData = { ...historicalData };
                
                Object.entries(esclavo.filtros).forEach(([variable, filterValues]) => {
                  if (variable in newHistoricalData) {
                    // Añadir valores para cada tipo de filtro
                    Object.entries(filterValues).forEach(([filterType, value]) => {
                      if (filterType in newHistoricalData[variable]) {
                        // Clonar arrays para evitar mutación
                        let timestamps = [...newHistoricalData[variable][filterType].timestamps];
                        let values = [...newHistoricalData[variable][filterType].values];
                        
                        // Limitar longitud a 100 puntos
                        if (timestamps.length >= 100) {
                          timestamps.shift();
                          values.shift();
                        }
                        
                        timestamps.push(timestamp);
                        values.push(parseFloat(value));
                        
                        newHistoricalData[variable][filterType] = {
                          timestamps,
                          values
                        };
                      }
                    });
                  }
                });
                
                setHistoricalData(newHistoricalData);
              }
            }
          }
        }
        
        // Actualizar también el estado del sistema
        await updateSystemStatus();
        
        setIsConnected(true);
        setLastUpdate(timestamp);
        
        return true;
      } else {
        setIsConnected(false);
        return false;
      }
    } catch (error) {
      console.error("Error en updateData:", error);
      setIsConnected(false);
      return false;
    }
  };
  
  // Iniciar polling
  const startPolling = () => {
    setPolling(true);
    pollingRef.current = true;
    
    // Limpiar intervalo existente si hay uno
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Crear nuevo intervalo
    pollingIntervalRef.current = setInterval(() => {
      if (pollingRef.current) {
        updateData();
      }
    }, INTERVALO_ACTUALIZACION);
    
    // Actualizar inmediatamente al iniciar
    updateData();
  };
  
  // Detener polling
  const stopPolling = () => {
    setPolling(false);
    pollingRef.current = false;
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };
  
  // Reiniciar estado de emergencia
  const handleResetEmergency = async () => {
    try {
      const result = await apiService.resetEmergency();
      if (result.success) {
        await updateSystemStatus(); // Actualizar estado después de reiniciar emergencia
        alert("Estado de emergencia reiniciado correctamente");
      } else {
        alert(`Error al reiniciar estado de emergencia: ${result.error}`);
      }
    } catch (error) {
      console.error("Error al reiniciar emergencia:", error);
      alert("Error al reiniciar estado de emergencia");
    }
  };
  
  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  // Manejar conexión exitosa
  const handleConnectionSuccess = (data) => {
    setIsConnected(true);
    updateData();
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
          <Alert variant="danger" className="d-flex justify-content-between align-items-center">
            <div>
              <strong>¡EMERGENCIA ACTIVA!</strong> Se ha activado el botón de emergencia.
            </div>
            <Button variant="outline-light" onClick={handleResetEmergency}>
              Reiniciar Emergencia
            </Button>
          </Alert>
        )}
        
        <StatusBar 
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          onManualUpdate={updateData}
          esclavosStatus={systemStatus.esclavos}
        />
        
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="dashboard" title="Dashboard">
            <Dashboard 
              currentData={currentData}
              historicalData={historicalData}
            />
          </Tab>
          
          <Tab eventKey="historical" title="Datos Históricos">
            <HistoricalChart 
              historicalData={historicalData}
            />
          </Tab>
          
          <Tab eventKey="filters" title="Filtros">
            <FilterChart 
              historicalData={historicalData}
            />
          </Tab>
          
          <Tab eventKey="system" title="Estado del Sistema">
            <SystemInfo 
              systemStatus={systemStatus}
            />
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}

export default App;