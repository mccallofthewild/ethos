class Hive {
  constructor(store){
    Hive.intro()
    this._store = store
    this._state = store.state
    this._getters = store.getters
    this._setters = store.setters
    this._actions = store.actions

    this.listeners = {}
  }
  static intro(){
    console.group(`%c HIVE.js 🐝 \t\t\t`, `font-size:16px; background-color:black; color:white; padding:5px; width:100%;`)
    console.groupEnd()
  }
  static log(){
    console.group(`%c \t 🍯 \t 🍯 \t 🍯 \t `, `border-bottom:2px solid black; width:100%;`)
    console.log(...arguments);
    console.groupEnd()
  }
  static error(){
    console.group(`%c HIVE.js 🐝 \t\t\t`, `font-size:16px; background-color:black; color:white; padding:5px; width:100%;`)
    console.error(...arguments);
    console.error(`%c \t 🍯 \t 🍯 \t 🍯 \t `, `border-bottom:2px solid black; width:100%;`)
    console.groupEnd()
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
      this
      let res = this._getters[getter](this._state, payload)
      return res;
    }catch(error){
      console.error(error)
    }
  }
  
  change(setter, payload){
    let hive = this
    let methodArgs = {
      access: this.access.bind(this),
      change: this.change.bind(this),
      send: this.send.bind(this)
    }
      let res = this._setters[setter](this._state, payload, this.methodArgs)
      let update = hive.updateListeners.bind(hive)
      update()
  }

  send(action, payload){
    let hive = this
    let res = hive._actions[action](this.methodArgs, payload)
    let update = hive.updateListeners.bind(hive)
    update()
    return res;
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
          console.error(error)
        }
        context.id = `${context.constructor.name}/timestamp/${Date.now()}/id/${Math.round(Math.random()*10000000)}`
        context._mounted = true
        this.listeners[context.id] = context
    }
    
    context.componentWillUnmount = ()=>{
      try{
        unmountFunc.bind(context)()
      }catch(error){
        console.error(error)
      }
      context._mounted = false
      delete this.listeners[context.id]
    }
  }

  updateListeners(){
    let hive = this;
    for(let prop in this.listeners){
      let l = this.listeners[prop]
      if(l._mounted && l.state){
        let futureState = {}

        for(let prop in this._state){
          let val = l.state[prop]
          let update = this._state[prop]
          if(val){
            futureState[prop] = update;
          }
        }
        ( l.beforeStateChange || new Function() )();
        if(!!Object.keys(futureState).length) l.setState(futureState) // Only updates if there is something to update
      }
    }
  }

  openState(props){
    if(!props.length){
     throw new Error("No state properties were provided")
    }
    let obj = {}
    props.forEach(prop=>{
      obj[prop] = this._state[prop]
    })
    return obj;
  }
}

export default Hive