Karol.AssignmentOperator = class extends Karol.InfixOperator {

  constructor (options) {
    super(options)

    this.isAssignment = true
    this.bindingPower = 10
  }

  defaultLeftDenotation (self, first, parser) {
    if (first.type !== Karol.Token.TOKEN_TYPE_IDENTIFIER) {
      throw new Karol.SyntaxError(`invalid assignment left-hand side: expected identifier, got ${first.type}`)
    }
    const item = self.clone()
    item.first = first
    item.isAssignment = true
    item.second = parser.expression(self.bindingPower)
    item.operatorType = Karol.ParserSymbol.OPERATOR_TYPE_BINARY
    return item
  }

}
