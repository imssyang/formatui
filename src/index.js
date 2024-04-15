import { version } from '../package.json';
import { UI, UISettings } from './ui.js'
import './css/ui.css'

function setOptions(options) {
    if (options?.url?.prefix)
        UISettings.url.prefix = options.url.prefix
}

function InitUI(options) {
    console.log('formatui version: ' + version);
    setOptions(options)
    new UI()
}

export { InitUI }