const KarolineObject = require('./karoline-object.js')
const KarolinePrimitive = require('./karoline-primitive.js')
const KarolineProcedure = require('./karoline-procedure.js')
const Value = require('./value.js')
const Procedure = require('./procedure.js')

const KarolineString = module.exports = new KarolinePrimitive('KarolineString', new Procedure({
  name: 'KarolineString::@constructor',
  cb: async ([first]) => {
    this.value = await first.getProperty(KarolineObject.TO_STRING).value.execute([], first)
  }
}), KarolineObject)

KarolineString.setMember(KarolineObject.TO_STRING, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineString::@toKarolineString',
  cb () {
    return this
  }
})))

KarolineString.setMember(KarolineObject.OPERATOR_PLUS_BINARY, KarolineProcedure.createNativeInstance(new Procedure({
  name: 'KarolineString::binary+',
  cb: async function ([other]) {
    const string = await other.getProperty(KarolineObject.TO_STRING).value.execute([], other)
    return KarolineString.createNativeInstance(this.value.toString() + string.value)
  },
  expectedArguments: [{
    types: KarolineObject.ANY
  }]
})))
