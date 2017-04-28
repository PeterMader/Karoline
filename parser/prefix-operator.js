Karol.PrefixOperator = class extends Karol.ParserSymbol {

  constructor (options) {
    super(options)
  }

  defaultNullDenotation (self, parser) {
    const item = this.clone()
    item.first = parser.expression(this.bindingPower)
    item.operatorType = Karol.ParserSymbol.OPERATOR_TYPE_UNARY
    return item
  }

}
