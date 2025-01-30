
import { Display, createServer } from './index.js'
import { layout, devices, nullDevices, options } from './config/config.js'


if (process.env.NODE_ENV === 'production') {
    Display.configure(layout, devices, options)
} else {
    Display.configure(layout, nullDevices, options)
}
const {app, server} = createServer()