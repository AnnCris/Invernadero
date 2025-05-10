import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from 'react-bootstrap';
import moment from 'moment';

const RealtimeChart = ({ title, data, dataKey, color, yAxisLabel }) => {
  // Preparar datos para el gráfico
  const chartData = data.timestamps.map((timestamp, index) => ({
    time: moment(timestamp).format('HH:mm:ss'),
    [dataKey]: data.values[index]
  })).slice(-20); // Mostrar los últimos 20 puntos

  return (
    <Card className="h-100">
      <Card.Header>{title}</Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              // Mostrar solo primero y último tick para no sobrecargar
              ticks={chartData.length > 0 ? [chartData[0].time, chartData[chartData.length - 1].time] : []} 
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
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default RealtimeChart;