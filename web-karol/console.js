const {EventEmitter} = require('../index.js')

const Console = module.exports = class extends EventEmitter {

  constructor (output, input) {
    super()
    this.output = output
    this.input = input
  }

  createMessage (string) {
    const element = document.createElement('div')
    element.classList.add('console-message')
    const time = document.createElement('span')
    time.textContent = (new Date()).toTimeString()
    element.appendChild(time)
    const content = document.createElement('span')
    content.textContent = string
    element.appendChild(content)
    this.output.appendChild(element)
    return element
  }

  log () {
    let index
    let str = ''
    const args = Array.from(arguments)
    for (index in args) {
      str += args[index].toString() + ' '
    }
    const element = this.createMessage(str.slice(0, -1))
    element.classList.add('console-log-message')
    this.output.scrollTo(0, this.output.scrollHeight)
  }

  error (err) {
    const element = this.createMessage(`${err.position.line}:${err.position.column}: ${err.toString()}`)
    const stack = err.stack.slice().reverse()
    let index
    for (index in stack) {
      const stackItem = stack[index]
      const item = document.createElement('div')
      item.classList.add('console-error-stack-item')
      item.textContent = `${stackItem.position.line}:${stackItem.position.column}: ${stackItem.value}`
      element.appendChild(item)
    }
    element.classList.add('console-error-message')
    this.output.scrollTo(0, this.output.scrollHeight)
  }

  info (str) {
    const element = this.createMessage(str.toString())
    element.classList.add('console-info-message')
    this.output.scrollTo(0, this.output.scrollHeight)
  }

}
