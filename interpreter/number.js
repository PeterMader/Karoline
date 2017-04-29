const Value = require('./value.js')
const Procedure = require('./procedure.js')

const Number = module.exports = class extends Value {

  constructor (value) {
    super(Value.NUMBER, value)
  }

}

Number.prototype[Value.OPERATOR_PLUS_UNARY] = new Procedure({
  cb: (self) => self,
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

Number.prototype[Value.OPERATOR_PLUS_BINARY] = new Procedure({
  cb: ([self, other]) => {
    if (other.type === Value.NUMBER) {
      return new Number(self.value, other.value)
    }
  },
  expectedArguments: [{
    types: [Value.NUMBER, Value.STRING]
  }]
})
