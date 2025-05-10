import axios from 'axios';

class ApiService {
  constructor() {
    this.masterIp = localStorage.getItem('masterIp') || '192.168.10.228';
    this.baseUrl = `http://${this.masterIp}`;
  }

  setMasterIp(ip) {
    this.masterIp = ip;
    this.baseUrl = `http://${ip}`;
    localStorage.setItem('masterIp', ip);
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/datos_filtrados`, { timeout: 5000 });
      return {
        success: response.status === 200,
        data: response.data
      };
    } catch (error) {
      console.error('Error al probar conexión:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getData() {
    try {
      const response = await axios.get(`${this.baseUrl}/datos_filtrados`, { timeout: 5000 });
      if (response.status === 200) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: `Error de conexión: ${response.status}`
        };
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getSystemStatus() {
    try {
      const response = await axios.get(`${this.baseUrl}/estado`, { timeout: 5000 });
      if (response.status === 200) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: `Error al obtener estado: ${response.status}`
        };
      }
    } catch (error) {
      console.error('Error al obtener estado del sistema:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async resetEmergency() {
    try {
      const response = await axios.post(`${this.baseUrl}/reset_emergencia`, {}, { timeout: 5000 });
      return {
        success: response.status === 200,
        message: 'Emergencia reiniciada correctamente'
      };
    } catch (error) {
      console.error('Error al reiniciar emergencia:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Crear una instancia única del servicio
const apiServiceInstance = new ApiService();

// Exportar la instancia del servicio
export default apiServiceInstance;