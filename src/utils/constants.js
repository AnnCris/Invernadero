// Constantes de la aplicación
export const DEFAULT_MASTER_IP = '192.168.10.228';
export const INTERVALO_ACTUALIZACION = 5000; // ms

export const VARIABLES_INFO = {
  // Variables para el esclavo 1 (Invernadero)
  temperature: {
    label: 'Temperatura',
    unit: '°C',
    chartTitle: 'Temperatura (°C)',
    color: 'red'
  },
  humidity: {
    label: 'Humedad',
    unit: '%',
    chartTitle: 'Humedad (%)',
    color: 'blue'
  },
  pressure: {
    label: 'Presión',
    unit: 'hPa',
    chartTitle: 'Presión (hPa)',
    color: 'green'
  },
  light: {
    label: 'Luminosidad',
    unit: '',
    chartTitle: 'Luminosidad',
    color: 'orange'
  },
  rain_value: {
    label: 'Lluvia',
    unit: '',
    chartTitle: 'Sensor de Lluvia',
    color: 'cyan'
  },
  foco: {
    label: 'Foco',
    unit: '',
    chartTitle: 'Estado del Foco',
    color: 'yellow'
  },
  ventilador: {
    label: 'Ventilador',
    unit: '',
    chartTitle: 'Estado del Ventilador',
    color: 'lightblue'
  },
  
  // Variables para el esclavo 2 (Control de Humedad)
  humedad_inv1: {
    label: 'Humedad Inv. 1',
    unit: '%',
    chartTitle: 'Humedad Invernadero 1 (%)',
    color: 'purple'
  },
  humedad_inv2: {
    label: 'Humedad Inv. 2',
    unit: '%',
    chartTitle: 'Humedad Invernadero 2 (%)',
    color: 'teal'
  },
  nivel_agua: {
    label: 'Nivel Agua',
    unit: 'cm',
    chartTitle: 'Nivel del Agua (cm)',
    color: 'darkblue'
  }
};

export const FILTER_TYPES = {
  raw: {
    label: 'Original',
    color: 'blue'
  },
  kalman: {
    label: 'Kalman',
    color: 'red'
  },
  median: {
    label: 'Mediana',
    color: 'green'
  },
  exp: {
    label: 'Exponencial',
    color: 'purple'
  }
};

export const ESCLAVOS_INFO = {
  esclavo1: {
    nombre: 'Invernadero',
    color: '#4CAF50',
    tipo: 'ambiente',
    variables: ['temperature', 'humidity', 'pressure', 'light', 'rain_value']
  },
  esclavo2: {
    nombre: 'Control Humedad',
    color: '#2196F3',
    tipo: 'humedad',
    variables: ['humedad_inv1', 'humedad_inv2', 'nivel_agua']
  },
  esclavo3: {
    nombre: 'Invernadero B',
    color: '#FFC107',
    tipo: 'ambiente',
    variables: ['temperature', 'humidity', 'foco', 'ventilador']
  },
  esclavo4: {
    nombre: 'Invernadero A',
    color: '#9C27B0',
    tipo: 'ambiente',
    variables: ['temperature', 'humidity', 'foco', 'ventilador']
  }
};