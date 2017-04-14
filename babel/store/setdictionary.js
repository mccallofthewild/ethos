// @flow
class SetDictionary {
    /**
     * Creates an instance of SetDictionary.
     * @param {any} {
     *     } 
     * 
     * @memberOf SetDictionary
     */
    data: Object;
    constructor({
    }: Object){
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
    has(key: String) : boolean {
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
    add(key:String, value: any) : void {
      if(this.has(key)) this.data[key].add(value)
      else this.data[key] = new Set([value])
    }
}

export default SetDictionary