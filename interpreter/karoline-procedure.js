const KarolineObject = require('./karoline-object.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineProcedure = module.exports = class extends KarolineObject {

  constructor (values) {
    super()
    if (values[0] instanceof Procedure) {
      this.value = values[0]
    }
  }

}

KarolineProcedure.prototype.constructorProcedure = new Procedure({
  cb: async (args) => {
    const first = args[0]
    console.log('hi')
    this.value = await first[Value.TO_NUMBER].execute([first])
  },
  expectedArguments: [{
    type: Value.ANY
  }]
})

KarolineProcedure.prototype[Value.SUPER_CLASS_KEY] = KarolineObject
