import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { ESCLAVOS_INFO } from '../utils/constants';

const EsclavosOverview = ({ currentData, esclavosStatus }) => {
  // Determinar qué esclavos tienen datos
  const esclavosConDatos = Object.keys(currentData).filter(esclavo => 
    ESCLAVOS_INFO[esclavo] && Object.keys(currentData[esclavo] || {}).length > 0
  );

  // Función para renderizar los valores de un esclavo
  const renderizarValoresEsclavo = (esclavo, data) => {
    const tipoEsclavo = ESCLAVOS_INFO[esclavo]?.tipo;
    
    // Para depuración
    console.log(`Renderizando valores para ${esclavo} (tipo: ${tipoEsclavo}):`, data);
    
    // Primero, intentemos mostrar temperatura y humedad si existen
    // para cualquier tipo de esclavo
    const hasMostradoTemperatura = data.temperature !== undefined;
    const hasMostradoHumedad = data.humidity !== undefined;
    
    return (
      <>
        {/* Mostrar temperatura y humedad si están disponibles, sin importar el tipo de esclavo */}
        {data.temperature !== undefined && (
          <div className="mb-1">
            <strong>Temperatura:</strong> {parseFloat(data.temperature).toFixed(1)} °C
          </div>
        )}
        
        {data.humidity !== undefined && (
          <div className="mb-1">
            <strong>Humedad:</strong> {parseFloat(data.humidity).toFixed(1)} %
          </div>
        )}
        
        {/* Mostrar datos específicos según el tipo de esclavo */}
        {tipoEsclavo === 'ambiente' && (
          <>
            {!hasMostradoTemperatura && !hasMostradoHumedad && (
              <>
                <div className="mb-1 text-muted">
                  <em>No hay datos de temperatura o humedad</em>
                </div>
              </>
            )}
            
            {data.pressure !== undefined && (
              <div className="mb-1">
                <strong>Presión:</strong> {parseFloat(data.pressure).toFixed(0)} hPa
              </div>
            )}
            
            {data.light !== undefined && (
              <div className="mb-1">
                <strong>Luminosidad:</strong> {parseInt(data.light, 10)}
              </div>
            )}
            
            {data.rain !== undefined && (
              <div className="mb-1">
                <strong>Lluvia:</strong> {data.rain ? 'Sí' : 'No'}
              </div>
            )}
            
            {data.window_open !== undefined && (
              <div className="mb-1">
                <strong>Ventana:</strong> {data.window_open ? 'Abierta' : 'Cerrada'}
              </div>
            )}
          </>
        )}
        
        {tipoEsclavo === 'humedad' && (
          <>
            {data.humedad_inv1 !== undefined && (
              <div className="mb-1">
                <strong>Humedad Inv.1:</strong> {parseFloat(data.humedad_inv1).toFixed(1)} %
              </div>
            )}
            
            {data.humedad_inv2 !== undefined && (
              <div className="mb-1">
                <strong>Humedad Inv.2:</strong> {parseFloat(data.humedad_inv2).toFixed(1)} %
              </div>
            )}
            
            {data.nivel_agua !== undefined && (
              <div className="mb-1">
                <strong>Nivel Agua:</strong> {parseFloat(data.nivel_agua).toFixed(1)} cm
              </div>
            )}
            
            {data.estado_tanque !== undefined && (
              <div className="mb-1">
                <strong>Tanque:</strong> {data.estado_tanque}
              </div>
            )}
            
            {(data.estado_bomba1 !== undefined || data.estado_bomba2 !== undefined) && (
              <div className="mb-1">
                <strong>Bombas:</strong> 
                {data.estado_bomba1 ? ` 1:${data.estado_bomba1}` : ''} 
                {data.estado_bomba2 ? `, 2:${data.estado_bomba2}` : ''}
              </div>
            )}
          </>
        )}
        
        {/* Mostrar foco y ventilador para cualquier tipo de esclavo */}
        {data.foco !== undefined && (
          <div className="mb-1">
            <strong>Foco:</strong> {data.foco ? 'Encendido' : 'Apagado'}
          </div>
        )}
        
        {data.ventilador !== undefined && (
          <div className="mb-1">
            <strong>Ventilador:</strong> {data.ventilador ? 'Encendido' : 'Apagado'}
          </div>
        )}
        
        {/* Si no hay datos específicos, mostrar todos los datos disponibles */}
        {!tipoEsclavo && (
          Object.entries(data).map(([key, value]) => {
            // Ignorar temperatura y humedad que ya se mostraron
            if (key === 'temperature' && hasMostradoTemperatura) return null;
            if (key === 'humidity' && hasMostradoHumedad) return null;
            if (key === 'foco' || key === 'ventilador') return null; // También se mostraron arriba
            
            let displayVal = value;
            
            if (typeof value === 'number') {
              displayVal = parseFloat(value).toFixed(1);
            } else if (typeof value === 'boolean') {
              displayVal = value ? 'Sí/On' : 'No/Off';
            }
            
            return (
              <div key={key} className="mb-1">
                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {displayVal}
              </div>
            );
          })
        )}
      </>
    );
  };

  return (
    <Card className="mb-3">
      <Card.Header>Vista General de Esclavos</Card.Header>
      <Card.Body>
        <Row>
          {Object.keys(ESCLAVOS_INFO).map((esclavo, index) => {
            const tieneData = esclavosConDatos.includes(esclavo);
            const conectado = esclavosStatus ? esclavosStatus[index] : tieneData;
            const data = currentData[esclavo] || {};
            const infoEsclavo = ESCLAVOS_INFO[esclavo];
            
            return (
              <Col key={esclavo} md={6} lg={3} className="mb-3">
                <Card 
                  className="h-100"
                  border={conectado ? "success" : "danger"}
                >
                  <Card.Header className="d-flex justify-content-between align-items-center" 
                    style={{ backgroundColor: infoEsclavo.color, color: 'white' }}
                  >
                    <span>{infoEsclavo.nombre}</span>
                    <Badge bg={conectado ? "success" : "danger"} className="text-white">
                      {conectado ? "Conectado" : "Desconectado"}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    {tieneData ? (
                      renderizarValoresEsclavo(esclavo, data)
                    ) : (
                      <div className="text-muted">No hay datos disponibles</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default EsclavosOverview;