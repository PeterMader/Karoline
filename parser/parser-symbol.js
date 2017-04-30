const Token = require('./token.js')
const SyntaxError = require('../util/syntax-error.js')

const ParserSymbol = module.exports = class extends Token {

  constructor (options) {
    super(options)
    this.bindingPower = options.bindingPower || 0
    this.operatorType = ParserSymbol.OPERATOR_TYPE_UNARY

    this._nullDenotation = typeof options.nullDenotation === 'function' ? options.nullDenotation : this.defaultNullDenotation
    this._leftDenotation = typeof options.leftDenotation === 'function' ? options.leftDenotation : this.defaultLeftDenotation
  }

  clone () {
    return new ParserSymbol(this)
  }

  nullDenotation (self, parser) {
    const item = this._nullDenotation(self, parser)
    item.position = self.position
    return item
  }

  leftDenotation (self, left, parser) {
    const item = this._leftDenotation(self, left, parser)
    item.position = self.position
    return item
  }

  defaultNullDenotation (self, parser) {
    return this
  }

  defaultLeftDenotation (self, left, parser) {
    throw new SyntaxError(`undefined left denotation`)
  }

}

ParserSymbol.OPERATOR_TYPE_UNARY = 'OPERATOR_TYPE_UNARY'
ParserSymbol.OPERATOR_TYPE_BINARY = 'OPERATOR_TYPE_BINARY'
