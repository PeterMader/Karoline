const EventEmitter = require('../util/event-emitter.js')
const AssignmentOperator = require('./assignment-operator.js')
const ParserSymbol = require('./parser-symbol.js')
const PrefixOperator = require('./prefix-operator.js')
const InfixOperator = require('./infix-operator.js')
const Token = require('./token.js')
const Parser = require('./parser.js')
const SyntaxError = require('../util/syntax-error.js')

const KarolineParser = module.exports = class extends EventEmitter {

  constructor () {
    super()
    this.parser = new Parser()
    this.prepareParser()
  }

  processBlock (...endTokens) {
    const {parser} = this
    const block = []
    while (endTokens.indexOf(parser.token.value) === -1) {
      block.push(parser.expression(0))
      if (parser.token.value === '#end') {
        throw new SyntaxError(`syntax error: unexpected end of script, expected one of these tokens: ${endTokens.join(', ')}`)
      }
    }

    return block
  }

  prepareParser () {
    const {parser} = this
    parser.tokenizer.addKeyWord('repeat')
    parser.tokenizer.addKeyWord('times')
    parser.tokenizer.addKeyWord('while')
    parser.tokenizer.addKeyWord('*repeat')
    parser.registerSymbol(new PrefixOperator({
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
        parser.nextToken()
        return item
      }
    }))
    parser.registerSymbol(new ParserSymbol({
      value: '*repeat'
    }))
    parser.registerSymbol(new ParserSymbol({
      value: 'times'
    }))
    parser.registerSymbol(new ParserSymbol({
      value: 'while'
    }))

    parser.tokenizer.addKeyWord('procedure')
    parser.tokenizer.addKeyWord('*procedure')
    parser.registerSymbol(new PrefixOperator({
      value: 'procedure',
      nullDenotation: (self) => {
        const item = self.clone()
        if (parser.token.type !== Token.TOKEN_TYPE_IDENTIFIER) {
          throw new SyntaxError(`expected identifier as name for procedure, got ${parser.token.type} token`)
        }
        item.first = parser.token
        parser.nextToken()
        item.block = this.processBlock('*procedure')
        parser.nextToken()
        return item
      }
    }))
    parser.registerSymbol(new ParserSymbol({
      value: '*procedure'
    }))

    parser.tokenizer.addKeyWord('function')
    parser.tokenizer.addKeyWord('*function')
    parser.registerSymbol(new PrefixOperator({
      value: 'function',
      nullDenotation: (self) => {
        const item = self.clone()
        item.params = []
        if (parser.token.type === Token.TOKEN_TYPE_IDENTIFIER) {
          item.name = parser.token
          parser.nextToken()
        }
        parser.nextToken('(')
        if (parser.token.value === ')') {
          // no params
          parser.nextToken()
          item.block = this.processBlock('*function')
          parser.nextToken()
          return item
        }

        while (true) {
          if (parser.token.type !== Token.TOKEN_TYPE_IDENTIFIER) {
            throw new SyntaxError(`expected identifier as parameter name`)
          }
          item.params.push(parser.token)
          parser.nextToken()
          if (parser.token.value === ')') {
            break
          }
          if (parser.token.value !== ',') {
            throw new SyntaxError(`expected ',' token, got ${parser.token.value}`)
          }
          parser.nextToken()
        }

        parser.nextToken()
        item.block = this.processBlock('*function')
        parser.nextToken()
        return item
      }
    }))
    parser.registerSymbol(new ParserSymbol({
      value: '*function'
    }))

    parser.tokenizer.addKeyWords(['if', '*if', 'else', 'then'])
    parser.registerSymbol(new PrefixOperator({
      value: 'if',
      nullDenotation: (self) => {
        const item = self.clone()
        item.condition = parser.expression(0)
        parser.nextToken('then')
        item.ifBlock = this.processBlock('*if', 'else')
        if (parser.token.value === 'else') {
          parser.nextToken()
          item.elseBlock = this.processBlock('*if')
        }
        parser.nextToken()
        return item
      }
    }))
    parser.registerSymbol(new ParserSymbol({
      value: '*if'
    }))
    parser.registerSymbol(new ParserSymbol({
      value: 'then'
    }))
    parser.registerSymbol(new ParserSymbol({
      value: 'else'
    }))

    parser.tokenizer.addKeyWords('(),'.split(''))
    parser.registerSymbol(new InfixOperator({
      value: '(',
      bindingPower: 80,
      nullDenotation: (self) => {
        const item = parser.expression(0)
        parser.nextToken(')')
        return item
      },
      leftDenotation: (self, left) => {
        const item = self.clone()
        item.operatorType = ParserSymbol.OPERATOR_TYPE_BINARY
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
            throw new SyntaxError(`expected ',' token, got ${parser.token.value}`)
          }
          parser.nextToken()
        }
        parser.nextToken()
        return item
      }
    }))
    parser.registerSymbol(new ParserSymbol({
      value: ')'
    }))
    parser.registerSymbol(new ParserSymbol({
      value: ','
    }))

    parser.tokenizer.addKeyWord('var')
    parser.registerSymbol(new PrefixOperator({
      value: 'var',
      nullDenotation: (self) => {
        const item = self.clone()
        item.identifiers = []
        if (parser.token.type !== Token.TOKEN_TYPE_IDENTIFIER) {
          throw new SyntaxError(`expected identifier, got ${parser.token.type} token`)
        }
        while (parser.token.type === Token.TOKEN_TYPE_IDENTIFIER) {
          const identifier = parser.token
          parser.nextToken()
          if (parser.token.value === '=') {
            parser.nextToken('=')
            const value = parser.expression(0)
            item.identifiers.push({
              identifier,
              value
            })
          } else {
            item.identifiers.push({
              identifier
            })
          }
          if (parser.token.value !== ',') {
            break
          }
          parser.nextToken()
        }
        return item
      }
    }))

    parser.tokenizer.addKeyWord('const')
    parser.registerSymbol(new PrefixOperator({
      value: 'const',
      nullDenotation: (self) => {
        const item = self.clone()
        item.identifiers = []
        if (parser.token.type !== Token.TOKEN_TYPE_IDENTIFIER) {
          throw new SyntaxError(`expected identifier, got ${parser.token.type} token`)
        }
        while (parser.token.type === Token.TOKEN_TYPE_IDENTIFIER) {
          const identifier = parser.token
          parser.nextToken()
          parser.nextToken('=')
          const value = parser.expression(0)
          item.identifiers.push({
            identifier,
            value
          })
          if (parser.token.value !== ',') {
            break
          }
          parser.nextToken()
        }
        return item
      }
    }))

    parser.tokenizer.addKeyWords(['[', ']'])
    parser.registerSymbol(new InfixOperator({
      value: '[',
      bindingPower: 75,
      leftDenotation: (self, left) => {
        const item = self.clone()
        item.first = left
        item.second = parser.expression(0)
        parser.nextToken(']')
        return item
      }
    }))
    parser.registerSymbol(new ParserSymbol({
      value: ']'
    }))

    parser.tokenizer.addKeyWord('return')
    parser.registerSymbol(new PrefixOperator({
      value: 'return'
    }))

    parser.tokenizer.addKeyWord('new')
    parser.registerSymbol(new PrefixOperator({
      value: 'new',
      bindingPower: 70
    }))

    parser.tokenizer.addKeyWord('.')
    parser.registerSymbol(new InfixOperator({
      value: '.',
      bindingPower: 75,
      leftDenotation: (self, left) => {
        const item = self.clone()
        item.first = left
        if (parser.token.type !== Token.TOKEN_TYPE_IDENTIFIER) {
          throw new SyntaxError(`expected identifier after "." operator`)
        }
        item.second = parser.token
        parser.nextToken()
        return item
      }
    }))

    parser.tokenizer.addKeyWord('&&')
    parser.registerSymbol(new InfixOperator({
      value: '&&',
      bindingPower: 30,
    }))

    parser.tokenizer.addKeyWord('||')
    parser.registerSymbol(new InfixOperator({
      value: '||',
      bindingPower: 28,
    }))

    parser.tokenizer.addKeyWord('<')
    parser.registerSymbol(new InfixOperator({
      value: '<',
      bindingPower: 45,
    }))

    parser.tokenizer.addKeyWord('>')
    parser.registerSymbol(new InfixOperator({
      value: '>',
      bindingPower: 45,
    }))

    parser.tokenizer.addKeyWord('*')
    parser.registerSymbol(new InfixOperator({
      value: '*',
      bindingPower: 60,
    }))

    parser.tokenizer.addKeyWord('/')
    parser.registerSymbol(new InfixOperator({
      value: '/',
      bindingPower: 60,
    }))

    parser.tokenizer.addKeyWord('+')
    parser.registerSymbol(new InfixOperator({
      value: '+',
      bindingPower: 50,
      nullDenotation: PrefixOperator.prototype.defaultNullDenotation
    }))

    parser.tokenizer.addKeyWord('-')
    parser.registerSymbol(new InfixOperator({
      value: '-',
      bindingPower: 50,
      nullDenotation: PrefixOperator.prototype.defaultNullDenotation
    }))

    parser.tokenizer.addKeyWord('==')
    parser.registerSymbol(new InfixOperator({
      value: '==',
      bindingPower: 40
    }))

    parser.tokenizer.addKeyWord('=')
    parser.registerSymbol(new AssignmentOperator({
      value: '='
    }))

    parser.tokenizer.addKeyWord(';')
    parser.registerSymbol(new ParserSymbol({
      value: ';',
      bindingPower: -1
    }))
  }

}
