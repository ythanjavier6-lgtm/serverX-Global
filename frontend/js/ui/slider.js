 // Componente Slider
export class Slider {
  constructor(id, options = {}) {
    this.element = document.getElementById(id);
    this.items = [];
    this.currentIndex = 0;
    this.autoplay = options.autoplay ?? true;
    this.interval = options.interval ?? 5000;
    this.callbacks = { onSlideChange: null };
    this.init();
  }

  init() {
    this.items = this.element?.querySelectorAll('.slide') || [];
    this.showSlide(0);
    if (this.autoplay) {
      this.startAutoplay();
    }
  }

  showSlide(index) {
    this.items.forEach((item, i) => {
      item.style.display = i === index ? 'block' : 'none';
    });
    this.currentIndex = index;
    if (this.callbacks.onSlideChange) {
      this.callbacks.onSlideChange(index);
    }
  }

  nextSlide() {
    const nextIndex = (this.currentIndex + 1) % this.items.length;
    this.showSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.showSlide(prevIndex);
  }

  startAutoplay() {
    this.autoplayTimer = setInterval(() => this.nextSlide(), this.interval);
  }

  stopAutoplay() {
    clearInterval(this.autoplayTimer);
  }

  onSlideChange(callback) {
    this.callbacks.onSlideChange = callback;
  }

  goToSlide(index) {
    if (index >= 0 && index < this.items.length) {
      this.showSlide(index);
    }
  }

  getTotalSlides() {
    return this.items.length;
  }

  getCurrentSlide() {
    return this.currentIndex;
  }
}

export function createSlider(id, options = {}) {
  return new Slider(id, options);
}
