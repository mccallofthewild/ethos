class SealedObject{
	constructor(obj){
		return new Proxy(obj, {
			get(target, prop){
				return target[prop]
			},
			set(target, prop, value){
				throw new Error(`Cannot mutate ${prop} inside Hivex sealed object.`)
			}
		})
	}
}

export default SealedObject