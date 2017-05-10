// @flow

import Queue from '../store/queue'
import Computed from '../store/computed'
import HivexConsole from '../misc/console'


const helpers = {

	descriptorIsClean(descriptor:Object) : boolean {
		/*
		 - If the value is an object, check if it has an accessible descriptor. 
		 - If it does, check that it is not already a Hivex Proxy.
		 - return bool
		*/
		return ( descriptor && !( descriptor.set && descriptor.set.name == "HivexSetter" ) )
	},

	canAddProxy(obj:Object, prop:prop){
    let value = obj[prop]
		let descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    /*
      its fine to assign something to the value of a computed property, but we don't
      need to make Computed values reactive.
    */
    const isObject = (typeof value == "object" && value instanceof Object)
		return ( !(value instanceof Computed) && isObject && !!value && helpers.descriptorIsClean(descriptor)) 
	}

}


type hivexProxyCbs = {
  getterCb:anycb,
  mutationCb:anycb,
}

/**
 * 
 * 
 * @class HivexProxy
 */
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

  /**
   * Creates an instance of HivexProxy.
   * @param {Object} obj - object to proxy
   * @param {String} rootStateProp - most 
   * @param {any} {getterCb, mutationCb} 
   * 
   * @memberOf HivexProxy
   */
  obj:Object;
  rootStateProp:?prop;
  getterCb:(any)=>any;
  mutationCb:(any)=>any;
  
  constructor(obj:Object, rootStateProp:?prop, {getterCb, mutationCb}:hivexProxyCbs){
    this.rootStateProp = rootStateProp;
		this.mutationCb = mutationCb;
    this.getterCb = getterCb;

    let {
      HivexGetter, 
      HivexSetter,
      HivexDeleteProperty,
    } = this.handler;

    /*
      Why use a constructor/class at all if we just
      return a different object anyway?
      - There are other ways to do it, but an ES6 class
        makes for clean code and gives the proxy closure.
    */

    return new Proxy(obj, {

      get:HivexGetter,

      set:HivexSetter,

      deleteProperty:HivexDeleteProperty,

    });
  }

  get handler() : Object {

    let rootStateProp = this.rootStateProp;
    let getterCb = this.getterCb;
		let mutationCb = this.mutationCb;
    
    let checkedProps = new Queue();
    return {

      /**
       * 
       * 
       * @param {Object} obj - The target of the proxy; Though they are in different scopes, 
       * this will be the same as the @param obj above.
       * @param {String} prop the property being accessed on @param obj
       * @returns @prop obj[prop]
       */
      HivexGetter(obj:Object, prop:prop, receiver:Proxy<*>) : any {


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

          let value = obj[prop]
          if( !checkedProps.has(prop) ){

            checkedProps.add(prop)

            if( helpers.canAddProxy(obj, prop, value) ){
              obj[prop] = new HivexProxy(value, rootProp, {getterCb, mutationCb})
            }
          
          }

          /*
            The general purpose of this is to
            pass `rootProp` up to the store to 
            find out which properties a `computed`
            value in the store requires
          */

          // if this is the root prop & it's not a computed
          getterCb(rootProp)

          if (prop === Symbol.iterator)
              return obj[Symbol.iterator].bind(obj);
          else if (typeof value == 'function')
            return value.bind(obj)
          else
              return Reflect.get(obj, prop, receiver);
      },

      /**
       * 
       * 
       * @param {Object} obj 
       * @param {String} prop 
       * @param {any} value 
       * @returns true
       */
      HivexSetter(obj:Object, prop:prop, value:any) : boolean {

					let rootProp = rootStateProp || prop;

          /*
            If property is being set with a value
            that is an object, we proxy it.
            Otherwise, set the value as usual.
          */
          const isObject = (typeof value == "object" && value instanceof Object)
          obj[prop] = (isObject)? new HivexProxy(value, rootProp, {getterCb, mutationCb}) : value;

          /*
            Typically, cb will be the function adding the rootProp to the Store's queue
          */
					mutationCb(rootProp)

          return true;

      },

      HivexDeleteProperty(obj:Object, prop:prop) : boolean {

					let rootProp = rootStateProp || prop;

          mutationCb(rootProp);

          delete obj[prop];

          return true;

      }
      
    }

  }


}

export default HivexProxy;