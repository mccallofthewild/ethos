
const handler = {
  get: HivexGetter,
	set: HivexSetter
};

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
  
  `cb` is the function that will be passed the `rootStateProp` every time a getter or
  setter is run. This was implemented to allow rootStateProps to be added to the queue.

*/

  constructor(obj, rootStateProp, cb){
    this.rootStateProp = rootStateProp;
		this.cb = cb;
    return new Proxy(obj, this.handler);
  }

  get handler(){

    let rootStateProp = this.rootStateProp;
		let cb = this.cb;

    return {

      HivexGetter(obj, prop) {

          let value = obj[prop]

					rootStateProp = rootStateProp || prop;

          /* 
           - Check if proxy can be added, and add one if it can.
          */

          if( helpers.canAddProxy(obj, prop, value) ){
            obj[prop] = new HivexProxy(value, rootStateProp, cb)
          }

          return obj[prop]

      },

      HivexSetter(obj, prop, value){

					rootStateProp = rootStateProp || prop;

          obj[prop] = (typeof value == "object")? new HivexProxy(value, rootStateProp, cb) : value;

					cb(rootStateProp)

          return true;

      }
      
    }

  }


}