const {Error, Procedure, KarolineNumber, Class, Value} = require('../index.js')
const {Robot, World} = require('karol.js')

const Application = module.exports = class {

  constructor (interpreter, canvas, karolConsole) {
    this.interpreter = interpreter
    this.ctx = canvas.getContext('2d')
    this.karolConsole = karolConsole
    this.world = new World(canvas)
    this.robot = new Robot(this.world)
    this.robot.x = 4
    this.robot.z = 3
    this.addStandardLibrary()

    this.interpreter.on('statement', this.world.render.bind(this.world))
    this.interpreter.on('error', this.printError.bind(this))
  }

  addStandardLibrary () {
    const {interpreter} = this

    interpreter.addNativeValue('true', Value.createTrue())
    interpreter.addNativeValue('false', Value.createFalse())
    interpreter.addNativeValue('Number', Class.fromNativeClass(KarolineNumber))

    interpreter.addNativeProcedure(new Procedure({
      name: 'step',
      cb: (args) => this.robot.step(args[0] ? args[0].value : 1),
      expectedArguments: [{
        type: Value.NUMBER,
        optional: true
      }]
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'turnleft',
      cb: this.robot.turnLeft.bind(this.robot, undefined)
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'turnright',
      cb: this.robot.turnRight.bind(this.robot, undefined)
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'laydown',
      cb: this.robot.layDown.bind(this.robot, undefined)
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'pickup',
      cb: this.robot.pickUp.bind(this.robot, undefined)
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'setmark',
      cb: this.robot.setMark.bind(this.robot)
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'deletemark',
      cb: this.robot.removeMark.bind(this.robot)
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'wall',
      cb: () => {
        const position = this.robot.getPositionBefore()
        return Value.createBoolean(!this.world.getTileAt(position.x, position.z))
      }
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'not',
      cb: (args) => {
        return Value.createBoolean(!args[0].castToBoolean().value)
      },
      expectedArguments: [{
        type: Value.ANY
      }]
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'fast',
      cb: () => {
        interpreter.speed = 200
      }
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'slow',
      cb: () => {
        interpreter.speed = 600
      }
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'print',
      cb: async (args) => {
        const strings = []
        let index
        for (index in args) {
          const arg = args[index]
          strings.push(await arg[Value.TO_STRING].execute([arg]))
        }
        this.karolConsole.log(...strings)
      }
    }))

    interpreter.addNativeProcedure(new Procedure({
      name: 'wait',
      cb: (args) => {
        const time = args[0].value
        return new Promise((resolve, reject) => {
          setTimeout(resolve, time)
        })
      },
      expectedArguments: [{
        type: Value.NUMBER
      }]
    }))
  }

  printError (error) {
    if (error instanceof window.Error) {
      this.karolConsole.error(new Error(`Interpreter error in file ${error.fileName}: ` + error.message, {
        line: error.lineKarolineNumber,
        column: error.columnKarolineNumber
      }))
    } else {
      this.karolConsole.error(error)
    }
  }

}
