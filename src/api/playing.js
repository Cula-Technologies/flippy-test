import SceneManager from '../SceneManager.js'
import * as fs from 'fs'; 
import * as os from 'os';

const postPlaying = async (c) => {
  const manager = SceneManager.sharedInstance();
  const data  = await c.req.json()
  if (data?.id === undefined || data?.id >= manager.scenes.length) {
    return c.notFound();
  }

  await doPlaying(data);
  return c.json(manager.playing.info)
}

const doPlaying = async (data) => {
  const manager = SceneManager.sharedInstance();
  await manager.play(data);
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(os.homedir() + '/playData.json', jsonData, {flag: 'w+'});
  } catch (error) {
    console.log('error writing file', error)
  }
}

const postPlayingToggle = async (c) => {
  const manager = SceneManager.sharedInstance();
  manager.playing.toggle()
  return c.json(manager.playing.info)
}

const postPlayingResume = async (c) => {
  const manager = SceneManager.sharedInstance();
  manager.playing.resume()
  return c.status(200)
}

const postPlayingPause = async (c) => {
  const manager = SceneManager.sharedInstance();
  manager.playing.stop()
  return c.status(200)
}

const getPlaying = async (c) => {
  const manager = SceneManager.sharedInstance();
  return c.json(manager.playing.info)
}
 
const postPlayingUserClear = async (c) => {
  const manager = SceneManager.sharedInstance();
  manager.playing.scene?.user.clear()
  manager.playing.scene?.render();

  return c.status(200)
}

export {
  doPlaying,
  postPlaying,
  postPlayingPause,
  postPlayingResume,
  postPlayingToggle,
  postPlayingUserClear,
  getPlaying
}