((factory) => {
  if (typeof window === 'object') {
    window.Karoline = factory()
  } else if (typeof process === 'object') {
    module.exports = factory()
  }
})(() => {
  require('babel-core/register')
  require('babel-polyfill')
  
  return {
    Interpreter: require('./interpreter/interpreter.js'),
    Value: require('./interpreter/value.js'),
    Procedure: require('./interpreter/procedure.js'),
    EventEmitter: require('./util/event-emitter.js')
  }
})
