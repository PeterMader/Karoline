Karol.Application = class {

  constructor (interpreter, canvas, karolConsole) {
    this.interpreter = interpreter
    this.ctx = canvas.getContext('2d')
    this.karolConsole = karolConsole
    this.world = new Karol.World()
    this.robot = new Karol.Robot(this.world)
    this.robot.x = 4
    this.robot.z = 3
    this.addStandardLibrary()

    this.interpreter.on('statement', this.render.bind(this))
    this.interpreter.on('error', this.printError.bind(this))
  }

  addStandardLibrary () {
    const {interpreter} = this

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'step',
      cb: (args) => this.robot.step(args[0] ? args[0].value : 1),
      expectedArguments: [{
        type: Karol.Value.NUMBER,
        optional: true
      }]
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'turnleft',
      cb: this.robot.turnLeft.bind(this.robot, undefined)
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'turnright',
      cb: this.robot.turnRight.bind(this.robot, undefined)
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'laydown',
      cb: this.robot.layDown.bind(this.robot, undefined)
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'pickup',
      cb: this.robot.pickUp.bind(this.robot, undefined)
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'setmark',
      cb: this.robot.setMark.bind(this.robot)
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'deletemark',
      cb: this.robot.deleteMark.bind(this.robot)
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'wall',
      cb: () => {
        const position = this.robot.getPositionBefore()
        return Karol.Value.createBoolean(!this.world.getTileAt(position.x, position.z))
      }
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'not',
      cb: (args) => {
        return Karol.Value.createBoolean(!args[0].castToBoolean().value)
      },
      expectedArguments: [{
        type: Karol.Value.ANY
      }]
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'fast',
      cb: () => {
        interpreter.speed = 200
      }
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'slow',
      cb: () => {
        interpreter.speed = 600
      }
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'print',
      cb: (args) => {
        this.karolConsole.log(...args)
      }
    }))

    interpreter.addNativeProcedure(new Karol.Procedure({
      name: 'wait',
      cb: (args) => {
        const time = args[0].value
        return new Promise((resolve, reject) => {
          setTimeout(resolve, time)
        })
      },
      expectedArguments: [{
        type: Karol.Value.NUMBER
      }]
    }))
  }

  printError (error) {
    if (error instanceof window.Error) {
      this.karolConsole.error(new Karol.Error(`Interpreter error in file ${error.fileName}: ` + error.message, {
        line: error.lineNumber,
        column: error.columnNumber
      }))
    } else {
      this.karolConsole.error(error)
    }
  }

}
