((factory) => {
  module.exports = factory()
  if (typeof window === 'object') {
    window.Karoline = module.exports
  }
})(() => {
  require('babel-core/register')
  require('babel-polyfill')

  return {
    Interpreter: require('./interpreter/interpreter.js'),
    Value: require('./interpreter/value.js'),
    Number: require('./interpreter/number.js'),
    Procedure: require('./interpreter/procedure.js'),
    EventEmitter: require('./util/event-emitter.js'),
    Error: require('./util/error.js'),
    SyntaxError: require('./util/syntax-error.js'),
    TypeError: require('./util/type-error.js')
  }
})
