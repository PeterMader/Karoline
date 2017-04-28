Karol.InfixOperator = class extends Karol.ParserSymbol {

  constructor (options) {
    super(options)
  }

  defaultLeftDenotation (self, first, parser) {
    const item = this.clone()
    item.first = first
    item.second = parser.expression(this.bindingPower)
    item.operatorType = Karol.ParserSymbol.OPERATOR_TYPE_BINARY
    return item
  }

}
