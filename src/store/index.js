// @flow
import * as helpers from './helpers'
import exceptions from './exceptions'
// import HivexProxy from '../observe/proxy'
import * as events from '../events'
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
  truth?:ObjectType<any>,
  // getters?:ObjectType<anycb>,
  writers?:ObjectType<anycb>,
  runners?:ObjectType<anycb>, 
  children?:ObjectType<storeParams>,
  thoughts?:ObjectType<anycb>,
  watchers?:ObjectType<anycb>,
  founder?:anycb,
}

type parent = Source | null;





export default class Source {

  _state:Object;
  // _getters:ObjectType<anycb>;
  _writers:ObjectType<anycb>;
  _runners:ObjectType<anycb>;
  _modules:ObjectType<Source>;
  _computed:ObjectType<Computed>;

  runners:Object;
  writers:Object;

  methodArgs:Object;

  listeners:Map<prop, Listener>;

  queue:Queue;

  parent:parent;
 
  origin:Source;

  constructor({
    truth={},
    // getters={}, 
    writers={},
    runners={},
    children={},
    thoughts={},
    watchers={},
    founder=()=>{},
  } : storeParams,
  ancestry ?: {
    parent:parent,
    origin:Source,
  }) {

    const {
      parent=this, origin=this,
    } = ancestry || {};

    this.parent = parent;
    this.origin = origin;

    let initialized = false;
    /*
      makes runners, getters and writers easily accessable on the `#runners`
      and `#writers` properties.
    */
    
    this.runners = {}
    for(let prop in runners) this.runners[prop] = (...args)=>this.run(prop, args, true)
    
    this.writers = {}
    for(let prop in writers) this.writers[prop] = (...args)=>this.write(prop, args, true)
    
    // this.getters = {}
    // for(let prop in getters) this.getters[prop] = (payload)=>this.access(prop, payload)
    


    this.listeners = new Map();

    this.queue = new Queue()
    let getterQueue = new Queue()


    const writerCb = prop =>{
      this.queue.add(prop)
    }

    const getterCb = prop => {
      if(!initialized) getterQueue.add(prop)
    }

    this._state = truth;
    // this._getters = getters;
    this._writers = writers;
    this._runners = runners;

    this._modules = {}
    this._computed = {}
    
    
    hivexObserve(this._state, getterCb, writerCb)

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

    helpers.objectForEach(thoughts, (func:anycb, name:prop)=>{
      let alias = this;
      computedGetters[name] = {
        get(){
          let val = func.apply(alias.methodArgs)
          getterCb(name);
          return val;
        },
        configurable:true,
      }
    })

    Object.defineProperties(this._state, computedGetters);

    this.methodArgs = {
        /*
          Allows you to use object destructuring on methods
          without losing scope of `this`
        */
        // access: this.access.bind(this),
        write: this.write.bind(this),
        run: this.run.bind(this),
        // getters: this.getters,
        writers: this.writers,
        runners: this.runners,

        truth:this._state,

        parent:this.parent,
        origin:this.origin,
        child:this.child.bind(this),

        
    }

    helpers.objectForEach(thoughts, (func:anycb, name:prop)=>{
      const alias = this;
      this._computed[name] = new Computed({
          getter:()=>func.bind(alias.methodArgs),
          name,
          getterQueue:getterQueue,
          setterQueue:this.queue,
          destination:this._state,
      })

    });

    // letting computed properties just be reactive getters
    helpers.objectForEach(thoughts, (func:anycb, name:prop)=>{
      // delete this._state[name];
      this._computed[name].observe();
    })

    /*
      `founder` is a function that runs when the Source
      is first constructed. It is passed the Hivex
      methods
    */
    
    const founder_accessor = this.methodArgs;

    if(founder && typeof founder == 'function') founder.apply(founder_accessor)


    /*

      modules are registered last to ensure that if
      any sub-modules traverse upwards in the module
      tree, everything will already be configured in
      its parent modules.

    */

    helpers.objectForEach(children, (module, prop)=>{
      this._modules[prop] = new Source(module, {
        parent:this,
        origin:this.origin,
      })
    })


    // setting watchers to run whenever their property updates

    helpers.objectForEach(watchers, (watcher, prop)=>{
      this.queue.addListener(prop, ()=>{
        watcher.apply(this.methodArgs)
      })
    })


    initialized = true;


  }


  

