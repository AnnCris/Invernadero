import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import apiService from '../services/api';
import { DEFAULT_MASTER_IP } from '../utils/constants';

const ConfigPanel = ({ onConnectionSuccess, onPollStart, onPollStop, polling }) => {
  const [masterIp, setMasterIp] = useState(apiService.masterIp || DEFAULT_MASTER_IP);
  const [isConnected, setIsConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Para comenzar, haga clic en \'Probar Conexión\'');
  const [statusType, setStatusType] = useState('info');

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMessage('Probando conexión...');
    setStatusType('info');
    
    try {
      apiService.setMasterIp(masterIp);
      const result = await apiService.testConnection();
      
      if (result.success) {
        setIsConnected(true);
        setStatusMessage('Conexión exitosa!');
        setStatusType('success');
        
        // Verificar estructura de datos
        let checkMessage = '';
        if (result.data?.esclavo1) {
          checkMessage += 'Datos del esclavo 1 disponibles.\n';
          
          if (result.data.esclavo1.filtros) {
            checkMessage += 'Datos de filtros disponibles.';
          } else {
            checkMessage += 'Advertencia: Datos de filtros no encontrados.';
          }
        } else {
          checkMessage += 'Advertencia: Datos del esclavo 1 no encontrados.';
        }
        
        setStatusMessage('Conexión exitosa!\n' + checkMessage);
        onConnectionSuccess(result.data);
      } else {
        setIsConnected(false);
        setStatusMessage(`Error de conexión: ${result.error}`);
        setStatusType('danger');
      }
    } catch (error) {
      setIsConnected(false);
      setStatusMessage(`Error: ${error.message}`);
      setStatusType('danger');
    } finally {
      setTesting(false);
    }
  };

  const handleStartPolling = () => {
    onPollStart();
  };

  const handleStopPolling = () => {
    onPollStop();
  };

  return (
    <Card className="mb-3">
      <Card.Header>Configuración</Card.Header>
      <Card.Body>
        <Form className="d-flex align-items-center mb-3">
          <Form.Group className="me-2">
            <Form.Label>IP del Maestro:</Form.Label>
            <Form.Control 
              type="text" 
              value={masterIp} 
              onChange={(e) => setMasterIp(e.target.value)}
              disabled={polling}
            />
          </Form.Group>
          
          <div className="d-flex align-items-end">
            <Button 
              variant="primary" 
              onClick={handleTestConnection} 
              disabled={testing || polling}
              className="me-2"
            >
              {testing ? 'Probando...' : 'Probar Conexión'}
            </Button>
            
            <Button 
              variant="success" 
              onClick={handleStartPolling} 
              disabled={!isConnected || polling}
              className="me-2"
            >
              Iniciar Monitoreo
            </Button>
            
            <Button 
              variant="danger" 
              onClick={handleStopPolling} 
              disabled={!polling}
            >
              Detener Monitoreo
            </Button>
          </div>
        </Form>
        
        <Alert variant={statusType}>
          {statusMessage.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </Alert>
      </Card.Body>
    </Card>
  );
};

export default ConfigPanel;