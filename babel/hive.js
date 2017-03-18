 class Hive {

  constructor(store){
    Hive.intro()
    this._state = store.state
    this._store = store
    this.deepListen({obj:this._state})
    this.overwriteArrayMethods()

    this._getters = store.getters
    this._setters = store.setters
    this._destroyers = store.destroyers
    this._actions = store.actions
    this._computed = store.computed

    this.injectComputedProps()

    this.listeners = {}
    this.queue = {}
  }

  injectComputedProps(){
    let computed = this._computed
    let builder = {}
    for(let prop in computed){
      builder[prop] = {
        get:computed[prop]
      }
    }
    Object.defineProperties(this._state, builder)
  }

  overwriteArrayMethods(){
    let myHive = this;
    let _splice = Array.prototype.splice;
    delete Array.prototype.splice;
    Array.prototype.splice = function splice(){

      let descriptor = Object.getOwnPropertyDescriptor(this, 0)
      let result = _splice.apply(this, arguments)
      if(descriptor && descriptor.set && descriptor.set.name == "hiveSet"){
        let writeAll = !this.length;
        if(!writeAll){
          this[0] = this[0]
        }else{
          myHive.updateListeners({writeAll});
        }
      }
      return result
    }
  }

  // Attaches Hive-specific setter to a property
  defineBoth({obj, prop, rootProp}){
    let myHive = this;
    let val = obj[prop]
    // debugger
    if(Object.getOwnPropertyDescriptor(obj, prop).configurable){

      Object.defineProperty(obj, prop, {
        configurable:true,
        set: function hiveSet(nextVal){
          val = nextVal;
          myHive.queue[rootProp] = true
          // Hive.log("running setter for " + prop)
          let holdForUpdate = (/(change|splice)/.test(arguments.callee.caller.name))

          let descriptor = Object.getOwnPropertyDescriptor(obj, prop)

          if(typeof val == "object" && (descriptor && descriptor.set.name=="hiveSet") && !holdForUpdate) (()=>{ 
            let obj = val;
            myHive.deepListen({obj}, rootProp);
          })()

          if(!holdForUpdate) myHive.updateListeners()
        },
        get:function hiveGet(){
          return val;
        }
      })

    }
  }

  defineForEach(obj, cb, depth, rootProp){
    try{
      cb = cb.bind(this)
      let isRoot = !rootProp;
      depth = depth || 0
      depth++
      if(depth>5) return;
      for(let prop in obj){
        let val = obj[prop]
        rootProp = isRoot? prop : rootProp
        if(!!Object.getOwnPropertyDescriptor(obj, prop)){
          this.defineBoth({obj, prop, rootProp})
          if(typeof val == "object") cb(val, cb, depth, rootProp) // !Array.isArray(val) Doesn't listen to arrays... ? idk
        }
      }

    }catch(error){
      Hive.error(error)
    }
  }

  deepListen({obj}, rootProp){
    this.defineForEach(obj, this.defineForEach, 0, rootProp);
  }

  static intro(){
    try{
      console.group(`%c HIVE.js 🐝 \t\t\t`, `font-size:16px; background-color:black; color:white; padding:5px; width:100%;`)
      console.groupEnd()
    }catch(error){}
  }
  static log(){
    try{
      console.log(`🍯 `, ...arguments)
    }catch(error){}
  }
  static error(){
    try{
      console.group(`%c🍯 Hive Error`, `font-size:12px;`)
      console.error(...arguments);
      console.groupEnd()
    }catch(error){}
  }

  get methodArgs(){
    return {
      access: this.access.bind(this),
      change: this.change.bind(this),
      send: this.send.bind(this)
    }
  }
  
  access(getter, payload){
    try{
      let res = this._getters[getter](this._state, payload)
      return res;
    }catch(error){
      Hive.error(error)
    }
  }

  change(setter, payload){
      let res = this._setters[setter](this._state, payload, this.methodArgs)
      this.updateListeners()
  }

  send(action, payload){
    return new Promise((resolve, reject)=>{
      let arg = {
        resolve,
        reject,
        ...this.methodArgs,
        state:this.state,
      }
      this._actions[action](arg, payload)
    })
  }
 
  destroy(destroyer, payload){
    let res = this._destroyers[action](this.methodArgs, payload, this._state)
    myHive.updateListeners({writeAll})
  }

  listen(context){
    let {
      componentDidMount:mountFunc = ()=>{},
      componentWillUnmount:unmountFunc = ()=>{}
    } = context

    context.componentDidMount = ()=>{
        try{
          mountFunc.bind(context)()
        }catch(error){
          Hive.error(error)
        }
        context.id = `${context.constructor.name}/timestamp/${Date.now()}/id/${Math.round(Math.random()*10000000)}`
        context._mounted = true;
        context._mounted_at = new Date()
        this.listeners[context.id] = context
        this.updateListeners()
    }
    
    context.componentWillUnmount = ()=>{
      try{
        unmountFunc.bind(context)()
        this.listeners[context.id]._mounted = false
        context._mounted = false;

      }catch(error){
        Hive.error(error)
      }
      delete this.listeners[context.id]
    }
  }

  updateListeners(options={}){
    let {writeAll=false} = options

    for(let prop in this.listeners){
      let l = this.listeners[prop]
      if(l._mounted && l.state){
        let futureState = {}
        for(let propName in l.hiveStateProps){
          let stateProp = l.hiveStateProps[propName]
          if(this.queue[stateProp] || writeAll){
            futureState[propName] = this._state[stateProp]
          }
        }
        Hive.log(futureState)
        if(!!Object.keys(futureState).length ){
          if( l.beforeStateChange ) l.beforeStateChange()
          l.setState(futureState) // Only updates if there is something to update
          Hive.log(l.constructor.name + " updated")
        }
      }
    }
    for(let prop in this.queue){
      delete this.queue[prop]
    }
  }

  openState(props){
    let context = arguments[arguments.length-1]
    if(typeof props != "object") return;
    let obj;
    if(Array.isArray(props)){
      obj = {}
      props.forEach(a=>{
        obj[a] = a
      })
    }else{
      obj = props;
    }
    context.hiveStateProps = obj;
    this.listen(context)
    let statePiece = {}
    for(let name in obj){
      let stateProp = obj[name]
      let val = this._state[stateProp]
      statePiece[name] = val
    }
    return statePiece;
  }
}

export default Hive