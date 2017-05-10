// @flow

class SealedObject{
	constructor(obj:Object){
		return new Proxy(obj, {
			get(target, prop){
				return target[prop]
			},
			set(target:Object, prop:prop, value:any){
				throw new Error(`Cannot mutate ${prop} inside Hivex sealed object.`)
			}
		})
	}
}

export default SealedObject