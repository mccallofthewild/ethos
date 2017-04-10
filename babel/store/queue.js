class Queue {
  constructor(){
    this.container = {}
  }
  has(str){
    // To check if property is in the queue
    if(!typeof str == "string") throw new Error("argument to `remove` method on Queue must be string")
    return this.container.hasOwnProperty(str)
  }
  get isPopulated(){
    /*
     To check if queue is not empty. 
     Not neccessary to loop through entire object
     (Object.keys) to do this
    */
    let populated = false;
    for( let prop in this.container ){
      populated = true;
      break;
    }
    return populated;
  }
  clear(){
    // Clears queue
    this.container = {}
  }
  remove(str){
    // Removes property from queue
    if(!typeof str == "string") throw new Error("argument to `remove` method on Queue must be string")
    delete this.container[str]
  }
  add(str){
    // Adds property to queue
    if(!typeof str == "string") throw new Error("argument to `add` method on Queue must be string")
    this.container[str] = true
  }

}

export default Queue