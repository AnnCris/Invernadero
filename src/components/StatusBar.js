import React from 'react';
import { Button, Badge } from 'react-bootstrap';

const StatusBar = ({ isConnected, lastUpdate, onManualUpdate, esclavos = [false, false, false, false] }) => {
  return (
    <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
      <div className="d-flex flex-wrap align-items-center">
        <span className="me-3">
          Estado: 
          {isConnected ? (
            <span className="text-success fw-bold"> Conectado</span>
          ) : (
            <span className="text-danger fw-bold"> Desconectado</span>
          )}
        </span>
        
        <div className="me-3">
          <span className="me-2">Esclavos:</span>
          {esclavos.map((conectado, index) => (
            <Badge 
              key={index} 
              bg={conectado ? "success" : "danger"} 
              className="me-1"
            >
              E{index + 1}
            </Badge>
          ))}
        </div>
        
        {lastUpdate && (
          <span>
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      <Button 
        variant="primary" 
        size="sm" 
        onClick={onManualUpdate}
        disabled={!isConnected}
      >
        Actualizar
      </Button>
    </div>
  );
};

export default StatusBar;