const KarolineObject = require('./karoline-object.js')
const KarolinePrimitive = require('./karoline-primitive.js')
const KarolineProcedure = require('./karoline-procedure.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineBoolean = module.exports = new KarolinePrimitive(new Procedure({
  name: 'KarolineBoolean::@constructor',
  cb: async ([first]) => {
    this.setProperty('value', await first.getProperty(KarolineObject.TO_BOOLEAN).value.execute([], first))
  }
}), KarolineObject)

KarolineBoolean.setMember(KarolineObject.TO_BOOLEAN, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineBoolean::@toKarolineBoolean',
  cb: () => this
})))
