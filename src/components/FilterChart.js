import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { VARIABLES_INFO, FILTER_TYPES, ESCLAVOS_INFO } from '../utils/constants';

const FilterChart = ({ historicalData, esclavoId }) => {
  const [selectedVariable, setSelectedVariable] = useState('temperature');
  const [chartData, setChartData] = useState([]);
  
  const handleVariableChange = (e) => {
    setSelectedVariable(e.target.value);
  };

  const esclavoInfo = ESCLAVOS_INFO[esclavoId] || { nombre: esclavoId };

  // Este efecto preparará los datos para el gráfico cada vez que cambie la variable o los datos históricos
  // Creamos la función con useCallback para evitar la dependencia circular
  const prepareChartData = useCallback(() => {
    console.log("Preparando datos de filtros para:", selectedVariable);
    console.log("Datos disponibles:", historicalData);
    
    // Verificar si tenemos datos para la variable seleccionada
    if (!historicalData || !historicalData[selectedVariable]) {
      console.log("No hay datos para mostrar en filtros");
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
    
    console.log("Timestamps base encontrados:", baseTimestamps.length);
    
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
    
    console.log("Datos formateados para filtros:", formattedData);
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

  // Obtenemos las variables disponibles para este esclavo
  const getVariablesForEsclavo = () => {
    if (esclavoInfo.variables) {
      return esclavoInfo.variables;
    }
    
    // Si no hay variables específicas, usamos todas las que tengan datos
    if (historicalData) {
      return Object.keys(historicalData);
    }
    
    // Por defecto, devolvemos todas las variables
    return Object.keys(VARIABLES_INFO);
  };

  return (
    <Card>
      <Card.Header>Comparación de Filtros - {esclavoInfo.nombre}</Card.Header>
      <Card.Body>
        <Form className="mb-3">
          <Form.Group>
            <Form.Label>Variable:</Form.Label>
            <div className="d-flex flex-wrap">
              {getVariablesForEsclavo().map((key) => (
                VARIABLES_INFO[key] && (
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
                )
              ))}
            </div>
          </Form.Group>
        </Form>

        {chartData.length === 0 ? (
          <div className="text-center p-5 text-muted">
            <h4>No hay datos de filtros disponibles</h4>
            <p>Espere a que se recopilen más datos o verifique que los filtros estén configurados en el ESP32.</p>
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
            <div key={key} className="me-3">
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
        
        <div className="mt-3 small text-muted">
          {chartData.length > 0 ? 
            `Mostrando ${chartData.length} puntos de datos.` :
            "No hay datos para mostrar. Compruebe que los filtros estén configurados en el ESP32."
          }
        </div>
      </Card.Body>
    </Card>
  );
};

export default FilterChart;