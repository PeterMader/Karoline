Karol.Parser = class {

  constructor () {
    this.tokenizer = new Karol.Tokenizer([])
    this.symbols = {}
    this.token = null

    this.tokens = []
    this.currentIndex = 0

    this.registerSymbol(new Karol.ParserSymbol({
      value: '#end',
      bindingPower: 0
    }))
  }

  nextToken (expected) {
    const token = this.tokens[this.currentIndex]
    if (typeof token === 'undefined') {
      this.token = this.symbols['#end']
      return
    }
    if (expected && this.token.value !== expected) {
      throw new Karol.SyntaxError(`Expected token "${expected}", got "${this.token.value}"`)
      this.token = this.symbols['#end']
      return
    }
    if (token.type === Karol.Token.TOKEN_TYPE_KEY_WORD) {
      this.token = this.symbols[token.value]
      if (typeof this.token === 'undefined') {
        throw new Karol.SyntaxError(`Undefined key word "${token.value}"`)
        this.token = this.symbols['#end']
        return
      }
    } else {
      this.token = new Karol.ParserSymbol(token)
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
      throw new Karol.SyntaxError(`Unexpected end of line, expected an expression.`)
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
