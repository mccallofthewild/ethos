function overwriteArrayMethod(name){
    let myHivex = this;
    let alias = Array.prototype[name];
    delete Array.prototype.splice;
    Array.prototype[name] = function(...args){

      let descriptor = Object.getOwnPropertyDescriptor(this, 0)
      let result = alias.apply(this, args)
      if(descriptor && descriptor.set && descriptor.set.name == "hivexSet"){
        let writeAll = !this.length;
        if(!writeAll){
          this[0] = this[0]
        }else{
          myHivex.updateListeners({writeAll});
        }
      }
      return result
    }
  }