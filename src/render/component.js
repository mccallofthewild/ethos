// @flow
import * as helpers from '../store/helpers.js';
import Queue from '../store/queue.js'
import Store from '../store'

function hivexId(name){
  let rnd = Math.random() * 10000000;
  return `${name}/timestamp/${Date.now()}/id/${Math.round( rnd )}`;
}

// willMount, didMount, willUpdate, didUpdate, render

export default class Component {

  __id:string;
  stateQuery:hivexFormattedQuery;
  mounted:boolean;
  updating:boolean;
  rendered:boolean;
  destination:Object;
  render:anycb;
  reactComponent:reactComponent;

  store:Store;
 
  constructor({

    name="AnonymousComponent",
    stateQuery={},
    rendered=true,
    mounted=true,
    updating=false,
    render,

  } : {

    name?:string,
    stateQuery?:Object,
    mounted?:boolean,
    updating?:boolean,
    rendered?:boolean,
    render:anycb,

  }, store:Store){

    this.__id = hivexId(name);
    this.mounted = mounted;
    this.rendered = rendered;
    this.updating = updating;

    this.stateQuery = stateQuery;

    this.store = store;

    if(typeof render !== 'function'){
      throw new Error(`render function not defined for hivex component`)
    }

    this.render = render;
  }

  defineLifecycleMethod(methodName:string, fn:anycb, context:any){
    // defining in object container to retain function name
    let container = {
      [methodName](){
        
      }
    }
  }

  mount(){
    this.store.listeners.set(this.__id, this)
    this.mounted = true;
    this.rendered = true;
    this.update();
  }

  unmount(){
    this.mounted = false;
    this.rendered = false;
    this.store.listeners.delete(this.__id, this);
  }

  update(){
      if( !this.updating && this.rendered) this.render()
  }
  
}