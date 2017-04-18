// @flow
import Computed from './computed'
class SetDictionary<TYPE>{
    /**
     * Creates an instance of SetDictionary.
     * @param {any} {
     *     } 
     * 
     * @memberOf SetDictionary
     */
    data: { [any]:Set<TYPE> };

    constructor(){
      this.data = {}
    }
    /**
     * 
     * 
     * @param {String} key 
     * @returns {Boolean}
     * 
     * @memberOf SetDictionary
     */
    has(key: string | number) : boolean {
      return this.data.hasOwnProperty(key)
    }
    /**
     * 
     * 
     * @param {String} key 
     * @param {any} value 
     * 
     * @memberOf SetDictionary
     */
    add(key:string, value: TYPE) : void {
      if(this.has(key)) this.data[key].add(value)
      else this.data[key] = new Set([value])
    }

    access(key:string) : Set<TYPE>{
      return this.data[key];
    }
}

export default SetDictionary