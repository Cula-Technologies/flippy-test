import { Panels } from 'flipdisc'

const layout = [
    [7, 1],
    [8, 2],
    [9, 3],
    [10, 4],
    [11, 5],
    [12, 6],
];
const devices = [{
    path: process.env.USB_DEVICE ?? '/dev/ttyUSB0',
    addresses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    baudRate: 57600,
}]

const nullDevices = [{
    path: 'null',
    addresses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
}]

const options = {
    isMirrored: true,
    panel: Panels.AlfaZetaPanel
}

export {layout, devices, nullDevices, options}