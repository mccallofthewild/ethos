
const helpers = {

	descriptorIsClean(descriptor){
		/*
		 - If the value is an object, check if it has an accessible descriptor. 
		 - If it does, check that it is not already a Hivex Proxy.
		 - return bool
		*/
		return ( descriptor && !( descriptor.set && descriptor.set.name == "HivexSetter" ) )
	},

	canAddProxy(obj, prop, value){
		let descriptor = Object.getOwnPropertyDescriptor(obj, prop);
		return ( typeof value == "object" && helpers.descriptorIsClean(descriptor)) 
	}

}



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

    return new Proxy(obj, {

      get:HivexGetter,

      set:HivexSetter

    });
  }

  get handler(){

    let rootStateProp = this.rootStateProp;
		let cb = this.cb;
    let checkedForChildObject = false;
    return {

      HivexGetter(obj, prop) {

          let value = obj[prop]

					let rootProp = rootStateProp || prop;
          

          /* 
           - Check if proxy can be added, and add one if it can.
          */

          if( !checkedForChildObject && helpers.canAddProxy(obj, prop, value) ){
            checkedForChildObject = true;
            obj[prop] = new HivexProxy(value, rootProp, cb)
          }

          return obj[prop]

      },

      HivexSetter(obj, prop, value){

					let rootProp = rootStateProp || prop;

          obj[prop] = (typeof value == "object")? new HivexProxy(value, rootProp, cb) : value;

					cb(rootProp)

          return true;

      }
      
    }

  }


}

export default HivexProxy;