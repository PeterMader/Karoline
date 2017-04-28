Karol.StringIterator = class {

  constructor (str) {
    this.string = typeof str === 'string' ? str : ''
    this.currentIndex = 0
    this.backIndex = 0
    this.line = 0
    this.column = 0
    this.char = ''
    this.wasNewLine = false
  }

  hadNewLine () {
    const nl = this.wasNewLine
    this.wasNewLine = false
    return nl
  }

  hasNext () {
    return !!this.getCurrentChar()
  }

  getCurrentPosition () {
    return {
      line: this.line,
      column: this.column
    }
  }

  getCurrentChar () {
    return this.char = this.string.charAt(this.currentIndex)
  }

  next () {
    this.getCurrentChar()
    this.currentIndex += 1
    if (this.backIndex > 0) {
      this.backIndex -= 1
    } else {
      this.column += 1
      if (this.char === '\n') {
        this.wasNewLine = true
        this.line += 1
        this.column = 0
      }
    }
    return this.char
  }

  back () {
    this.currentIndex -= 1
    this.backIndex += 1
    return this.getCurrentChar()
  }

}
