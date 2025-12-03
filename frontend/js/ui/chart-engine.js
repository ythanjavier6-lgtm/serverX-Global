 // Motor de gráficos (simple, sin librería externa)
export class SimpleChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas?.getContext('2d');
  }

  drawLineChart(data, label) {
    if (!this.ctx) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.strokeStyle = '#0b5fff';
    this.ctx.lineWidth = 2;
    
    const xStep = width / (data.length - 1);
    const maxValue = Math.max(...data);
    const yScale = height / maxValue;
    
    this.ctx.beginPath();
    data.forEach((value, index) => {
      const x = index * xStep;
      const y = height - value * yScale;
      if (index === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    this.ctx.stroke();
  }

  drawBarChart(labels, values) {
    if (!this.ctx) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    this.ctx.clearRect(0, 0, width, height);
    const barWidth = width / labels.length;
    const maxValue = Math.max(...values);
    const yScale = height / maxValue;
    
    this.ctx.fillStyle = '#0b5fff';
    values.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * yScale;
      this.ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
    });
  }

  // NUEVAS FUNCIONES PARA ADMIN
  drawPieChart(labels, values, colors) {
    if (!this.ctx) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    
    this.ctx.clearRect(0, 0, width, height);
    
    const total = values.reduce((a, b) => a + b, 0);
    let currentAngle = 0;
    
    labels.forEach((label, index) => {
      const sliceAngle = (values[index] / total) * 2 * Math.PI;
      
      this.ctx.fillStyle = colors[index] || '#0b5fff';
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      this.ctx.closePath();
      this.ctx.fill();
      
      currentAngle += sliceAngle;
    });
  }

  drawAreaChart(data, fillColor = '#0b5fff') {
    if (!this.ctx) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    this.ctx.clearRect(0, 0, width, height);
    const xStep = width / (data.length - 1);
    const maxValue = Math.max(...data);
    const yScale = height / maxValue;
    
    this.ctx.fillStyle = fillColor + '33';
    this.ctx.strokeStyle = fillColor;
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, height);
    
    data.forEach((value, index) => {
      const x = index * xStep;
      const y = height - value * yScale;
      this.ctx.lineTo(x, y);
    });
    
    this.ctx.lineTo(width, height);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawColumnChart(data, labels, barColor = '#0b5fff') {
    if (!this.ctx) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const barWidth = width / data.length;
    const maxValue = Math.max(...data);
    const yScale = height / maxValue;
    
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = barColor;
    
    data.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * yScale;
      this.ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
    });
  }
}

export function createChart(canvasId) {
  return new SimpleChart(canvasId);
}
