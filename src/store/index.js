// @flow
import * as helpers from './helpers'
import exceptions from './exceptions'
// import HivexProxy from '../observe/proxy'
import {
  hivexObserve
} from '../observe'
import Queue from './queue'
import Computed from './computed'
import SetDictionary from './setdictionary'
import HivexConsole from '../misc/console'
import {
  listen as reactListen,
} from '../react'

type storeParams = {
  state?:Object,
  getters?:Object,
  setters?:Object,
  actions?:Object, 
  modules?:Object,
  computed?:Object,
  start?:(any)=>any
}

class Store {
  _state:Object;
  _getters:Object;
  _setters:Object;
  _actions:Object;
  _modules:Object;
  _computed:Object;
  start:?(any)=>any;

  listeners:{
    [string]:hivexReactComponent
  };
  queue:Queue;

  constructor({
    state={},
    getters={},
    setters={},
    actions={},
    modules={},
    computed={},
    start,
  }:storeParams) {

    this.listeners = {}
    this.queue = new Queue() 
    let count = 0;

    const setterCb = prop =>{
      this.queue.add(prop)
    }

    let getterQueue = new Queue()
 
    const getterCb = prop => {
      getterQueue.add(prop)
    }

    this._state = state;
    this._getters = getters
    this._setters = setters
    this._actions = actions

    helpers.objectForEach(modules, (module, prop)=>{
      modules[prop] = new Store(module)
    })

    this._modules = modules

    /*
      Defining getters that run `getterCb` on all
      computed properties ensures that all 
      interdependent computed props will
      be reactive to other computed values changing.
    */
    let computedProperties : Array<prop> = Object.getOwnPropertyNames(computed);
    
    computedProperties.forEach(
      prop=>{
        
        this._state[prop] = null;

      }
    )
    
    hivexObserve(this._state, getterCb, setterCb)

    helpers.objectForEach(computed, (func:anycb, name:prop)=>{
      /*
        The constructor saves itself in the dictionary,
        so while it may seem strange, it's unnecessary to
        assign the object to anything.
      */
      new Computed({
          getter:func,
          name,
          getterQueue:getterQueue,
          setterQueue:this.queue,
          destination:this._state,
      })
    })

    /*
      `start` is a function that runs when the Store
      is first constructed. It is passed the Hivex
      methods
    */
    if(start && typeof start == 'function') start(this.methodArgs)

  }

  get methodArgs() : Object {
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


  change(setter : prop, payload : any) : any {
      let func = this._setters[setter]
      if(!func){
        throw new Error(`Setter with name "${setter}" does not exist.`)
      }
      let res = func(this._state, payload, this.methodArgs)

      this.updateListeners()
      return res;
  }

  access(getter:prop) : any {
      let func = this._getters[getter]
      if(!func){
        throw new Error(`Getter with name "${getter}" does not exist.`)
      }
      let res = func(this._state)
      return res;
  }

  send(action:prop, payload:any) : any {
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

  module(moduleQuery: string ) : Store {
    /*
      to give users access to a module,
      good for when someone chooses to 
      have modules, but not use openers
    */
    return helpers.moduleFromQuery(moduleQuery, this);
  }

  listen(component:reactComponent) : void {
    reactListen(component, this)
  }


  updateListeners() : void {

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

        if (helpers.hasAProperty(futureState)) {

          Object.assign(listener.state, futureState)

          if( !listener._hivex_is_updating && listener._hivex_has_rendered) listener.forceUpdate.call(listener)
        }
      }
    }

    this.queue.clear()
  }

  openSetters(...args:any) : void {
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
        return myHivex.change(name, payload)
      }
    }

    Object.assign(component, setters)
  }

  openActions(...args:any) : void {
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
        return module.send(name, payload)
      }
    }

    Object.assign(component, actions)
  }

  openState(...args:any) : Object {

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

    if(component.hivexStateKeys){
      Object.assign(component.hivexStateKeys, formattedKeys)
    }
    else component.hivexStateKeys = formattedKeys;

    this.listen(component)

    return helpers.formatObjectPieceForComponent(module._state, formattedKeys);
  }
}

export default Store