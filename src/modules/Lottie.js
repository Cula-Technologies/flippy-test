import { DotLottie } from '@lottiefiles/dotlottie-web';
import Module from './Module.js';

const defaultConfig = {
  autoplay: true,
  loop: true,
  speed: 1,
  useFrameInterpolation: false,
  renderConfig: {
    autoResize: true,
    devicePixelRatio: 1,
  }
}

export default class Lottie extends Module {
  constructor(canvas, options = {}) {
    super();
    this.canvas = canvas;
    this.config = { ...defaultConfig };
  }
  
  async load() {
    return true;
  }
  
  async add({url, loop}) {
    const loadingConfig = {canvas: this.canvas, ...this.config, src: url, loop };
    this.dotLottie = new DotLottie(loadingConfig);
    this.dotLottie.load(loadingConfig);

    
    this.dotLottie.addEventListener('ready', (event) => {
      this.dotLottie.play();
    })
    this.dotLottie.addEventListener('load', (event) => {
      this.dotLottie.play();
    })
    this.dotLottie.addEventListener('loadError', (event) => {
      console.log('error', event);
    })
  }

  render() {
  }

  destroy() {
    if (this.dotLottie) {
      this.dotLottie.destroy();
    }
  }

  static isValidInstance(view) {
    return view.isLottie === true;
  }
}