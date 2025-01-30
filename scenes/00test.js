import Scene from '../src/Scene.js';
import createTask from '../src/Task.js';
import { TextView } from '../src/views/index.js';

const schema = {
  title: 'Clock',
  description: 'A simple clock widget that displays the current time.'
}

const task = createTask(() => {
  return {
    options: {},
  }
}, 'every 15 seconds')


const clock = function() {

  const padded = (n) => {
    return n < 10 ? `0${n}` : n;
  }
  
  const scene = new Scene();
  const userPrefers12HourFormat = true;
  const textStyle = {
    fontName: 'Futura',
    fontSize: 12,
  }
  
  let textView;
  scene.once('loaded', () => {
    textView = new TextView(' Lara ist\n toll <3', textStyle)
    scene.add(textView)
  })
  return scene;
}

export { clock as scene, schema, task }