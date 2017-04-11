
const helpers = {

	descriptorIsClean(descriptor){
		/*
		 - If the value is an object, check if it has an accessible descriptor. 
		 - If it does, check that it is not already a Hivex Proxy.
		 - return bool
		*/
		return ( descriptor && !( descriptor.set && descriptor.set.name == "HivexSetter" ) )
	},

	canAddProxy(obj, prop){
    let value = obj[prop]
		let descriptor = Object.getOwnPropertyDescriptor(obj, prop);
		return ( typeof value == "object" && helpers.descriptorIsClean(descriptor)) 
	}

}

import Queue from '../store/queue.js'

class HivexProxy {
/*
  Takes in `obj` object, which is initially a store's state,
  and later is any object which is set or accessed in the state object.

  `rootStateProp` is the property directly on state which `obj` is a child of.
    if `rootStateProp` is undefined, we can infer that the proxy is on state itself,
    and the property being accessed ( `prop` ) is in fact the `rootStateProp`.
    When creating the initial Hivex `state` proxy, this should be `null`
  
  `cb` is the function that will be passed the `rootStateProp` every time a getter or
  setter is run. This was implemented to allow rootStateProps to be added to the queue.

*/

  constructor(obj, rootStateProp, cb){
    this.rootStateProp = rootStateProp;
		this.cb = cb;

    let {
      HivexGetter, 
      HivexSetter
    } = this.handler;

    /*
      Why use a constructor/class at all if we just
      return a different object anyway?
      - There are other ways to do it, but an ES6 class
        makes for clean code and gives the proxy closure.
    */

    return new Proxy(obj, {

      get:HivexGetter,

      set:HivexSetter

    });
  }

  get handler(){

    let rootStateProp = this.rootStateProp;
		let cb = this.cb;
    let checkedProps = new Queue();
    return {

      HivexGetter(obj, prop) {


					let rootProp = rootStateProp || prop;
          

          /* 
           - Check if proxy can be added, and add one if it can.

           - We only need to to this once because from this point on,
            any changes will be tracked by HivexSetter, and we don't
            need to proxy the value more than once.

           - * reason for queue * 
              Because this is a Proxy for the entire object, and not 
              just a getter for this specific property, we can't simply 
              flip a boolean once and be done with it: there could be 
              more object properties which need to be proxied.
          */

          if( !checkedProps.has(prop) ){

            checkedProps.add(prop)
            let value = obj[prop]

            if( helpers.canAddProxy(obj, prop, value) ){
              obj[prop] = new HivexProxy(value, rootProp, cb)
            }
          
          }

          return obj[prop]

      },

      HivexSetter(obj, prop, value){

					let rootProp = rootStateProp || prop;

          /*
            If property is being set with a value
            that is an object, we proxy it.
            Otherwise, set the value as usual.
          */
          obj[prop] = (typeof value == "object")? new HivexProxy(value, rootProp, cb) : value;

          /*
            Typically, cb will be the function adding the rootProp to the Store's queue
          */
					cb(rootProp)

          return true;

      }
      
    }

  }


}

export default HivexProxy;