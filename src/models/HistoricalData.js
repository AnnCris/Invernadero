// Clase para manejar datos históricos
class HistoricalData {
  constructor(maxPoints = 100) {
    this.maxPoints = maxPoints;
    this.timestamps = [];
    this.values = [];
  }

  addPoint(timestamp, value) {
    // Agrega un solo punto de dato
    if (this.timestamps.length >= this.maxPoints) {
      this.timestamps.shift();
      this.values.shift();
    }
    
    this.timestamps.push(timestamp);
    this.values.push(value);
  }
  
  getData() {
    // Devuelve copias de los datos
    return {
      timestamps: [...this.timestamps],
      values: [...this.values]
    };
  }
}

export default HistoricalData;