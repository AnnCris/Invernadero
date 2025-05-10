import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from 'react-bootstrap';
import moment from 'moment';

const RealtimeChart = ({ title, data, dataKey, color, yAxisLabel }) => {
  // Asegurarnos de que data.timestamps y data.values existan
  const timestamps = data?.timestamps || [];
  const values = data?.values || [];
  
  // Preparar datos para el gráfico con IDs únicos
  const chartData = timestamps.map((timestamp, index) => ({
    id: `${moment(timestamp).format('HH:mm:ss')}-${index}`, // ID único
    time: moment(timestamp).format('HH:mm:ss'),
    [dataKey]: values[index]
  })).slice(-20); // Mostrar los últimos 20 puntos

  return (
    <Card className="h-100">
      <Card.Header>{title}</Card.Header>
      <Card.Body>
        {chartData.length === 0 ? (
          <div className="text-center p-4 text-muted">
            <h5>No hay datos disponibles</h5>
            <p>Espere a que se recopilen datos.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                // Mostrar solo primero, central y último tick
                ticks={
                  chartData.length > 0 ? 
                    [
                      chartData[0].time, 
                      chartData[Math.floor(chartData.length / 2)]?.time, 
                      chartData[chartData.length - 1].time
                    ].filter(Boolean) : 
                    []
                } 
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                dot={chartData.length < 15}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
};

export default RealtimeChart;