const KarolineObject = require('./karoline-object.js')
const KarolineString = require('./karoline-string.js')
const KarolineBoolean = require('./karoline-boolean.js')
const Procedure = require('./procedure.js')
const Value = require('./value.js')

const KarolineNumber = module.exports = class extends KarolineObject {

  constructor (values) {
    super()
    if (typeof values === 'number') {
      this.value = values
    }
  }

}

KarolineNumber.prototype.constructorProcedure = new Procedure({
  cb: async (args) => {
    const first = args[0]
    this.value = (await first[Value.TO_NUMBER].execute([first])).value
    window._n = this
  },
  expectedArguments: [{
    type: Value.ANY
  }]
})

KarolineNumber.prototype.test = new KarolineNumber(4)

KarolineNumber.prototype[Value.SUPER_CLASS_KEY] = KarolineObject

KarolineNumber.prototype[Value.TO_NUMBER] = new Procedure({
  name: 'KarolineNumber::@toKarolineNumber',
  cb: (self) => self
})

KarolineNumber.prototype[Value.TO_STRING] = new Procedure({
  name: 'KarolineNumber::@toKarolineString',
  cb: (self) => new KarolineString(self.value.toString())
})

KarolineNumber.prototype[Value.TO_BOOLEAN] = new Procedure({
  name: 'KarolineNumber::@toKarolineBoolean',
  cb: (self) => new KarolineBoolean(self.value !== 0)
})

KarolineNumber.prototype[KarolineObject.OPERATOR_PLUS_UNARY] = new Procedure({
  name: 'KarolineNumber::unary+',
  cb: (self) => self,
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

KarolineNumber.prototype[KarolineObject.OPERATOR_PLUS_BINARY] = new Procedure({
  name: 'KarolineNumber::binary+',
  cb: ([self, other]) => {
    if (other.type === Value.NUMBER) {
      return new KarolineNumber(self.value + other.value)
    }
  },
  expectedArguments: [{
    types: [Value.NUMBER, Value.STRING]
  }]
})

KarolineNumber.prototype[KarolineObject.OPERATOR_MINUS_UNARY] = new Procedure({
  name: 'KarolineNumber::unary-',
  cb: (self) => new KarolineNumber(-self.value),
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

KarolineNumber.prototype[KarolineObject.OPERATOR_MINUS_BINARY] = new Procedure({
  name: 'KarolineNumber::binary-',
  cb: ([self, other]) => {
    return new KarolineNumber(self.value - other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

KarolineNumber.prototype[KarolineObject.OPERATOR_ASTERISK] = new Procedure({
  name: 'KarolineNumber::*',
  cb: ([self, other]) => {
    return new KarolineNumber(self.value * other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

KarolineNumber.prototype[KarolineObject.OPERATOR_SLASH] = new Procedure({
  name: 'KarolineNumber::/',
  cb: ([self, other]) => {
    return new KarolineNumber(self.value / other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

KarolineNumber.prototype[KarolineObject.OPERATOR_LESS_THAN] = new Procedure({
  name: 'KarolineNumber::<',
  cb: ([self, other]) => {
    return new KarolineNumber(self.value < other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

KarolineNumber.prototype[KarolineObject.OPERATOR_GREATER_THAN] = new Procedure({
  name: 'KarolineNumber::<',
  cb: ([self, other]) => {
    return new KarolineNumber(self.value > other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})
