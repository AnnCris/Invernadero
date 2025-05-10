import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { VARIABLES_INFO, FILTER_TYPES, ESCLAVOS_INFO } from '../utils/constants';

const FilterChart = ({ historicalData, esclavoId }) => {
  const [selectedVariable, setSelectedVariable] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  const esclavoInfo = ESCLAVOS_INFO[esclavoId] || { nombre: esclavoId };
  
  // Inicializar la variable seleccionada basada en el esclavo actual y los datos disponibles
  useEffect(() => {
    // Encontrar las variables que tienen datos
    const variablesConDatos = Object.keys(historicalData).filter(variable => {
      return VARIABLES_INFO[variable] && historicalData[variable] && 
        Object.values(historicalData[variable]).some(filterData => 
          filterData.values && filterData.values.length > 0
        );
    });
    
    if (variablesConDatos.length > 0) {
      // Priorizar temperatura o humedad si existen
      if (variablesConDatos.includes('temperature')) {
        setSelectedVariable('temperature');
      } else if (variablesConDatos.includes('humidity')) {
        setSelectedVariable('humidity');
      } else if (variablesConDatos.includes('humedad_inv1')) {
        setSelectedVariable('humedad_inv1');
      } else {
        // O usar la primera variable disponible
        setSelectedVariable(variablesConDatos[0]);
      }
    } else {
      setSelectedVariable(null);
    }
  }, [esclavoId, historicalData]);
  
  const handleVariableChange = (e) => {
    setSelectedVariable(e.target.value);
  };

  // Este efecto preparará los datos para el gráfico cada vez que cambie la variable o los datos históricos
  const prepareChartData = useCallback(() => {
    if (!selectedVariable || !historicalData || !historicalData[selectedVariable]) {
      setChartData([]);
      return;
    }

    // Tomar los últimos 20 puntos de cada filtro
    const variableData = historicalData[selectedVariable] || {};
    const maxLength = 20;
    
    // Encontrar el filtro con más datos para usar sus timestamps
    let baseTimestamps = [];
    Object.keys(FILTER_TYPES).forEach(filterType => {
      if (variableData[filterType] && variableData[filterType].timestamps && variableData[filterType].timestamps.length > baseTimestamps.length) {
        baseTimestamps = variableData[filterType].timestamps.slice(-maxLength);
      }
    });
    
    if (baseTimestamps.length === 0) {
      setChartData([]);
      return;
    }
    
    // Crear objetos de datos para el gráfico
    const formattedData = baseTimestamps.map((timestamp, index) => {
      const dataPoint = {
        time: moment(timestamp).format('HH:mm:ss')
      };
      
      // Agregar valores de cada filtro
      Object.keys(FILTER_TYPES).forEach(filterType => {
        if (variableData[filterType] && variableData[filterType].values) {
          const values = variableData[filterType].values;
          const startIdx = values.length - baseTimestamps.length;
          if (startIdx + index >= 0 && startIdx + index < values.length) {
            dataPoint[filterType] = values[startIdx + index];
          }
        }
      });
      
      return dataPoint;
    });
    
    setChartData(formattedData);
  }, [selectedVariable, historicalData]);

  useEffect(() => {
    prepareChartData();
  }, [selectedVariable, historicalData, prepareChartData]);

  // Conseguir ticks para el eje X (mostrar solo algunos para evitar sobrecarga)
  const getXAxisTicks = () => {
    if (chartData.length <= 3) return chartData.map(item => item.time);
    
    const result = [];
    if (chartData.length > 0) result.push(chartData[0].time);
    if (chartData.length > 2) result.push(chartData[Math.floor(chartData.length / 2)].time);
    if (chartData.length > 1) result.push(chartData[chartData.length - 1].time);
    return result;
  };

  // Obtenemos las variables que tienen datos históricos para este esclavo
  const getVariablesDisponibles = () => {
    // Primero, verificar si el esclavo tiene variables definidas
    let variablesCandidatas = esclavoInfo.variables || Object.keys(VARIABLES_INFO);
    
    // Filtrar por variables que realmente tienen datos
    return variablesCandidatas.filter(variable => 
      historicalData[variable] && 
      Object.values(historicalData[variable]).some(filterData => 
        filterData.values && filterData.values.length > 0
      ) &&
      VARIABLES_INFO[variable] // Asegurarse de que tenemos info de la variable
    );
  };

  const variablesDisponibles = getVariablesDisponibles();
  const hayVariablesDisponibles = variablesDisponibles.length > 0;

  return (
    <Card>
      <Card.Header>Comparación de Filtros - {esclavoInfo.nombre}</Card.Header>
      <Card.Body>
        {!hayVariablesDisponibles ? (
          <div className="text-center p-5 text-muted">
            <h4>No hay datos de filtros disponibles</h4>
            <p>Espere a que se recopilen más datos o verifique que los filtros estén configurados en el ESP32.</p>
          </div>
        ) : (
          <>
            <Form className="mb-3">
              <Form.Group>
                <Form.Label>Variable:</Form.Label>
                <div className="d-flex flex-wrap">
                  {variablesDisponibles.map((key) => (
                    <Form.Check
                      key={key}
                      type="radio"
                      label={VARIABLES_INFO[key].label}
                      name="filter-variable"
                      value={key}
                      checked={selectedVariable === key}
                      onChange={handleVariableChange}
                      className="me-3"
                    />
                  ))}
                </div>
              </Form.Group>
            </Form>

            {!selectedVariable || chartData.length === 0 ? (
              <div className="text-center p-5 text-muted">
                <h4>No hay datos de filtros para esta variable</h4>
                <p>Seleccione otra variable o espere a que se recopilen más datos.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    ticks={getXAxisTicks()}
                  />
                  <YAxis 
                    label={{ 
                      value: VARIABLES_INFO[selectedVariable]?.unit || '', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                    tick={{ fontSize: 12 }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip />
                  <Legend />
                  
                  {Object.entries(FILTER_TYPES).map(([key, info]) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={info.label}
                      stroke={info.color}
                      strokeWidth={2}
                      dot={chartData.length < 30}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
            
            <div className="mt-3 d-flex flex-wrap">
              {Object.entries(FILTER_TYPES).map(([key, info]) => (
                <div key={key} className="me-3 mb-2">
                  <span 
                    className="d-inline-block me-1" 
                    style={{ 
                      width: '1rem', 
                      height: '1rem', 
                      backgroundColor: info.color 
                    }}
                  ></span>
                  <span>{info.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default FilterChart;