  getState(){
    return this._state;
  }

  get truth() : Object {
    return this._state;
  } 


  write(writer : prop, payload : any, spread?:boolean = false) : any {
      let func = this._writers[writer]
      let accessor = this.methodArgs;
      if(!func){
        throw new Error(`Writer with name "${writer}" does not exist.`)
      }
      let args = spread? payload : [payload]

      let res = func.apply(accessor, args)

      this.updateListeners()
      return res;
  }


  run(runner:prop, payload:any, spread?:boolean = false) : any {
      let myHivex = this;

      let usingPromise = false;
      let promise;
      let resolver, rejecter;

      let generatePromise = () => {

        promise = new Promise((resolve, reject) => {
          resolver = resolve;
          rejecter = reject;
        })
        usingPromise = true;

      }

      let accessor = {


        done(){
          myHivex.updateListeners()
        },

        truth:this._state,

        async(){
          generatePromise()
        },

        resolve(...args){
          return resolver(...args);
        },

        reject(...args) {
          return rejecter(...args);
        },
        ...this.methodArgs,


      }

      let func = this._runners[runner]

      if(!func){
        throw new Error(`Action with name "${runner}" does not exist.`)
      }

      let args = spread? payload : [payload]

      let res = func.apply(accessor, args)

      if(usingPromise) res = promise;

      return res;
  }

  child(moduleQuery: string ) : Source {
    /*
      to give users access to a module,
      good for when someone chooses to 
      have modules, but not use openers
    */
    return helpers.moduleFromQuery(moduleQuery, this);
  }
 
  listen(component:reactComponent, stateQuery:ObjectType<prop>) : void {

    let dependencies = [];

    for(let prop in stateQuery) dependencies.push(stateQuery[prop])

    let listener = reactListen(component, this, dependencies);

    let middleware = this.queue.use( (...args)=>listener.check(...args) );

    this.listeners.set(listener.__id, listener);

    listener.on(events.listener.MOUNT, ()=>{

      middleware = this.queue.use( (...args)=>listener.check(...args) );
      this.listeners.set(listener.__id, listener)

    })

    listener.on(events.listener.UNMOUNT, ()=>{

      this.queue.retire(middleware)
      this.listeners.delete(listener.__id)

    })

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

  openWriters(...args:any) : void {
    let myHivex = this;
    let [moduleQuery, query, component] = helpers.parseOpenArgs(args)
    
    let module = helpers.moduleFromQuery(moduleQuery, this);

    /*
      If `module` is not the module we are currently in,
      open its writers instead.
    */

    if( module !== this ) return module.openWriters(query, component)

    // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
    let formattedKeys = helpers.formatObjectQuery(query)
    
    let writers = {}
    for(let alias in formattedKeys){
      let name = formattedKeys[alias]
      writers[alias] = function(payload){
        return myHivex.write(name, payload)
      }
    }

    Object.assign(component, writers)
  }

  openActions(...args:any) : void {
    let myHivex = this;
    let [moduleQuery, query, component] = helpers.parseOpenArgs(args)

    let module = helpers.moduleFromQuery(moduleQuery, this);

    /*
      If `module` is not the module we are currently in,
      open its runners instead.
    */
    if( module !== this ) return module.openActions(query, component)

    // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
    let formattedKeys = helpers.formatObjectQuery(query)
    
    let runners = {}
    for(let alias in formattedKeys){
      let name = formattedKeys[alias]
      runners[alias] = function(payload){
        return module.run(name, payload)
      }
    }

    Object.assign(component, runners)
  }

  getTruth(...args:any) : Object {

    let [moduleQuery, query, component] = helpers.parseOpenArgs(args)

    let module = helpers.moduleFromQuery(moduleQuery, this);

    /*
      If `module` is not the module we are currently in,
      open its state instead. The module's state will not
      be reactive otherwise.
    */
    if( module !== this ) return module.getTruth(query, component)

    // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
    let formattedKeys = helpers.formatObjectQuery(query)

    let hivexData = component.__hivex;
    
    let stateQuery;

    if(hivexData && hivexData.stateQuery){
      /* truth queries only exist on a per-listener basis, so if the properties overlap,
      it's not our problem. */
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