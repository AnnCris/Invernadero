import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import RealtimeChart from './RealtimeChart';
import { VARIABLES_INFO, ESCLAVOS_INFO } from '../utils/constants';

const Dashboard = ({ currentData, historicalData, esclavoId }) => {
  const esclavoInfo = ESCLAVOS_INFO[esclavoId] || { nombre: esclavoId };
  const esEsclavo1 = esclavoId === 'esclavo1';
  const esEsclavo2 = esclavoId === 'esclavo2';

  return (
    <div>
      <Card className="mb-3">
        <Card.Header>Valores Actuales - {esclavoInfo.nombre}</Card.Header>
        <Card.Body>
          <Row>
            {esEsclavo1 && (
              <>
                <Col md={2} sm={4} className="mb-3 text-center">
                  <div className="fw-bold">Temperatura</div>
                  <div className="fs-3">{currentData.temperature?.toFixed(1) || '--'} °C</div>
                </Col>
                <Col md={2} sm={4} className="mb-3 text-center">
                  <div className="fw-bold">Humedad</div>
                  <div className="fs-3">{currentData.humidity?.toFixed(1) || '--'} %</div>
                </Col>
                <Col md={2} sm={4} className="mb-3 text-center">
                  <div className="fw-bold">Presión</div>
                  <div className="fs-3">{currentData.pressure?.toFixed(0) || '--'} hPa</div>
                </Col>
                <Col md={2} sm={4} className="mb-3 text-center">
                  <div className="fw-bold">Luminosidad</div>
                  <div className="fs-3">{currentData.light?.toFixed(0) || '--'}</div>
                </Col>
                <Col md={2} sm={4} className="mb-3 text-center">
                  <div className="fw-bold">Lluvia</div>
                  <div className="fs-3">{currentData.rain ? 'Sí' : 'No'}</div>
                </Col>
                <Col md={2} sm={4} className="mb-3 text-center">
                  <div className="fw-bold">Ventana</div>
                  <div className="fs-3">{currentData.window_open ? 'Abierta' : 'Cerrada'}</div>
                </Col>
              </>
            )}
            
            {esEsclavo2 && (
              <>
                <Col md={3} sm={6} className="mb-3 text-center">
                  <div className="fw-bold">Humedad Inv. 1</div>
                  <div className="fs-3">{currentData.humedad_inv1?.toFixed(1) || '--'} %</div>
                </Col>
                <Col md={3} sm={6} className="mb-3 text-center">
                  <div className="fw-bold">Humedad Inv. 2</div>
                  <div className="fs-3">{currentData.humedad_inv2?.toFixed(1) || '--'} %</div>
                </Col>
                <Col md={3} sm={6} className="mb-3 text-center">
                  <div className="fw-bold">Nivel de Agua</div>
                  <div className="fs-3">{currentData.nivel_agua?.toFixed(1) || '--'} cm</div>
                </Col>
                <Col md={3} sm={6} className="mb-3 text-center">
                  <div className="fw-bold">Estado Tanque</div>
                  <div className="fs-3">{currentData.estado_tanque || '--'}</div>
                </Col>
              </>
            )}
          </Row>
          
          {esEsclavo2 && (
            <Row>
              <Col md={6} sm={6} className="mb-3 text-center">
                <div className="fw-bold">Estado Bomba 1</div>
                <div className={`fs-3 ${currentData.estado_bomba1 === 'Encendida' ? 'text-success' : 'text-danger'}`}>
                  {currentData.estado_bomba1 || '--'}
                </div>
              </Col>
              <Col md={6} sm={6} className="mb-3 text-center">
                <div className="fw-bold">Estado Bomba 2</div>
                <div className={`fs-3 ${currentData.estado_bomba2 === 'Encendida' ? 'text-success' : 'text-danger'}`}>
                  {currentData.estado_bomba2 || '--'}
                </div>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Header>Monitoreo en Tiempo Real - {esclavoInfo.nombre}</Card.Header>
        <Card.Body>
          <Row>
            {esEsclavo1 && (
              <>
                <Col lg={6} md={6} className="mb-3">
                  <RealtimeChart 
                    title={VARIABLES_INFO.temperature.chartTitle}
                    data={historicalData.temperature?.kalman || { timestamps: [], values: [] }}
                    dataKey="temperature"
                    color={VARIABLES_INFO.temperature.color}
                    yAxisLabel={VARIABLES_INFO.temperature.unit}
                  />
                </Col>
                <Col lg={6} md={6} className="mb-3">
                  <RealtimeChart 
                    title={VARIABLES_INFO.humidity.chartTitle}
                    data={historicalData.humidity?.kalman || { timestamps: [], values: [] }}
                    dataKey="humidity"
                    color={VARIABLES_INFO.humidity.color}
                    yAxisLabel={VARIABLES_INFO.humidity.unit}
                  />
                </Col>
                <Col lg={6} md={6} className="mb-3">
                  <RealtimeChart 
                    title={VARIABLES_INFO.light.chartTitle}
                    data={historicalData.light?.kalman || { timestamps: [], values: [] }}
                    dataKey="light"
                    color={VARIABLES_INFO.light.color}
                    yAxisLabel=""
                  />
                </Col>
                <Col lg={6} md={6} className="mb-3">
                  <RealtimeChart 
                    title={VARIABLES_INFO.rain_value.chartTitle}
                    data={historicalData.rain_value?.kalman || { timestamps: [], values: [] }}
                    dataKey="rain_value"
                    color={VARIABLES_INFO.rain_value.color}
                    yAxisLabel=""
                  />
                </Col>
              </>
            )}
            
            {esEsclavo2 && (
              <>
                <Col lg={6} md={6} className="mb-3">
                  <RealtimeChart 
                    title={VARIABLES_INFO.humedad_inv1.chartTitle}
                    data={historicalData.humedad_inv1?.kalman || { timestamps: [], values: [] }}
                    dataKey="humedad_inv1"
                    color={VARIABLES_INFO.humedad_inv1.color}
                    yAxisLabel={VARIABLES_INFO.humedad_inv1.unit}
                  />
                </Col>
                <Col lg={6} md={6} className="mb-3">
                  <RealtimeChart 
                    title={VARIABLES_INFO.humedad_inv2.chartTitle}
                    data={historicalData.humedad_inv2?.kalman || { timestamps: [], values: [] }}
                    dataKey="humedad_inv2"
                    color={VARIABLES_INFO.humedad_inv2.color}
                    yAxisLabel={VARIABLES_INFO.humedad_inv2.unit}
                  />
                </Col>
                <Col lg={12} md={12} className="mb-3">
                  <RealtimeChart 
                    title={VARIABLES_INFO.nivel_agua.chartTitle}
                    data={historicalData.nivel_agua?.kalman || { timestamps: [], values: [] }}
                    dataKey="nivel_agua"
                    color={VARIABLES_INFO.nivel_agua.color}
                    yAxisLabel={VARIABLES_INFO.nivel_agua.unit}
                  />
                </Col>
              </>
            )}
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
