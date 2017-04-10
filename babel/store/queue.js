class Queue {
  constructor(){
    this.container = {}
  }
  clear(){
    this.container = {}
  }
  remove(str){
    if(!typeof str == "string") throw new Error("argument to `remove` method on Queue must be string")
    delete this[str]
  }
  add(str){
    if(!typeof str == "string") throw new Error("argument to `add` method on Queue must be string")
    this[str] = true
  }

}

export default Queue