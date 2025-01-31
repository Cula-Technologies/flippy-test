import Scene from '../src/Scene.js';

const schema = {
  title: 'Lottie',
  sceneId: 'lottie',
  description: 'A lottie animation player.',
  properties: {
    url: {
      type: 'string',
      description: 'The URL of the lottie file.',
      optional: true,
    },
    loop: {
      type: 'boolean',
      description: 'Whether to repeat the animation.',
      default: true,
      optional: true,
    },
  }
}

const lottie = function(props = { url: 'https://storage.googleapis.com/flippy/lunch2.lottie', loop: true }) {
  const scene = new Scene();
  scene.on('loaded', () => {
    scene.add({url: props.url, isLottie: true, loop: props.loop});
  })
  return scene;
}

export { lottie as scene, schema }