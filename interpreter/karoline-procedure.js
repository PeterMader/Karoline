const KarolineObject = require('./karoline-object.js')
const KarolinePrimitive = require('./karoline-primitive.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineProcedure = module.exports = new KarolinePrimitive('KarolineProcedure', new Procedure({
  name: 'KarolineProcedure::@constructor',
  cb: ([first = KarolineObject.createNativeInstance()]) => {
    if (first.class = KarolineProcedure) {
      this.value = first
    } else {
      this.value = KarolineProcedure.createNativeInstance(new Procedure({
        cb () {
          return first
        }
      }))
    }
  }
}), KarolineObject)

KarolineProcedure.setMember('call', KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineProcedure::call',
  cb (args) {
    return this.value.execute(args.slice(0, -1), args.slice(-1)[0])
  }
})))
