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
  state?:ObjectType<any>,
  getters?:ObjectType<anycb>,
  setters?:ObjectType<anycb>,
  actions?:ObjectType<anycb>, 
  modules?:ObjectType<storeParams>,
  computed?:ObjectType<anycb>,
  watchers?:ObjectType<anycb>,
  start?:anycb;
}

export default class Store {

  _state:Object;
  _getters:ObjectType<anycb>;
  _setters:ObjectType<anycb>;
  _actions:ObjectType<anycb>;
  _modules:ObjectType<Store>;
  _computed:ObjectType<Computed>;

  getters:Object;
  actions:Object;
  setters:Object;

  start:anycb;

  methodArgs:Object;

  listeners:Map<prop, Component>;

  queue:Queue;

  constructor({
    state={},
    getters={},
    setters={},
    actions={},
    modules={},
    computed={},
    watchers={},
    start,
  } : storeParams) {

    let initialized = false;
    /*
      makes actions, getters and setters easily accessable on the `#actions`
      and `#setters` properties.
    */
    
    this.actions = {}
    for(let prop in actions) this.actions[prop] = (payload)=>this.send(prop, payload)
    
    this.setters = {}
    for(let prop in setters) this.setters[prop] = (payload)=>this.change(prop, payload)
    
    this.getters = {}
    for(let prop in getters) this.getters[prop] = (payload)=>this.access(prop, payload)
    

    this.methodArgs = {
      /*
        Allows you to use object destructuring on methods
        without losing scope of `this`
      */
      access: this.access.bind(this),
      change: this.change.bind(this),
      send: this.send.bind(this),
      getters: this.getters,
      setters: this.setters,
      actions: this.actions,
    }

    this.listeners = new Map();

    this.queue = new Queue() 
    let getterQueue = new Queue()


    const setterCb = prop =>{
      this.queue.add(prop)
    }

    const getterCb = prop => {
      if(!initialized) getterQueue.add(prop)
    }

    this._state = state;
    this._getters = getters
    this._setters = setters
    this._actions = actions

    this._modules = {}
    this._computed = {}
    
    
    hivexObserve(this._state, getterCb, setterCb)

    /*
      Initially, we will define computed properties
      as getters in `state`. This is vital for making
      interdependent computeds to work.

      Additionally, these getters will each call
      getterCb, passing it the name of the computed.
      This ensures that computed properties can be 
      added to other computeds' dependencies.

      After clearing the descriptor, getterCb will no
      longer run on computed properties. 


      Once all the computeds are initialized and have 
      registered their dependencies, we iterate over each
      computed, clearing the original getter on state and
      running `#update`, setting its property
      in state to be the return value of its getter function.

      Because the `#update`s run one at a time, there are never
      any undefined dependencies during this process.

      ** Simply using getters on state is inefficient
      because it requires the process to run every time
      the computed is asked for, as opposed to every time the
      computed changes.
    */

    const computedGetters = {}

    helpers.objectForEach(computed, (func:anycb, name:prop)=>{
      let myHivex = this;
      computedGetters[name] = {
        get(){
          let val = func(myHivex._state)
          getterCb(name);
          return val;
        },
        configurable:true,
      }
    })

    Object.defineProperties(this._state, computedGetters);


    helpers.objectForEach(computed, (func:anycb, name:prop)=>{

      this._computed[name] = new Computed({
          getter:func,
          name,
          getterQueue:getterQueue,
          setterQueue:this.queue,
          destination:this._state,
      })

    });

    // letting computed properties just be reactive getters
    helpers.objectForEach(computed, (func:anycb, name:prop)=>{
      // delete this._state[name];
      this._computed[name].observe();
    })

    /*
      `start` is a function that runs when the Store
      is first constructed. It is passed the Hivex
      methods
    */

    if(start && typeof start == 'function') start(this.methodArgs)


    /*

      modules are registered last to ensure that if
      any sub-modules traverse upwards in the module
      tree, everything will already be configured in
      its parent modules.

    */

    helpers.objectForEach(modules, (module, prop)=>{
      this._modules[prop] = new Store(module)
    })


    // setting watchers to run whenever their property updates

    helpers.objectForEach(watchers, (watcher, prop)=>{
      this.queue.addListener(prop, ()=>{
        watcher(this.methodArgs)
      })
    })


    initialized = true;


  }


  

  getState(){
    return this._state;
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
      let methods = {
        ...this.methodArgs,
        done() {
          myHivex.updateListeners()
        }
      }
      let func = this._actions[action]
      if(!func){
        throw new Error(`Action with name "${action}" does not exist.`)
      }
      let res = func(this._state, methods, payload)
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
 
  listen(component:reactComponent, stateQuery) : void {
    reactListen(component, this, stateQuery);
  }


  updateListeners() : void {

    // if queue is empty, return.
    if(!this.queue.isPopulated) return;

    this.listeners.forEach(
      listener=>{
        listener.update()
      }
    )

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

    let hivexData = component.__hivex;

    let stateQuery;

    if(hivexData && hivexData.stateQuery){
      stateQuery = Object.assign(component.__hivex.stateQuery, formattedKeys)
    }
    else stateQuery = formattedKeys;

    this.listen(component, stateQuery)

    let staticState : Object = helpers.formatObjectPieceForComponent(module._state, formattedKeys);

    return helpers.getterProxy(staticState, (obj, prop)=>{
      return this._state[prop];
    })

  }
}