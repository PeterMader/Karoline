const ParserSymbol = require('./parser-symbol.js')

const InfixOperator = module.exports = class extends ParserSymbol {

  constructor (options) {
    super(options)
  }

  defaultNullDenotation (self, parser) {
    throw new SyntaxError(`undefined null denotation`)
  }

  defaultLeftDenotation (self, first, parser) {
    const item = this.clone()
    item.first = first
    item.second = parser.expression(this.bindingPower)
    item.operatorType = ParserSymbol.OPERATOR_TYPE_BINARY
    return item
  }

}
