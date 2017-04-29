const ParserSymbol = require('./parser-symbol.js')

const InfixOperator = module.exports = class extends ParserSymbol {

  constructor (options) {
    super(options)
  }

  defaultLeftDenotation (self, first, parser) {
    const item = this.clone()
    item.first = first
    item.second = parser.expression(this.bindingPower)
    item.operatorType = ParserSymbol.OPERATOR_TYPE_BINARY
    return item
  }

}
