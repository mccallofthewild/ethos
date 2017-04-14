import helpers from './helpers'
import exceptions from './exceptions'
import HivexProxy from '../observe/proxy'
import Queue from './queue'
import Computed from './computed'
import SetDictionary from './setdictionary'

class Store {

  constructor({
    state={},
    getters={},
    setters={},
    actions={},
    modules={},
    computed={},
    start=null,
  }) {

    this.listeners = {}
    this.queue = new Queue()

    const setterCb = prop => this.queue.add(prop)

    let computedQueue = new Queue()

    const getterCb = prop => computedQueue.add(prop)

    this._state = new HivexProxy(state, null, {getterCb, setterCb})
    this._getters = getters
    this._setters = setters
    this._actions = actions

    this.computedDict = new SetDictionary()

    helpers.objectForEach(computed, (func, name)=>{
      /*
        The constructor saves itself in the dictionary,
        so while it may seem strange, it's unnecessary to
        assign the object to anything.


        REFACTOR THIS YOU WROTE IT AT 3AM AND IT'S SHIT CODE. THIS IS A GOOD PROJECT. DON'T WRITE SHIT CODE IN IT!






        IN FACT, REFACTOR THE ENTIRE COMPUTED & SETDICTIONARY THING. IT'S ALL QUESTIONABLE.






        
      */
      new Computed({
          getter:func,
          name,
          queue:computedQueue,
          state:this._state,
          dictionary:computedDict
      })
    })

    helpers.objectForEach(modules, (module, prop)=>{
      this._modules[prop] = new Store(module)
    })

    /*
      `start` is a function that runs when the Store
      is first constructed. It is passed the Hivex
      methods
    */
    if(start && typeof start == 'function') start(this.methodArgs)

  }

  get methodArgs() {
    /*
      Allows you to use object destructuring on methods
      without losing scope of `this`
    */
    return {
      access: this.access.bind(this),
      change: this.change.bind(this),
      send: this.send.bind(this)
    }
  }


  change(setter, payload) {
      let func = this._setters[setter]
      if(!func){
        throw new Error(`Setter with name "${setter}" does not exist.`)
      }
      let res = func(this._state, payload, this.methodArgs)
      this.updateListeners()
      return res;
  }

  access(getter) {
      let func = this._getters[getter]
      if(!func){
        throw new Error(`Getter with name "${getter}" does not exist.`)
      }
      let res = func(this._state)
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
      let func = this._actions[action]
      if(!func){
        throw new Error(`Action with name "${action}" does not exist.`)
      }
      let res = func(arg, payload)
      return res;
  }

  module(moduleQuery){
    /*
      to give users access to a module,
      good for when someone chooses to 
      have modules, but not use openers
    */
    return helpers.moduleFromQuery(moduleQuery, this);
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
    if(!this.queue.isPopulated) return;

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

  openSetters(...args){
    let myHivex = this;
    let [moduleQuery, query, component] = helpers.parseOpenArgs(args)
    
    let module = helpers.moduleFromQuery(moduleQuery, this);

    /*
      If `module` is not the module we are currently in,
      open its setters instead.
    */

    if( module !== this ) return module.openSetters(query, component)

    // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
    let formattedKeys = helpers.formatObjectQuery(query)
    
    let setters = {}
    for(let alias in formattedKeys){
      let name = formattedKeys[alias]
      setters[alias] = function(payload){
        myHivex.change(name, payload)
      }
    }

    Object.assign(component, setters)
  }

  openActions(...args){
    let myHivex = this;
    let [moduleQuery, query, component] = helpers.parseOpenArgs(args)

    let module = helpers.moduleFromQuery(moduleQuery, this);

    /*
      If `module` is not the module we are currently in,
      open its actions instead.
    */
    if( module !== this ) return module.openActions(query, component)

    // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
    let formattedKeys = helpers.formatObjectQuery(query)
    
    let actions = {}
    for(let alias in formattedKeys){
      let name = formattedKeys[alias]
      actions[alias] = function(payload){
        module.send(name, payload)
      }
    }

    Object.assign(component, actions)
  }

  openState(...args) {

    let [moduleQuery, query, component] = helpers.parseOpenArgs(args)

    let module = helpers.moduleFromQuery(moduleQuery, this);

    /*
      If `module` is not the module we are currently in,
      open its state instead. The module's state will not
      be reactive otherwise.
    */
    if( module !== this ) return module.openState(query, component)

    // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
    let formattedKeys = helpers.formatObjectQuery(query)

    component.hivexStateKeys = formattedKeys;

    this.listen(component)

    return helpers.formatObjectPieceForComponent(module._state, formattedKeys);
  }
}

export default Store