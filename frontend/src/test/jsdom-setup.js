import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
})

global.window = dom.window
global.document = dom.window.document
global.navigator = dom.window.navigator
global.HTMLElement = dom.window.HTMLElement
global.HTMLDivElement = dom.window.HTMLDivElement
global.HTMLButtonElement = dom.window.HTMLButtonElement
global.HTMLInputElement = dom.window.HTMLInputElement
global.Event = dom.window.Event
global.MouseEvent = dom.window.MouseEvent
global.KeyboardEvent = dom.window.KeyboardEvent
global.DOMException = dom.window.DOMException

// Copy other window properties
Object.getOwnPropertyNames(dom.window)
  .filter(property => typeof global[property] === 'undefined')
  .slice(0, 30) // Limit to first 30 to avoid taking too long
  .forEach(property => {
    if (typeof dom.window[property] === 'object') {
      global[property] = dom.window[property]
    }
  })