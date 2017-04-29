const Context = require('./context.js')
const Token = require('../parser/token.js')
const KarolineParser = require('../parser/karoline-parser.js')

const Interpreter = class extends KarolineParser {

  constructor () {
    super()
    this.nativeScope = {}
    this.context = new Context(new Token({
      value: '<main>',
      position: {
        line: 0,
        column: 0
      }
    }))

    this.speed = 500
    this.running = false
    this.stopped = true
  }

  setExecutionContext (context) {
    this.context = context
  }

  processBlock (endToken) {
    const {parser} = this
    const block = []
    while (parser.token.value !== endToken && parser.token.value !== '#end') {
      block.push(parser.expression(0))
    }
    if (parser.token.value === '#end') {
      throw new SyntaxError(`syntax error: unexpected end of script, expected ${endToken}`)
    }
    parser.nextToken(endToken)
    return block
  }

  addNativeProcedure (procedure) {
    this.nativeScope[procedure.name] = Value.createProcedure(procedure)
  }

  addNativeValue (name, value) {
    this.nativeScope[name] = value
  }

  createProcedure (name, block) {
    const {length} = block
    const procedure = new Procedure({
      cb: this.evaluateBlock.bind(this, block),
      name,
      userDefined: true,
      scope: this.context.scope
    })
    const value = Value.createProcedure(procedure)
    this.context.set(name, value)
    return value
  }

  cleanUp () {
    const {procedures} = this
    let index
    for (index in procedures) {
      if (procedures[index].userDefined) {
        delete procedures[index]
      }
    }

    this.context.clearCallStack()
    this.running = false
    this.stopped = true
  }

  throwTypeError (message, position) {
    throw new TypeError(message, position, this.context.callStack)
  }

  wait (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  async run (source) {
    this.stopped = false
    this.running = true
    this.emit('run')
    let result
    try {
      const trees = this.parser.parse(source)
      this.emit('parse')
      result = await this.evaluateBlock(trees)
    } catch (e) {
      if (e !== Interpreter.EXECUTION_STOPPED) {
        this.emit('error', e)
        result = e
      } else {
        result = Value.createNull()
      }
    }
    this.cleanUp()
    this.emit('finish')
    return result
  }

  pause () {
    if (this.running) {
      this.running = false
      this.emit('pause')
    }
  }

  unpause () {
    if (!this.running && !this.stopped) {
      this.running = true
      this.emit('unpause')
    }
  }

  stop () {
    if (!this.stopped) {
      if (!this.running) {
        this.emit('unpause')
      }
      this.stopped = true
      this.emit('stop')
    }
  }

  async executeProcedure (procedure, args, caller) {
    this.context.callStack.push(caller)
    if (procedure.scope) {
      this.context.overrideScope(procedure.scope)
    }
    const result = (await procedure.execute(args)) || Value.createNull()
    if (procedure.scope) {
      this.context.restoreScope()
    }
    this.context.callStack.pop()
    return result
  }

  async evaluateBlock (block) {
    const {length} = block
    let value = Value.createNull()
    let i
    this.context.pushScope()
    for (i = 0; i < length; i += 1) {
      const index = i
      await this.wait(this.speed)
      if (!this.running && !this.stopped) {
        await this.awaitEvent('unpause')
      }
      if (this.stopped) {
        // break the promise chain
        throw Interpreter.EXECUTION_STOPPED
      }
      value = await this.evaluate(block[index], true)
      this.emit('statement')
    }
    this.context.popScope()
    return value
  }

  async evaluate (tree, isStatement) {
    if (tree.type === Token.TOKEN_TYPE_NUMBER) {
      return new Number(tree.value)
    }
    if (tree.type === Token.TOKEN_TYPE_STRING) {
      return Value.createString(tree.value)
    }
    if (tree.isAssignment) {
      const result = await this.evaluate(tree.second)
      this.context.set(tree.first.value, result)
      return result
    }
    if (tree.type === Token.TOKEN_TYPE_IDENTIFIER) {
      let value
      if (value = this.context.get(tree.value)) {
      } else if (this.nativeScope.hasOwnProperty(tree.value)) {
        value = this.nativeScope[tree.value]
      } else {
        this.throwTypeError(`undefined identifier ${tree.value}`)
      }

      if (isStatement && value.type === Value.PROCEDURE) {
        return this.executeProcedure(value.value, [], tree)
      } else {
        return value
      }
    }
    if (tree.value === '==') {
      const first = await this.evaluate(tree.first)
      const second = await this.evaluate(tree.second)
      return Value.createBoolean(first.type === second.type && first.value === second.value)
    }
    if (tree.value === '+') {
      if (tree.operatorType === ParserSymbol.OPERATOR_TYPE_BINARY) {
        const first = await this.evaluate(tree.first)
        const second = await this.evaluate(tree.second)
        return first[Value.OPERATOR_PLUS_BINARY].execute(first, second)
      } else {
        const first = await this.evaluate(tree.first)
        return first[Value.OPERATOR_PLUS_UNARY].execute(first)
      }
    }
    if (tree.value === '(' && tree.operatorType === ParserSymbol.OPERATOR_TYPE_BINARY) {
      let procedure
      if (tree.first.type === Token.TOKEN_TYPE_IDENTIFIER) {
        if (procedure = this.context.get(tree.first.value)) {
        } else if (this.nativeScope.hasOwnProperty(tree.first.value)) {
          procedure = this.nativeScope[tree.first.value]
        } else {
          this.throwTypeError(`undefined identifier ${tree.first.value}`)
        }
      } else {
        procedure = await this.evaluate(tree.first)
      }
      if (procedure.type === Value.PROCEDURE) {
        procedure = procedure.value
      } else {
        this.throwTypeError(`tried to call a value of type ${procedure.type}, expected a procedure`, tree.first.position)
      }
      const args = []
      let i
      for (i = 0; i < tree.args.length; i += 1) {
        args.push(await this.evaluate(tree.args[i]))
      }
      return this.executeProcedure(procedure, args, tree)
    }
    if (tree.value === 'repeat') {
      const {block} = tree
      if (typeof tree.times !== 'undefined') {
        // repeat ... times structure
        const times = await this.evaluate(tree.times)
        if (times.type !== Value.NUMBER) {
          throw new TypeError(`repeat structure: expected ${Value.NUMBER}, got ${times.type}`)
        }
        let i
        for (i = 0; i < times.value; i += 1) {
          await this.evaluateBlock(block)
        }
      } else  {
        // repeat while ... structure
        while ((await this.evaluate(tree.condition)).castToBoolean().value) {
          await this.evaluateBlock(block)
        }
      }
      return Value.createNull()
    }
    if (tree.value === 'procedure') {
      const {first, block} = tree
      const name = first.value // first is an identifier and does not have to be evalated
      return this.createProcedure(name, block)
    }
    this.throwTypeError(`unexpected symbol ${tree.value}`, tree.position)
  }

}

Interpreter.EXECUTION_STOPPED = Symbol('execution stopped')
