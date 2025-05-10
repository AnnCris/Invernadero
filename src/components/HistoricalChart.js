import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { VARIABLES_INFO, ESCLAVOS_INFO } from '../utils/constants';

const HistoricalChart = ({ historicalData, esclavoId }) => {
  const [selectedVariable, setSelectedVariable] = useState('temperature');
  const [chartData, setChartData] = useState([]);
  
  const handleVariableChange = (e) => {
    setSelectedVariable(e.target.value);
  };

  const esclavoInfo = ESCLAVOS_INFO[esclavoId] || { nombre: esclavoId };

  // Preparar datos para el gráfico con useCallback para evitar dependencia circular
  const prepareChartData = useCallback(() => {
    console.log("Preparando datos históricos para:", selectedVariable);
    console.log("Datos disponibles:", historicalData);
    
    // Verificar si tenemos datos para la variable seleccionada
    if (!historicalData || !historicalData[selectedVariable] || !historicalData[selectedVariable].kalman) {
      console.log("No hay datos para mostrar");
      setChartData([]);
      return;
    }
    
    const data = historicalData[selectedVariable]?.kalman || { timestamps: [], values: [] };
    console.log("Datos para gráfico:", data);
    
    // Crear datos para el gráfico
    const formattedData = data.timestamps.map((timestamp, index) => {
      return {
        time: moment(timestamp).format('HH:mm:ss'),
        [selectedVariable]: data.values[index]
      };
    });
    
    console.log("Datos formateados:", formattedData);
    setChartData(formattedData);
  }, [selectedVariable, historicalData]);

  // Actualizar los datos cuando cambia la variable o los datos históricos
  useEffect(() => {
    prepareChartData();
  }, [selectedVariable, historicalData, prepareChartData]);

  // Conseguir ticks para el eje X (mostrar solo algunos para evitar sobrecarga)
  const getXAxisTicks = () => {
    if (chartData.length <= 10) return chartData.map(item => item.time);
    
    const ticks = [];
    const step = Math.floor(chartData.length / 10);
    for (let i = 0; i < chartData.length; i += step) {
      ticks.push(chartData[i].time);
    }
    if (chartData.length > 0 && !ticks.includes(chartData[chartData.length - 1].time)) {
      ticks.push(chartData[chartData.length - 1].time);
    }
    return ticks;
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
      <Card.Header>Datos Históricos - {esclavoInfo.nombre}</Card.Header>
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
                    name="variable"
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
            <h4>No hay datos históricos disponibles</h4>
            <p>Espere a que se recopilen más datos o verifique la conexión con el ESP32.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                ticks={getXAxisTicks()} 
                angle={-45}
                textAnchor="end"
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
              <Line
                type="monotone"
                dataKey={selectedVariable}
                stroke={VARIABLES_INFO[selectedVariable]?.color || 'blue'}
                strokeWidth={2}
                dot={chartData.length < 30}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        <div className="mt-3 small text-muted">
          {chartData.length > 0 ? 
            `Mostrando ${chartData.length} puntos de datos.` :
            "No hay datos para mostrar. Compruebe la conexión con el ESP32."
          }
        </div>
      </Card.Body>
    </Card>
  );
};

export default HistoricalChart;