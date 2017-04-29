document.addEventListener('DOMContentLoaded', () => {

  const Application = require('./application.js')
  const Console = require('./console.js')
  const {Interpreter} = require('../index.js')

  const canvas = document.getElementById('canvas')
  const editor = document.getElementById('editor')
  const interpreter = new Interpreter()
  const karolConsole = new Console(document.getElementById('console-output'), document.getElementById('console-input'))
  const app = window.app = new Application(interpreter, canvas, karolConsole)
  app.render()

  const runButton = document.getElementById('run')
  runButton.addEventListener('click', () => {
    if (interpreter.stopped) {
      interpreter.run(editor.value).then(console.log).catch(console.error)
    } else if (!interpreter.running) {
      interpreter.unpause()
    }
  })
  runButton.disabled = false

  interpreter.on('run', () => {
    runButton.disabled = true
    pauseButton.disabled = false
    stopButton.disabled = false
  })
  interpreter.on('unpause', () => {
    runButton.disabled = true
    pauseButton.disabled = false
    stopButton.disabled = false
  })

  const pauseButton = document.getElementById('pause')
  pauseButton.addEventListener('click', () => {
    interpreter.pause() // can do that safely because interpreter won't do anything if it isn't running
  })
  pauseButton.disabled = true

  interpreter.on('pause', () => {
    runButton.disabled = false
    pauseButton.disabled = true
    stopButton.disabled = false
  })

  const stopButton = document.getElementById('stop')
  stopButton.addEventListener('click', () => {
    interpreter.stop()
  })
  stopButton.disabled = true

  interpreter.listen(['finish', 'stop'], () => {
    runButton.disabled = false
    pauseButton.disabled = true
    stopButton.disabled = true
  })

})
