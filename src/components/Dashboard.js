import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import RealtimeChart from './RealtimeChart';
import { VARIABLES_INFO, ESCLAVOS_INFO } from '../utils/constants';

const Dashboard = ({ currentData, historicalData, esclavoId }) => {
  const esclavoInfo = ESCLAVOS_INFO[esclavoId] || { nombre: esclavoId };
  const tipoEsclavo = esclavoInfo.tipo || '';
  
  // Determinar el tipo de esclavo para mostrar los datos adecuados
  const esAmbiente = tipoEsclavo === 'ambiente';
  const esHumedad = tipoEsclavo === 'humedad';

  // Verificar si hay datos para mostrar
  const hayDatos = Object.keys(currentData).length > 0;

  // Función para mostrar logs de depuración
  const logDebug = (title, data) => {
    console.log(`DEBUG ${title} (${esclavoId}):`, data);
  };

  // Para depuración
  logDebug("Current Data", currentData);
  logDebug("Historical Data", historicalData);
  logDebug("Esclavo Info", esclavoInfo);

  return (
    <div>
      <Card className="mb-3">
        <Card.Header>Valores Actuales - {esclavoInfo.nombre}</Card.Header>
        <Card.Body>
          {!hayDatos ? (
            <div className="text-center p-4 text-muted">
              <h4>No hay datos disponibles para este esclavo</h4>
              <p>Verifique la conexión con el ESP32 o espere a recibir datos.</p>
            </div>
          ) : (
            <Row>
              {esAmbiente && (
                <>
                  {currentData.temperature !== undefined && (
                    <Col md={2} sm={4} className="mb-3 text-center">
                      <div className="fw-bold">Temperatura</div>
                      <div className="fs-3">{currentData.temperature?.toFixed(1) || '--'} °C</div>
                    </Col>
                  )}
                  
                  {currentData.humidity !== undefined && (
                    <Col md={2} sm={4} className="mb-3 text-center">
                      <div className="fw-bold">Humedad</div>
                      <div className="fs-3">{currentData.humidity?.toFixed(1) || '--'} %</div>
                    </Col>
                  )}
                  
                  {currentData.pressure !== undefined && (
                    <Col md={2} sm={4} className="mb-3 text-center">
                      <div className="fw-bold">Presión</div>
                      <div className="fs-3">{currentData.pressure?.toFixed(0) || '--'} hPa</div>
                    </Col>
                  )}
                  
                  {currentData.light !== undefined && (
                    <Col md={2} sm={4} className="mb-3 text-center">
                      <div className="fw-bold">Luminosidad</div>
                      <div className="fs-3">{currentData.light?.toFixed(0) || '--'}</div>
                    </Col>
                  )}
                  
                  {currentData.rain !== undefined && (
                    <Col md={2} sm={4} className="mb-3 text-center">
                      <div className="fw-bold">Lluvia</div>
                      <div className="fs-3">{currentData.rain ? 'Sí' : 'No'}</div>
                    </Col>
                  )}
                  
                  {currentData.window_open !== undefined && (
                    <Col md={2} sm={4} className="mb-3 text-center">
                      <div className="fw-bold">Ventana</div>
                      <div className="fs-3">{currentData.window_open ? 'Abierta' : 'Cerrada'}</div>
                    </Col>
                  )}
                  
                  {currentData.foco !== undefined && (
                    <Col md={2} sm={4} className="mb-3 text-center">
                      <div className="fw-bold">Foco</div>
                      <div className="fs-3">{currentData.foco ? 'Encendido' : 'Apagado'}</div>
                    </Col>
                  )}
                  
                  {currentData.ventilador !== undefined && (
                    <Col md={2} sm={4} className="mb-3 text-center">
                      <div className="fw-bold">Ventilador</div>
                      <div className="fs-3">{currentData.ventilador ? 'Encendido' : 'Apagado'}</div>
                    </Col>
                  )}
                </>
              )}
              
              {esHumedad && (
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
              
              {!esAmbiente && !esHumedad && (
                // Para esclavos sin tipo definido, mostrar todos los datos disponibles
                <>
                  {Object.entries(currentData).map(([key, value]) => {
                    if (key === 'foco' || key === 'ventilador') {
                      return (
                        <Col key={key} md={3} sm={6} className="mb-3 text-center">
                          <div className="fw-bold">
                            {VARIABLES_INFO[key]?.label || key.charAt(0).toUpperCase() + key.slice(1)}
                          </div>
                          <div className="fs-3">
                            {typeof value === 'boolean' ? (value ? 'Encendido' : 'Apagado') : value}
                          </div>
                        </Col>
                      );
                    } else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
                      // Intentar encontrar info de la variable
                      const varInfo = VARIABLES_INFO[key] || { 
                        label: key.charAt(0).toUpperCase() + key.slice(1), 
                        unit: '' 
                      };
                      
                      let displayValue = value;
                      let unit = varInfo.unit || '';
                      
                      // Formatear según el tipo
                      if (typeof value === 'number') {
                        displayValue = value.toFixed(1);
                      } else if (typeof value === 'boolean') {
                        displayValue = value ? 'Sí/On' : 'No/Off';
                        unit = '';
                      }
                      
                      return (
                        <Col key={key} md={3} sm={6} className="mb-3 text-center">
                          <div className="fw-bold">{varInfo.label}</div>
                          <div className="fs-3">{displayValue} {unit}</div>
                        </Col>
                      );
                    }
                    return null;
                  })}
                </>
              )}
            </Row>
          )}
          
          {esHumedad && currentData.estado_bomba1 !== undefined && (
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
          {!hayDatos || Object.keys(historicalData).length === 0 ? (
            <div className="text-center p-4 text-muted">
              <h4>No hay datos históricos disponibles</h4>
              <p>Espere a que se recopilen datos o verifique la conexión con el ESP32.</p>
            </div>
          ) : (
            <Row>
              {/* Mostrar todas las variables numéricas para facilitar la depuración */}
              {Object.entries(currentData).map(([key, value]) => {
                // Solo mostrar gráficas para variables numéricas
                if (typeof value === 'number' && historicalData[key]?.kalman?.values?.length > 0) {
                  const varInfo = VARIABLES_INFO[key] || {
                    chartTitle: `${key.charAt(0).toUpperCase() + key.slice(1)}`,
                    unit: '',
                    color: '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0') // Color aleatorio
                  };
                  
                  return (
                    <Col key={key} lg={6} md={6} className="mb-3">
                      <RealtimeChart 
                        title={varInfo.chartTitle}
                        data={historicalData[key]?.kalman || { timestamps: [], values: [] }}
                        dataKey={key}
                        color={varInfo.color}
                        yAxisLabel={varInfo.unit}
                      />
                    </Col>
                  );
                }
                return null;
              })}
              
              {/* Si no hay variables numéricas, mostrar mensaje */}
              {Object.entries(currentData).filter(([key, value]) => 
                typeof value === 'number' && historicalData[key]?.kalman?.values?.length > 0
              ).length === 0 && (
                <Col xs={12}>
                  <div className="text-center p-4 text-muted">
                    <h5>No hay datos numéricos disponibles para graficar</h5>
                    <p>Este esclavo solo tiene variables booleanas o no hay suficientes datos históricos.</p>
                  </div>
                </Col>
              )}
            </Row>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;