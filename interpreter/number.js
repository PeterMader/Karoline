Karol.Number = class extends Karol.Value {

  constructor (value) {
    super(Karol.Value.NUMBER, value)
  }

}

Karol.Number.prototype[Karol.Value.OPERATOR_PLUS_UNARY] = new Karol.Procedure({
  cb: (self) => self,
  expectedArguments: [{
    type: Karol.Value.NUMBER
  }]
})

Karol.Number.prototype[Karol.Value.OPERATOR_PLUS_BINARY] = new Karol.Procedure({
  cb: ([self, other]) => {
    if (other.type === Karol.Value.NUMBER) {
      return new Karol.Number(self.value, other.value)
    }
  },
  expectedArguments: [{
    types: [Karol.Value.NUMBER, Karol.Value.STRING]
  }]
})
