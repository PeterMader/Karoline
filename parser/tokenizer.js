const Token = require('./token.js')
const SyntaxError = require('../util/syntax-error.js')

const Tokenizer = module.exports = class {

  constructor (keyWords) {
    this.iter = null
    this.keyWords = Array.isArray(keyWords) ? keyWords : []
  }

  addKeyWord (keyWord) {
    if (keyWord) {
      this.keyWords.push(keyWord.toString())
    }
  }

  keyWordStartsWith (str) {
    const length = str.length
    return this.keyWords.some((item) => {
      return item.slice(0, length) === str
    })
  }

  isAlpha (char) {
    return /^[a-zA-ZäöüÄÖÜß]+$/i.test(char)
  }

  isNumeric (char) {
    return /^[0-9]+$/i.test(char)
  }

  isAlphaNumeric (char) {
    return /^[a-zA-Z0-9äöüÄÖÜß]+$/i.test(char)
  }

  stringToken (quote) {
    const {iter} = this
    let str = ''
    let ch = ''
    let escape = false
    while (ch = iter.next()) {
      if (!ch) {
        throw new SyntaxError(`Unterminated string literal`, iter.getCurrentPosition())
      }
      if (escape) {
        escape = false
        if (ch === 'b') {
          ch = '\b'
        }
        if (ch === 'f') {
          ch = '\f'
        }
        if (ch === 'n') {
          ch = '\n'
        }
        if (ch === 'r') {
          ch = '\r'
        }
        if (ch === 't') {
          ch = '\t'
        }
        str += ch
        continue
      }
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === quote) {
        break
      }
      str += ch
    }
    return this.createToken(Token.TOKEN_TYPE_STRING, str, iter.getCurrentPosition())
  }

  identifierToken (start) {
    const {iter} = this
    let name = start
    let ch = ''
    while (ch = iter.next()) {
      if (this.isAlphaNumeric(ch)) {
        name += ch
      } else {
        break
      }
    }
    return this.createToken(Token.TOKEN_TYPE_IDENTIFIER, name, iter.getCurrentPosition())
  }

  numberToken (start) {
    const {iter} = this
    let number = start
    let ch = ''
    while (ch = iter.next()) {
      if (this.isNumeric(ch)) {
        number += ch
      } else {
        break
      }
    }
    return this.createToken(Token.TOKEN_TYPE_NUMBER, Number(number), iter.getCurrentPosition())
  }

  keyWordToken (start) {
    const {iter} = this
    let name = start
    let ch = ''
    while (ch = iter.next()) {
      if (this.keyWordStartsWith(name + ch)) {
        name += ch
      } else {
        if (this.keyWords.indexOf(name) > -1) {
          break
        } else if (this.isAlpha(name[0]) && this.isAlphaNumeric(name + ch)) {
          return this.identifierToken(name + ch)
        } else {
          throw new SyntaxError(`unknown token ${name + ch}`)
        }
      }
    }
    return this.createToken(Token.TOKEN_TYPE_KEY_WORD, name, iter.getCurrentPosition())
  }

  createToken (type, value, position) {
    position.column -= value.length // TODO: doesn't work properly
    return new Token({
      type,
      value,
      position
    })
  }

  tokenize (string) {
    const iter = this.iter = new StringIterator(string)
    const tokens = []
    let ch = ''

    while (ch = iter.next()) {
      if (!ch.trim()) {
        continue
      }
      if (this.keyWordStartsWith(ch)) {
        // key word
        tokens.push(this.keyWordToken(ch))
        iter.back()
      } else if (ch === '\'' || ch === '"') {
        // string literal
        tokens.push(this.stringToken(ch))
      } else if (this.isNumeric(ch)) {
        // number literal
        tokens.push(this.numberToken(ch))
        iter.back()
      } else if (this.isAlphaNumeric(ch)) {
        // identifier
        tokens.push(this.identifierToken(ch))
        iter.back()
      } else {
        throw new SyntaxError(`illegal character "${ch}"`, iter.getCurrentPosition())
      }
    }

    return tokens
  }

}
