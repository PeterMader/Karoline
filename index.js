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
    Context: require('./interpreter/context.js'),
    Value: require('./interpreter/value.js'),
    KarolineNumber: require('./interpreter/karoline-number.js'),
    KarolineObject: require('./interpreter/karoline-object.js'),
    Class: require('./interpreter/class.js'),
    Procedure: require('./interpreter/procedure.js'),

    Parser: require('./parser/parser.js'),
    Token: require('./parser/token.js'),
    // TODO: require all classes

    EventEmitter: require('./util/event-emitter.js'),
    Error: require('./util/error.js'),
    SyntaxError: require('./util/syntax-error.js'),
    TypeError: require('./util/type-error.js')
  }
})
