Karol.Procedure = class {

  constructor (options) {
    this.cb = options.cb
    this.expectedArguments = Array.isArray(options.expectedArguments) ? options.expectedArguments : []
    this.userDefined = !!options.userDefined
    this.name = options.name || '<unnamed procedure>'
    this.scope = options.scope || null
  }

  async execute (args) {
    const {cb, expectedArguments} = this
    let index
    for (index in expectedArguments) {
      const expected = expectedArguments[index]
      const real = args[index]
      if (expected.optional) {
        continue
      }
      if (!real) {
        throw new Karol.TypeError(`procedure ${this.name}: missing argument ${index}`)
      }
      if (Array.isArray(expected.types)) {
        if (expected.types.indexOf(real.type) < 0) {
          const types = expected.types.reduce((a, b) => a + ', ' + b, '')
          throw new Karol.TypeError(`procedure ${this.name}: expected argument ${index} to be of types ${types}got type ${args[index].type}`)
        }
      }
      if (expected.type !== real.type && expected.type !== Karol.Value.ANY) {
        throw new Karol.TypeError(`procedure ${this.name}: expected argument ${index} to be of type ${expected.type}, got type ${args[index].type}`)
      }
    }
    return await cb(args)
  }

}

Karol.Procedure.FAIL = new Karol.Procedure({
  cb: () => {
    throw new Karol.TypeError(`undefined action`)
  }
})
