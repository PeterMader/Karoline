const KarolineObject = require('./karoline-object.js')
const KarolinePrimitive = require('./karoline-primitive.js')
const KarolineProcedure = require('./karoline-procedure.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineString = module.exports = new KarolinePrimitive(new Procedure({
  name: 'KarolineString::@constructor',
  cb: async ([first]) => {
    this.setProperty('value', await first.getProperty(KarolineObject.TO_STRING).value.execute([], first))
  }
}), KarolineObject)

KarolineString.setMember(KarolineObject.TO_STRING, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineString::@toKarolineString',
  cb: () => this
})))
