// @flow
import * as helpers from '../store/helpers.js';
import Queue from '../store/queue.js'
import Source from '../store'
import * as listener_events from '../events/listener'
function hivexId(name){
  let rnd = Math.random() * 10000000;
  return `${name}/timestamp/${Date.now()}/id/${Math.round( rnd )}`;
}

// willMount, didMount, willUpdate, didUpdate, render

export default class Listener {

  __id:string;
  mounted:boolean;
  updating:boolean;
  rendered:boolean;
  destination:Object;
  dependencies:Set<prop>;
  render:anycb;
  events:Queue;
 
  store:Source;
  trigger:anycb;
  dirty:boolean;
 
  constructor({ 

    name="AnonymousComponent",
    rendered=true,
    mounted=true,
    updating=false,
    dependencies,
    render,

  } : {

    name?:string,
    mounted?:boolean,
    updating?:boolean,
    rendered?:boolean,
    dependencies:Array<prop>,
    render:anycb,

  }, store:Source){

    this.__id = hivexId(name);
    this.mounted = mounted;
    this.rendered = rendered;
    this.updating = updating;

    this.dependencies = new Set(dependencies);
    this.store = store;

    this.events = new Queue();

    if(typeof render !== 'function'){
      throw new Error(`render function not defined for hivex component`)
    }

    this.dirty = true

    this.render = render;
    
  }

  emit(event:prop){ 
    this.events.add(event)
  }

  on(event:prop, cb:anycb){
    switch(event){
      case listener_events[event]:
        this.events.addListener(event, cb)
        break;
      default:
        throw new Error(`Event ${event} does not exist!`) 
    }

  }

  check(prop:prop){ 
    switch(true){
      case this.dependencies.has(prop):
        this.dirty = true;
        break;
    }
  }

  defineLifecycleMethod(methodName:string, fn:anycb, context:any){
    // defining in object container to retain function name
    let container = {
      [methodName](){
        
      }
    }
  }

  mount(){
    this.mounted = true;
    this.rendered = true;
    this.update();
    this.emit(listener_events.MOUNT)
  }

  unmount(){
    this.mounted = false;
    this.rendered = false;
    this.emit(listener_events.UNMOUNT)
  }

  update(){
      if( !this.updating && this.rendered && this.mounted && this.dirty ) this.render()
  }
  
}