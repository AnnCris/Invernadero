import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { SLAVE_INFO } from '../utils/constants';
import axios from 'axios';

const Controls = ({ apiUrl, isConnected }) => {
  const [windowState, setWindowState] = useState(false);
  const [lightState, setLightState] = useState(false);
  const [irrigationState, setIrrigationState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Obtener estado actual de los actuadores
  useEffect(() => {
    if (isConnected) {
      fetchActuatorStatus();
    }
  }, [isConnected]);
  
  const fetchActuatorStatus = async () => {
    try {
      setLoading(true);
      
      // En una implementación real, aquí harías una petición al ESP32
      // para obtener el estado actual de los actuadores.
      // Por ahora, simularemos una respuesta
      
      // Simulación: En una aplicación real, esto vendría de una API
      setTimeout(() => {
        setWindowState(false);
        setLightState(false);
        setIrrigationState(false);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error obteniendo estado de actuadores:", error);
      setMessage({
        type: 'danger',
        text: 'Error al obtener el estado de los actuadores'
      });
      setLoading(false);
    }
  };
  
  const handleWindowToggle = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      // En una implementación real, aquí harías una petición al ESP32
      // para cambiar el estado de la ventana
      // Por ejemplo:
      // await axios.post(`http://${apiUrl}/actuador/ventana`, { estado: !windowState });
      
      // Simulación: En una aplicación real, esto se comunicaría con el API
      setTimeout(() => {
        setWindowState(!windowState);
        setMessage({
          type: 'success',
          text: `Ventana ${!windowState ? 'abierta' : 'cerrada'} correctamente`
        });
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error controlando ventana:", error);
      setMessage({
        type: 'danger',
        text: 'Error al controlar la ventana'
      });
      setLoading(false);
    }
  };
  
  const handleLightToggle = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      // Simulación
      setTimeout(() => {
        setLightState(!lightState);
        setMessage({
          type: 'success',
          text: `Iluminación ${!lightState ? 'encendida' : 'apagada'} correctamente`
        });
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error controlando iluminación:", error);
      setMessage({
        type: 'danger',
        text: 'Error al controlar la iluminación'
      });
      setLoading(false);
    }
  };
  
  const handleIrrigationToggle = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      // Simulación
      setTimeout(() => {
        setIrrigationState(!irrigationState);
        setMessage({
          type: 'success',
          text: `Sistema de riego ${!irrigationState ? 'activado' : 'desactivado'} correctamente`
        });
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error controlando riego:", error);
      setMessage({
        type: 'danger',
        text: 'Error al controlar el sistema de riego'
      });
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <Card.Header>Panel de Control</Card.Header>
      <Card.Body>
        {message && (
          <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}
        
        <Row>
          <Col md={4} className="mb-3">
            <Card>
              <Card.Header>Control de Ventana</Card.Header>
              <Card.Body className="text-center">
                <div className="mb-3">
                  <div className="fs-5">Estado actual:</div>
                  <div className={`fw-bold fs-4 ${windowState ? 'text-success' : 'text-danger'}`}>
                    {windowState ? 'Abierta' : 'Cerrada'}
                  </div>
                </div>
                <Button 
                  variant={windowState ? "danger" : "success"} 
                  onClick={handleWindowToggle}
                  disabled={loading || !isConnected}
                  className="w-100"
                >
                  {loading ? 'Procesando...' : (windowState ? 'Cerrar Ventana' : 'Abrir Ventana')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-3">
            <Card>
              <Card.Header>Iluminación</Card.Header>
              <Card.Body className="text-center">
                <div className="mb-3">
                  <div className="fs-5">Estado actual:</div>
                  <div className={`fw-bold fs-4 ${lightState ? 'text-success' : 'text-secondary'}`}>
                    {lightState ? 'Encendido' : 'Apagado'}
                  </div>
                </div>
                <Button 
                  variant={lightState ? "secondary" : "success"} 
                  onClick={handleLightToggle}
                  disabled={loading || !isConnected}
                  className="w-100"
                >
                  {loading ? 'Procesando...' : (lightState ? 'Apagar Luces' : 'Encender Luces')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-3">
            <Card>
              <Card.Header>Sistema de Riego</Card.Header>
              <Card.Body className="text-center">
                <div className="mb-3">
                  <div className="fs-5">Estado actual:</div>
                  <div className={`fw-bold fs-4 ${irrigationState ? 'text-success' : 'text-secondary'}`}>
                    {irrigationState ? 'Activado' : 'Desactivado'}
                  </div>
                </div>
                <Button 
                  variant={irrigationState ? "secondary" : "success"} 
                  onClick={handleIrrigationToggle}
                  disabled={loading || !isConnected}
                  className="w-100"
                >
                  {loading ? 'Procesando...' : (irrigationState ? 'Desactivar Riego' : 'Activar Riego')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Alert variant="info">
          <strong>Nota:</strong> En esta versión de demostración, los controles no están conectados al hardware real.
          En la implementación final, estos botones enviarán comandos al dispositivo ESP32 para controlar los actuadores.
        </Alert>
      </Card.Body>
    </Card>
  );
};

export default Controls;