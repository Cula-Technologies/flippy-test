import Scene from '../src/Scene.js';

const schema = {
  title: 'Lottie',
  description: 'A lottie animation player.',
  properties: {}
}

const lottie = function(props) {
  const scene = new Scene();
  scene.on('loaded', () => {
    scene.add({url: 'https://storage.googleapis.com/flippy/lunch2.lottie' , isLottie: true})
  })
  return scene;
}

export { lottie as scene, schema }