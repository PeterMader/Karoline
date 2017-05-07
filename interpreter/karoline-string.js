const KarolineObject = require('./karoline-object.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineString = module.exports = class extends KarolineObject {

  constructor (values) {
    super()
    if (typeof values === 'string') {
      this.value = values
    }
  }

}

KarolineString.prototype.constructorProcedure = new Procedure({
  cb: async (args) => {
    const first = args[0]
    this.value = await first[Value.TO_NUMBER].execute([first])
  },
  expectedArguments: [{
    type: Value.ANY
  }]
})

KarolineString.prototype.test = new KarolineString(4)

KarolineString.prototype[Value.SUPER_CLASS_KEY] = KarolineObject
