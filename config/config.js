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
    path: '/dev/tty.usbserial-BG009RN1',
    addresses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    baudRate: 57600,
}]

const options = {
    isMirrored: true,
    panel: Panels.AlfaZetaPanel
}

export {layout, devices, options}