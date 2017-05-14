const Context = require('./context.js')
const Token = require('../parser/token.js')
const Value = require('./value.js')
const KarolineObject = require('./karoline-object.js')
const KarolineNumber = require('./karoline-number.js')
const KarolineString = require('./karoline-string.js')
const KarolineBoolean = require('./karoline-boolean.js')
const KarolineProcedure = require('./karoline-procedure.js')
const Class = require('./class.js')
const TypeError = require('../util/type-error.js')
const ParserSymbol = require('../parser/parser-symbol.js')
const Procedure = require('./procedure.js')
const KarolineParser = require('../parser/karoline-parser.js')

const Interpreter = module.exports = class extends KarolineParser {

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

  addNativeProcedure (procedure) {
    this.nativeScope[procedure.name] = KarolineProcedure.createNativeInstance(procedure)
  }

  addNativeValue (name, value) {
    this.nativeScope[name] = value
  }

  createProcedure (name, block) {
    const {length} = block
    const proc = new Procedure({
      cb: this.evaluateBlock.bind(this, block),
      name,
      userDefined: true,
      scope: this.context.scope
    })
    const value = KarolineProcedure.createNativeInstance(proc)
    return value
  }

  createFunction (name, params, block) {
    const {length} = block
    const self = this
    const func = new Procedure({
      cb (args) {
        let index
        for (index in params) {
          if (args[index]) {
            self.context.set(params[index], args[index])
          } else {
            self.context.set(params[index], new KarolineObject())
          }
        }
        self.context.set('this', this)
        return self.evaluateBlock(block)
      },
      name,
      userDefined: true,
      scope: this.context.scope
    })
    const value = KarolineProcedure.createNativeInstance(func)
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
      this.emit('parse', trees)
      result = await this.evaluateBlock(trees)
    } catch (e) {
      if (e !== Interpreter.EXECUTION_STOPPED) {
        console.error(e)
        this.emit('error', e)
        result = e
      } else {
        result = new Value()
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

    let result
    try {
      result = (await procedure.execute(args)) || new Value()
    } catch (e) {
      if (e[Interpreter.RETURN]) {
        result = e
      } else {
        throw e
      }
    }
    if (procedure.scope) {
      this.context.restoreScope()
    }
    this.context.callStack.pop()
    return result
  }

  async evaluateBlock (block) {
    const {length} = block
    let value = new Value()
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
      return KarolineNumber.createNativeInstance(tree.value)
    }

    if (tree.type === Token.TOKEN_TYPE_STRING) {
      return KarolineString.createNativeInstance(tree.value)
    }

    if (tree.isAssignment) {
      const result = await this.evaluate(tree.second)
      if (tree.first.type === Token.TOKEN_TYPE_IDENTIFIER) {
        const identifier = this.context.get(tree.first.value)
        if (!identifier) {
          this.throwTypeError(`trying to set a value to undeclared identifier "${tree.first.value}"`, tree.position)
        } else if (identifier[Context.CONSTANT]) {
          this.throwTypeError(`invalid assignment to const identifier "${tree.first.value}"`, tree.position)
        }
        this.context.set(tree.first.value, result)
      } else if (tree.first.value === '.') {
        const first = await this.evaluate(tree.first.first)
        first.setProperty(tree.first.second.value, result)
      } else {
        const first = await this.evaluate(tree.first.first)
        const second = await this.evaluate(tree.first.second)
        const string = await second.getProperty(KarolineObject.TO_STRING).value.execute([], second)
        first.setProperty(string.value, result)
      }
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

      if (isStatement && value.class === KarolineProcedure) {
        // procedure call without arguments
        return this.executeProcedure(value.value, [], tree)
      }
      return value
    }

    if (tree.value === 'return') {
      const result = await this.evaluate(tree.first)
      result[Interpreter.RETURN] = true
      throw result
    }

    if (tree.value === 'new') {
      let cls, args = []
      if (tree.first.value === '(') {
        cls = await this.evaluate(tree.first.first)
        let i
        for (i = 0; i < tree.first.args.length; i += 1) {
          args.push(await this.evaluate(tree.first.args[i]))
        }
      } else {
        cls = await this.evaluate(tree.first)
      }
      // TODO: implement Class.getProperty(Class.IS_INSTANCE_OF).execute([cls])
      if (cls.class !== Class && cls.class !== KarolinePrimitive) {
        this.throwTypeError(`expected class`, tree)
      }

      return cls.createInstance(args)
    }

    if (tree.value === '[') {
      const first = await this.evaluate(tree.first)
      const second = await this.evaluate(tree.second)
      return first.getProperty(second.toString())
    }

    if (tree.value === '.') {
      const first = await this.evaluate(tree.first)
      return first.getProperty(tree.second.value)
    }

    if (tree.value === 'var') {
      let index, value
      const {identifiers} = tree
      for (index in identifiers) {
        const declaration = identifiers[index]
        const {identifier} = declaration
        if (this.context.scope.hasOwnProperty(identifier.value)) {
          this.throwTypeError(`identifier ${identifier.value} has already been declared in this scope`, tree.position)
        }
        if (declaration.value) {
          value = await this.evaluate(declaration.value)
        } else {
          value = new Value()
        }
        this.context.scope[identifier.value] = value
      }
      return value
    }

    if (tree.value === 'const') {
      let index, value
      const {identifiers} = tree
      for (index in identifiers) {
        const declaration = identifiers[index]
        const {identifier} = declaration
        if (this.context.scope.hasOwnProperty(identifier.value)) {
          this.throwTypeError(`identifier ${identifier.value} has already been declared in this scope`, tree.position)
        }
        value = await this.evaluate(declaration.value)
        value[Context.CONSTANT] = true
        this.context.scope[identifier.value] = value
      }
      return value
    }

    if (tree.operatorType === ParserSymbol.OPERATOR_TYPE_BINARY && KarolineObject.BINARY_OPERATORS.hasOwnProperty(tree.value)) {
      const first = await this.evaluate(tree.first)
      const second = await this.evaluate(tree.second)
      return first.getProperty(KarolineObject.BINARY_OPERATORS[tree.value]).value.execute([second], first)
    }

    if (tree.value === '||') {
      const first = await this.evaluate(tree.first)
      const firstBoolean = await first.getProperty(KarolineObject.TO_BOOLEAN).value.execute([], first)
      if (firstBoolean.value) {
        return first
      }
      const second = await this.evaluate(tree.second)
      return second
    }

    if (tree.value === '&&') {
      const first = await this.evaluate(tree.first)
      const firstBoolean = await first.getProperty(KarolineObject.TO_BOOLEAN).value.execute([], first)
      if (!firstBoolean.value) {
        return first
      }
      const second = await this.evaluate(tree.second)
      return second
    }

    if (tree.value === '+') {
      // unary +
      const first = await this.evaluate(tree.first)
      return first.getProperty(KarolineObject.OPERATOR_PLUS_UNARY).value.execute([], first)
    }

    if (tree.value === '-') {
      // unary -
      const first = await this.evaluate(tree.first)
      return first.getProperty(KarolineObject.OPERATOR_MINUS_UNARY).value.execute([], first)
    }

    if (tree.value === '(' && tree.operatorType === ParserSymbol.OPERATOR_TYPE_BINARY) {
      // procedure call with arguments
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
      if (procedure.class === KarolineProcedure) {
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

    if (tree.value === 'if') {
      const condition = await this.evaluate(tree.condition)
      if ((await condition.getProperty(KarolineObject.TO_BOOLEAN).value.execute([], condition)).value) {
        return this.evaluateBlock(tree.ifBlock)
      } else if (tree.elseBlock) {
        return this.evaluateBlock(tree.elseBlock)
      }
      return new Value()
    }

    if (tree.value === 'repeat') {
      const {block} = tree
      if (typeof tree.times !== 'undefined') {
        // repeat ... times structure
        const times = await this.evaluate(tree.times)
        if (times.class !== KarolineNumber) {
          throw new TypeError(`repeat structure: expected ${Value.NUMBER}, got ${times.type}`)
        }
        let i
        for (i = 0; i < times.value; i += 1) {
          await this.evaluateBlock(block)
        }
      } else  {
        // repeat while ... structure
        do {
          const condition = await this.evaluate(tree.condition)
          const bool = (await condition.getProperty(KarolineObject.TO_BOOLEAN).value.execute([], condition))
          if (!bool.value) {
            break
          }
          await this.evaluateBlock(block)
        } while (true)
      }
      return new Value()
    }

    if (tree.value === 'procedure') {
      const {first, block} = tree
      const name = first.value // first is an identifier and does not have to be evalated
      const proc = this.createProcedure(name, block)
      this.context.set(name, proc)
      return proc
    }

    if (tree.value === 'function') {
      const {name, params, block} = tree
      const func =  this.createFunction(
        name ? name.value : '<anonymous function expression>',
        params.map((param) => param.value),
        block
      )
      if (name) {
        this.context.set(name.value, func)
      }
      return func
    }

    this.throwTypeError(`unexpected symbol ${tree.value}`, tree.position)
  }

}

Interpreter.EXECUTION_STOPPED = Symbol('execution stopped')
Interpreter.RETURN = Symbol('return')
