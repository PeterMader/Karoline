const TypeError = require('../util/type-error.js')

const Procedure = module.exports = class {

  constructor (options) {
    this.cb = options.cb
    this.expectedArguments = Array.isArray(options.expectedArguments) ? options.expectedArguments : []
    this.userDefined = !!options.userDefined
    this.name = options.name || '<unnamed procedure>'
    this.scope = options.scope || null
  }

  async execute (args, thisArg) {
    const Value = require('./value.js')
    const {cb, expectedArguments} = this
    let index
    for (index in expectedArguments) {
      const expected = expectedArguments[index]
      const real = args[index]
      if (expected.optional) {
        continue
      }
      if (!real) {
        throw new TypeError(`procedure ${this.name}: missing argument ${index}`)
      }

      // if (Array.isArray(expected.types)) {
      //   if (expected.types.indexOf(real.type) < 0) {
      //     const types = expected.types.reduce((acc, b) => acc + ', ' + b, '')
      //     throw new TypeError(`procedure ${this.name}: expected argument ${index} to be of types ${types}got type ${real.class}`)
      //   }
      // } else if (expected.type !== real.class && expected.type !== Value.ANY) {
      //   throw new TypeError(`procedure ${this.name}: expected argument ${index} to be of type ${expected.type}, got type ${real.class}`)
      // }
    }

    console.log(thisArg)
    return await cb.call(thisArg || null, args) // ... await ...
  }

}

Procedure.FAIL = new Procedure({
  cb: () => {
    throw new TypeError(`undefined action`)
  }
})
