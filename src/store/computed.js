// @flow
import Queue from './queue'
import SetDictionary from './setdictionary'
/**
 * 
 * 
 * @class Computed - For creating reactively updated properties
 */

type computedParams = {
  getter:(any)=>any,
  name:prop,
  getterQueue:Queue,
  setterQueue:Queue,
  destination:Object,
}

class Computed {
  /** 
   * Creates an instance of Computed.
   *     @callback {requestCallback} getter,
              * this getter should be computed based on properties in @param dictionary
   *     @prop {String} obj.name, 
   *     @param {Queue} queue,
            * A queue object which stores the root props which have been
            changed in the destination object
   *     @param {Object} destination,
   *  
   * 
   * 
   * @memberOf Computed
   */

  getter:()=>any;
  name:prop;
  getterQueue:Queue;
  setterQueue:Queue;
  destination:Object;
  dependencies:Set<prop>;

  constructor({
    getter,
    name,
    getterQueue,
    setterQueue,
    destination,
    dictionary
  } : computedParams){
    
    this.getter = getter
    this.name = name
    this.getterQueue = getterQueue;
    this.setterQueue = setterQueue;
    this.destination = destination
    this.dependencies = new Set();
    this.initialize()
  }

  /**
   * 
   * 
   * 
   * @memberOf Computed
   * updates the @prop destination with whatever the getter returns
   * adds prop to the setterQueue because it has been updated
   */
  update() : void {

    this.destination[this.name] = this.value

  }

  get value() : any {
    return this.getter(this.destination)
  }

  initialize() : void {
    /*
      This is essential to how Computed works.
      It adds the listener to the getterQueue to find out
      which properties it is dependent upon.
      When property values change and, as a result,
      properties are added to the setterQueue,
      `setterListener` fires and checks if the property
      is in the dependencies. If it is, the computed updates.
    */
    const getterListener = this.getterQueue.use(
      item=>{
        this.dependencies.add(item)
    })
    
    /*
     simply gets the value without updating state.
    */
    let value = this.value;

    this.getterQueue.retire(getterListener)

  }

  observe(){

    // adds an event listener for each prop in `this.dependencies`
    this.dependencies.forEach(
      (item)=>{

        this.setterQueue.addListener(
          item,
          ()=>{
            this.setterQueue.add(this.name);
          }
        )

      }
    )

  }

  

}

export default Computed;
