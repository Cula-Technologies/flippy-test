import { Hono } from 'hono'
import { serve } from "@hono/node-server";
import { configureRoutes } from './api/index.js';
import SceneManager from './SceneManager.js'
import SceneTaskManager from './TaskManager.js';
import { startWebsocket } from './WebSocket.js';
import { doPlaying } from './api/playing.js';
import logger from './Logger.js'
import fs from 'fs/promises';
import * as fssync from 'fs';
import path from 'path';
import * as os from 'os';

const defaults = {
  port: 3000,
  wsPort: 7071,
  sceneDir: './scenes'
}

const createServer = async (options) => {
  options = { ...defaults, ...options }
  const scenes = await SceneManager.sharedInstance().loadLocal(options.sceneDir);
  const taskManager = new SceneTaskManager(scenes);
  

  const app = new Hono()

  // Serve static files using a custom middleware
  app.get('/resources/*', async (c) => {
    const filePath = path.join('./resources', c.req.path.slice('/resources/'.length));
    try {
      const data = await fs.readFileSync(filePath);
      return c.body(data, 200, { 'Content-Type': 'application/octet-stream' });
    } catch (err) {
      return c.notFound();
    }
  });

  try {
    const jsonString = fssync.readFileSync(os.homedir() + '/playData.json', 'utf8');
    const data = JSON.parse(jsonString);
    doPlaying(data)
  } catch (error) {
    // just ignore
  }

  const server = serve({
    fetch: app.fetch,
    port: options.port,
  }, (info) => {
    logger.info(`Listening on http://localhost:${info.port}`)
  })
  startWebsocket(options.wsPort)  
  configureRoutes(app)

  return {
    app,
    server,
  }
}

export default createServer;