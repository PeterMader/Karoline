const EventEmitter = module.exports = class {

  constructor () {
    this._events = {}
  }

  on (channel, ...listeners) {
    const filtered = listeners.filter((cb) => typeof cb === 'function')
    if (Array.isArray(this._events[channel])) {
      this._events[channel] = this._events[channel].concat(filtered)
    } else {
      this._events[channel] = filtered
    }
    return this
  }

  listen (channels, ...listeners) {
    if (Array.isArray(channels)) {
      let index
      for (index in channels) {
        this.on(channels[index], ...listeners)
      }
    }
    return this
  }

  listenOnce (channels, ...listeners) {
    if (Array.isArray(channels)) {
      let index
      for (index in channels) {
        this.once(channels[index], ...listeners)
      }
    }
    return this
  }

  awaitEvent (channel) {
    return new Promise((resolve, reject) => {
      this.once(channel, resolve)
    })
  }

  once (channel, ...listeners) {
    const filtered = listeners.filter((cb) => typeof cb === 'function').map((cb) => {
      const listener = (...args) => {
        this.remove(channel, listener)
        cb.apply(null, args)
      }
      return listener
    })
    if (Array.isArray(this._events[channel])) {
      this._events[channel] = this._events[channel].concat(filtered)
    } else {
      this._events[channel] = filtered
    }
    return this
  }

  emit (channel, ...args) {
    if (Array.isArray(this._events[channel])) {
      const listeners = this._events[channel]
      let index
      for (index in listeners) {
        listeners[index].apply(null, args)
      }
    }
    return this
  }

  remove (channel, ...listeners) {
    const listenersToRemove = Array.slice(arguments, 1).filter((cb) => typeof cb === 'function')
    if (Array.isArray(this._events[channel])) {
      const listeners = this._events[channel]
      let index
      for (index in listenersToRemove) {
        const listener = listenersToRemove[index]
        const removeIndex = listeners.indexOf(listener)
        if (removeIndex > -1) {
          this._events[channel].splice(removeIndex, 1)
        }
      }
    }
    return this
  }

  removeAll (channel) {
    if (Array.isArray(this._events[channel])) {
      delete this._events[channel]
    }
    return this
  }

}
