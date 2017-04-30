const SyntaxError = require('../util/syntax-error.js')
const InfixOperator = require('./infix-operator.js')
const ParserSymbol = require('./parser-symbol.js')
const Token = require('./token.js')

const AssignmentOperator = module.exports = class extends InfixOperator {

  constructor (options) {
    super(options)

    this.isAssignment = true
    this.bindingPower = 10
  }

  defaultLeftDenotation (self, first, parser) {
    if (first.type !== Token.TOKEN_TYPE_IDENTIFIER) {
      throw new SyntaxError(`invalid assignment left-hand side: expected identifier, got ${first.type}`)
    }
    const item = self.clone()
    item.first = first
    item.isAssignment = true
    item.second = parser.expression(self.bindingPower)
    item.operatorType = ParserSymbol.OPERATOR_TYPE_BINARY
    return item
  }

}
