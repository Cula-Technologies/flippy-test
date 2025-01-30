
import { Display, createServer } from './index.js'
import { layout, devices, nullDevices, options } from './config/config.js'

Display.configure(layout, devices, options)
//Display.configure(layout, nullDevices, options)
const app = createServer()