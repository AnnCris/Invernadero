import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { ESCLAVOS_INFO } from '../utils/constants';

const EsclavosOverview = ({ currentData, esclavosStatus }) => {
  // Determinar qué esclavos tienen datos
  const esclavosConDatos = Object.keys(currentData).filter(esclavo => 
    ESCLAVOS_INFO[esclavo] && Object.keys(currentData[esclavo] || {}).length > 0
  );

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
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>{infoEsclavo.nombre}</span>
                    <Badge bg={conectado ? "success" : "danger"}>
                      {conectado ? "Conectado" : "Desconectado"}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    {tieneData ? (
                      <div>
                        {esclavo === 'esclavo1' && (
                          <>
                            <div className="mb-1">
                              <strong>Temperatura:</strong> {data.temperature?.toFixed(1) || '--'} °C
                            </div>
                            <div className="mb-1">
                              <strong>Humedad:</strong> {data.humidity?.toFixed(1) || '--'} %
                            </div>
                            {data.pressure && (
                              <div className="mb-1">
                                <strong>Presión:</strong> {data.pressure?.toFixed(0) || '--'} hPa
                              </div>
                            )}
                            {data.light !== undefined && (
                              <div className="mb-1">
                                <strong>Luminosidad:</strong> {data.light?.toFixed(0) || '--'}
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
                        
                        {esclavo === 'esclavo2' && (
                          <>
                            <div className="mb-1">
                              <strong>Humedad Inv.1:</strong> {data.humedad_inv1?.toFixed(1) || '--'} %
                            </div>
                            <div className="mb-1">
                              <strong>Humedad Inv.2:</strong> {data.humedad_inv2?.toFixed(1) || '--'} %
                            </div>
                            <div className="mb-1">
                              <strong>Nivel Agua:</strong> {data.nivel_agua?.toFixed(1) || '--'} cm
                            </div>
                            <div className="mb-1">
                              <strong>Tanque:</strong> {data.estado_tanque || '--'}
                            </div>
                            <div className="mb-1">
                              <strong>Bombas:</strong> 1:{data.estado_bomba1 || '--'}, 
                              2:{data.estado_bomba2 || '--'}
                            </div>
                          </>
                        )}
                      </div>
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