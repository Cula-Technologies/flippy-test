import { DotLottie } from '@lottiefiles/dotlottie-web';
import Module from './Module.js';

const defaultConfig = {
  autoplay: true,
  loop: true,
  speed: 1,
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
  
  async add(obj) {
    const loadingConfig = {canvas: this.canvas, ...this.config, src: obj.url };
    this.dotLottie = new DotLottie(loadingConfig);
    console.log('loading lottie', loadingConfig)
    this.dotLottie.load(loadingConfig);

    
    this.dotLottie.addEventListener('ready', (event) => {
      console.log('ready', event);
      this.dotLottie.play();
    })
    this.dotLottie.addEventListener('load', (event) => {
      console.log('load', event);
      this.dotLottie.play();
    })
    // this.dotLottie.addEventListener('frame', (event) => {
    //   console.log('frame', event);
    // })
    // this.dotLottie.addEventListener('render', (event) => {
    //   console.log('render', event);
    // }) 

    this.dotLottie.addEventListener('loadError', (event) => {
      console.log('error', event);
    })
  }

  render() {
    // find out if image has any values
    const imageData = this.canvas.getContext('2d').getImageData(0, 0, 100, 100).data;
    const notNullValues = imageData.filter((value) => value !== 0);
    // console.log('render', notNullValues.length);
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