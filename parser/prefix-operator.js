const ParserSymbol = require('./parser-symbol.js')

const PrefixOperator = module.exports = class extends ParserSymbol {

  constructor (options) {
    super(options)
  }

  defaultNullDenotation (self, parser) {
    const item = this.clone()
    item.first = parser.expression(this.bindingPower)
    item.operatorType = ParserSymbol.OPERATOR_TYPE_UNARY
    return item
  }

}
