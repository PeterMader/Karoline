Karol.KarolParser = class extends Karol.EventEmitter {

  constructor () {
    super()
    this.parser = new Karol.Parser()
    this.prepareParser()
  }

  prepareParser () {
    const {parser} = this
    parser.tokenizer.addKeyWord('repeat')
    parser.tokenizer.addKeyWord('times')
    parser.tokenizer.addKeyWord('while')
    parser.tokenizer.addKeyWord('*repeat')
    parser.registerSymbol(new Karol.PrefixOperator({
      value: 'repeat',
      bindingPower: 0,
      nullDenotation: (self) => {
        const item = self.clone()
        const next = parser.expression(0)
        if (next.value === 'while') {
          item.condition = parser.expression(0)
        } else {
          item.times = next
          parser.nextToken('times')
        }
        item.block = this.processBlock('*repeat')
        return item
      }
    }))
    parser.registerSymbol(new Karol.ParserSymbol({
      value: '*repeat'
    }))
    parser.registerSymbol(new Karol.ParserSymbol({
      value: 'times'
    }))
    parser.registerSymbol(new Karol.ParserSymbol({
      value: 'while'
    }))

    parser.tokenizer.addKeyWord('procedure')
    parser.tokenizer.addKeyWord('*procedure')
    parser.registerSymbol(new Karol.PrefixOperator({
      value: 'procedure',
      nullDenotation: (self) => {
        const item = self.clone()
        if (parser.token.type !== Karol.Token.TOKEN_TYPE_IDENTIFIER) {
          throw new Karol.SyntaxError(`expected identifier as name for procedure, got ${parser.token.type} token`)
        }
        item.first = parser.token
        parser.nextToken()
        item.block = this.processBlock('*procedure')
        return item
      }
    }))
    parser.registerSymbol(new Karol.ParserSymbol({
      value: '*procedure'
    }))

    parser.tokenizer.addKeyWord('(')
    parser.tokenizer.addKeyWord(')')
    parser.tokenizer.addKeyWord(',')
    parser.registerSymbol(new Karol.InfixOperator({
      value: '(',
      bindingPower: 80,
      nullDenotation: (self) => {
        const item = parser.expression(0)
        parser.nextToken(')')
        return item
      },
      leftDenotation: (self, left) => {
        const item = self.clone()
        item.operatorType = Karol.ParserSymbol.OPERATOR_TYPE_BINARY
        item.first = left
        item.args = []
        if (parser.token.value === ')') {
          parser.nextToken()
          return item
        }
        while (true) {
          // parse the new argument
          item.args.push(parser.expression(0))
          if (parser.token.value === ')') {
            break
          }
          if (parser.token.value !== ',') {
            throw new Karol.SyntaxError(`expected ',' token, got ${parser.token.value}`)
          }
          parser.nextToken()
        }
        parser.nextToken()
        return item
      }
    }))
    parser.registerSymbol(new Karol.ParserSymbol({
      value: ')'
    }))
    parser.registerSymbol(new Karol.ParserSymbol({
      value: ','
    }))

    parser.tokenizer.addKeyWord('*')
    parser.registerSymbol(new Karol.InfixOperator({
      value: '*',
      bindingPower: 60,
    }))

    parser.tokenizer.addKeyWord('/')
    parser.registerSymbol(new Karol.InfixOperator({
      value: '/',
      bindingPower: 60,
    }))

    parser.tokenizer.addKeyWord('+')
    parser.registerSymbol(new Karol.InfixOperator({
      value: '+',
      bindingPower: 50,
      nullDenotation: Karol.PrefixOperator.prototype.defaultNullDenotation
    }))

    parser.tokenizer.addKeyWord('-')
    parser.registerSymbol(new Karol.InfixOperator({
      value: '-',
      bindingPower: 50,
      nullDenotation: Karol.PrefixOperator.prototype.defaultNullDenotation
    }))

    parser.tokenizer.addKeyWord('==')
    parser.registerSymbol(new Karol.InfixOperator({
      value: '==',
      bindingPower: 40
    }))

    parser.tokenizer.addKeyWord('=')
    parser.registerSymbol(new Karol.AssignmentOperator({
      value: '='
    }))

    parser.tokenizer.addKeyWord(';')
    parser.registerSymbol(new Karol.ParserSymbol({
      value: ';',
      bindingPower: -1
    }))
  }

}
