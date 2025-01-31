import { Hono } from 'hono'
import { serve } from "@hono/node-server";
import { configureRoutes } from './api/index.js';
import SceneManager from './SceneManager.js'
import SceneTaskManager from './TaskManager.js';
import { startWebsocket } from './WebSocket.js';
import logger from './Logger.js'
import fs from 'fs/promises';
import path from 'path';

const defaults = {
  port: 3000,
  wsPort: 7071,
  sceneDir: './scenes'
}

const createServer = async (options) => {
  options = { ...defaults, ...options }
  const scenes = await SceneManager.sharedInstance().loadLocal(options.sceneDir);
  const taskManager = new SceneTaskManager(scenes)
  const app = new Hono()

  // Serve static files using a custom middleware
  app.get('/resources/*', async (c) => {
    const filePath = path.join('./resources', c.req.path.slice('/resources/'.length));
    try {
      const data = await fs.readFile(filePath);
      return c.body(data, 200, { 'Content-Type': 'application/octet-stream' });
    } catch (err) {
      return c.notFound();
    }
  });

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