import helpers, { SealedObject } from './helpers'
import exceptions from './exceptions'

class Store {

  constructor(store) {
    this._state = store.state
    this._getters = store.getters
    this._setters = store.setters
    this._actions = store.actions
    this._modules = store.modules


    this.listeners = {}
    this.queue = {}
  }

  get methodArgs() {
    return {
      access: this.access.bind(this),
      change: this.change.bind(this),
      send: this.send.bind(this)
    }
  }

  access(getter) {
    try {
      let res = this._getters[getter](this._state)
      return res;
    } catch (error) {
      Hivex.error(error)
    }
  }

  change(setter, payload) {
    let res = this._setters[setter](this._state, payload, this.methodArgs)
    this.updateListeners()
  }

  send(action, payload) {
    let myHivex = this;
    let arg = {
      ...this.methodArgs,
      state: this.state,
      done() {
        this.updateListeners()
      }
    }
    this._actions[action](arg, payload)
  }

  listen(component) {
    let {
      componentDidMount: mountFunc,
      componentWillUnmount: unmountFunc,
    } = component

    component.componentDidMount = () => {
      try {
        if (mountFunc) mountFunc.bind(component)()
      } catch (error) {
        Hivex.error(error)
      }
      component.id = `${component.constructor.name}/timestamp/${Date.now()}/id/${Math.round(Math.random() * 10000000)}`
      component._mounted = true;
      component._mounted_at = new Date()
      this.listeners[component.id] = component
      this.updateListeners()
    }

    component.componentWillUnmount = () => {
      try {
        if (unmountFunc) unmountFunc.bind(component)()
        this.listeners[component.id]._mounted = false
        component._mounted = false;

      } catch (error) {
        Hivex.error(error)
      }
      delete this.listeners[component.id]
    }
  }

  updateListeners() {

    for (let listenerId in this.listeners) {

      let listener = this.listeners[listenerId]

      if (listener._mounted && listener.state) {

        let futureState = helpers.getFutureState(listener, this._state, this.queue)

        /* 
          If futureState is not empty, run setState (react method) on component
          (update listener)
        */
        if (!!Object.keys(futureState).length) {
          listener.setState(futureState)
        }
      }
    }

    helpers.clearObject(this.queue)

  }

  openState(...args) {
    

    exceptions.validateStateQuery()

    let component = args[args.length - 1]

    let formattedlistenerIds = helpers.formatStateQuery(listenerIds)

    component.hivexStatelistenerIds = formattedlistenerIds;

    this.listen(component)

    return helpers.formatStatePieceForComponent(this._state, formattedlistenerIds);
  }
}

export default Store