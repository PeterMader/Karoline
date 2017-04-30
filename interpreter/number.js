const Value = require('./value.js')
const Procedure = require('./procedure.js')

const Number = module.exports = class extends Value {

  constructor (value) {
    super(Value.NUMBER, value)
  }

}

Number.prototype[Value.OPERATOR_PLUS_UNARY] = new Procedure({
  name: 'Number::unary+',
  cb: (self) => self,
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

Number.prototype[Value.OPERATOR_PLUS_BINARY] = new Procedure({
  name: 'Number::binary+',
  cb: ([self, other]) => {
    if (other.type === Value.NUMBER) {
      return new Number(self.value + other.value)
    }
  },
  expectedArguments: [{
    types: [Value.NUMBER, Value.STRING]
  }]
})

Number.prototype[Value.OPERATOR_MINUS_UNARY] = new Procedure({
  name: 'Number::unary-',
  cb: (self) => new Number(-self.value),
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

Number.prototype[Value.OPERATOR_MINUS_BINARY] = new Procedure({
  name: 'Number::binary-',
  cb: ([self, other]) => {
    return new Number(self.value - other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

Number.prototype[Value.OPERATOR_ASTERISK] = new Procedure({
  name: 'Number::*',
  cb: ([self, other]) => {
    return new Number(self.value * other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})

Number.prototype[Value.OPERATOR_SLASH] = new Procedure({
  name: 'Number::/',
  cb: ([self, other]) => {
    return new Number(self.value / other.value)
  },
  expectedArguments: [{
    type: Value.NUMBER
  }]
})
