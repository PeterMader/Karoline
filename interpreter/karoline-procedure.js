const KarolineObject = require('./karoline-object.js')
const KarolinePrimitive = require('./karoline-primitive.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineProcedure = module.exports = new KarolinePrimitive(new Procedure({
  name: 'KarolineProcedure::@constructor',
  cb: ([first]) => {
    this.setProperty('value', first)
  }
}), KarolineObject)

KarolineProcedure.setMember('call', KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineProcedure::call',
  cb: (args) => this.value.execute(args.slice(0, -1), args.slice(-1)[0])
})))
