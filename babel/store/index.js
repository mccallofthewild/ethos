import helpers, { SealedObject } from './helpers'
import exceptions from './exceptions'
import HivexProxy from '../observe/proxy'
import Queue from './queue'
class Store {

  constructor(store) {

    this.listeners = {}
    this.queue = new Queue()
    /*
     queue is formatted as

      {
        stateprop:true,
        otherstateprop:true
      }

    */

    let add = prop=> this.queue.add(prop)

    this._state = new HivexProxy(store.state, null, add)
    this._getters = store.getters
    this._setters = store.setters
    this._actions = store.actions
    this._modules = store.modules

  }

  get methodArgs() {
    return {
      access: this.access.bind(this),
      change: this.change.bind(this),
      send: this.send.bind(this)
    }
  }

  access(getter) {
    let res = this._getters[getter](this._state)
    return res;
  }

  change(setter, payload) {
    let res = this._setters[setter](this._state, payload, this.methodArgs)
    this.updateListeners()
    return res;
  }

  send(action, payload) {
    let myHivex = this;
    let arg = {
      ...this.methodArgs,
      state: this._state,
      done() {
        myHivex.updateListeners()
      }
    }
    this._actions[action](arg, payload)
  }

  listen(component) {

    let myHivex = this;

    let {
      componentDidMount: mountFunc,
      componentWillUnmount: unmountFunc,
    } = component

    let idKey = "_hivex_id"

    component.componentDidMount = (...args) => {
      try {
        if (mountFunc) mountFunc.bind(component)(...args)
      } catch (error) {
        Hivex.error(error)
      }
      component[idKey] = `${component.constructor.name}/timestamp/${Date.now()}/id/${Math.round(Math.random() * 10000000)}`
      component._hivex_mounted = true;
      component._hivex_mounted_at = new Date()
      myHivex.listeners[ component[idKey] ] = component
      myHivex.updateListeners()
    }

    component.componentWillUnmount = (...args) => {

      try {
        if (unmountFunc) unmountFunc.bind(component)(...args)
        myHivex.listeners[ component[idKey] ]._hivex_mounted = false
        component._hivex_mounted = false;

      } catch (error) {
        Hivex.error(error)
      }
      delete myHivex.listeners[ component[idKey] ]

    }
  }

  updateListeners() {

    // if queue is empty, return.
    if(!Object.keys(this.queue).length) return;

    for (let listenerKey in this.listeners) {

      let listener = this.listeners[listenerKey]

      if (listener._hivex_mounted && listener.state) {

        let futureState = helpers.getStateUpdatesFromQuery(listener, this._state, this.queue)

        /* 
          If futureState is not empty, run setState (react method) on component
          (update listener)
        */

        if (!!Object.keys(futureState).length) {
          listener.setState(futureState)
        }
      }
    }

    this.queue.clear()
  }


  openState(...args) {
    let [module, stateQuery, component] = [null, null, null]
    if(typeof args[0] == "string"){
      [module, stateQuery, component] = args
    }else{
      // defaults to blank module query (root store)
      [module, stateQuery, component] = ["", ...args]
    }
    // 


    // `listenerKeys` are the user-defined keys which alias properties on state 
    let formattedlistenerKeys = helpers.formatStateQuery(stateQuery)

    component.hivexStateKeys = formattedlistenerKeys;

    this.listen(component)

    return helpers.formatStatePieceForComponent(this._state, formattedlistenerKeys);
  }
}

export default Store