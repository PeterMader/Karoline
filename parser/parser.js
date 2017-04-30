const Tokenizer = require('./tokenizer.js')
const ParserSymbol = require('./parser-symbol.js')
const SyntaxError = require('../util/syntax-error.js')
const Token = require('./token.js')

const Parser = module.exports = class {

  constructor () {
    this.tokenizer = new Tokenizer([])
    this.symbols = {}
    this.token = null

    this.tokens = []
    this.currentIndex = 0

    this.registerSymbol(new ParserSymbol({
      value: '#end',
      bindingPower: 0
    }))
  }

  nextToken (expected) {
    const token = this.tokens[this.currentIndex]
    if (expected && this.token.value !== expected) {
      throw new SyntaxError(`Expected token "${expected}", got "${this.token.value}"`)
      this.token = this.symbols['#end']
      return
    }
    if (typeof token === 'undefined') {
      this.token = this.symbols['#end']
      return
    }
    if (token.type === Token.TOKEN_TYPE_KEY_WORD) {
      this.token = this.symbols[token.value]
      if (typeof this.token === 'undefined') {
        throw new SyntaxError(`Undefined key word "${token.value}"`)
        this.token = this.symbols['#end']
        return
      }
    } else {
      this.token = new ParserSymbol(token)
    }
    this.currentIndex += 1
  }

  registerSymbol (symbol) {
    this.symbols[symbol.value] = symbol
  }

  parse (string) {
    this.currentIndex = 0
    this.tokens = this.tokenizer.tokenize(string)
    this.nextToken()
    const expressions = []
    while (this.token.value !== '#end') {
      expressions.push(this.expression(0))
    }
    return expressions
  }

  expression (rightBindingPower) {
    // skip all semicolons
    while (this.token.value === ';') {
      this.nextToken()
    }

    if (this.token.value === '#end') {
      throw new SyntaxError(`Unexpected end of line, expected an expression.`)
      return null
    }

    let oldToken = this.token
    this.nextToken()
    let left = oldToken.nullDenotation(oldToken, this)
    while (rightBindingPower < this.token.bindingPower) {
      oldToken = this.token
      this.nextToken()
      left = oldToken.leftDenotation(oldToken, left, this)
    }
    return left
  }

}
