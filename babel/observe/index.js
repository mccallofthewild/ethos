// @flow
import {
    isObject
} from './utils'

import specials from './specials'

type descriptor = {
    get?:()=>any,
    set?:()=>any,
    configurable?:()=>any,
}

export function hivexObserve(obj:Object, getterCb:anycb, setterCb:anycb) : void {
    
    let descriptors = {}

    Object.getOwnPropertyNames(obj)
    .forEach(
        (prop)=> descriptors[prop] = getHivexDescriptor(obj, prop, [obj, prop, getterCb, setterCb])
    )
    Object.defineProperties(obj, descriptors);

}


export function observeProperties(...args:observeArgs) : Object {

    let [ 
            obj, rootProp, getterCb, setterCb
        ] = args;

    const blacklist = /(Map)/

    let protoString = obj.__proto__.constructor.name;

    if( blacklist.test(protoString) ) {
        obj =  specials[protoString](...args)
    }

    let descriptors = {}

    Object.getOwnPropertyNames(obj)
    .forEach(
        (prop)=> descriptors[prop] = getHivexDescriptor(obj, prop, args)
    )

    Object.defineProperties(obj, descriptors);
    
    return obj;

}

function getHivexDescriptor(obj, prop, observerArgs) : Object {

    let [ sameObj, rootProp, getterCb, setterCb ] = observerArgs;

    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);

    let {

        get:originalGetter=false,
        set:originalSetter=false,
        configurable,

    } = descriptor;

    if(!configurable){
        return descriptor;
    }
    let checked = false;
    let value = obj[prop]


    return {

        configurable: true,

        get: function HivexGetter(){

            if( !checked ){
                observerArgs[0] = value;
                if( isObject(value) ) observeProperties(...observerArgs)
                checked = true;
            }

            getterCb(rootProp)

            return originalGetter? originalGetter.call(obj) : value;
        },

        set: function HivexSetter(val){

            if( isObject(val) ) {
                observerArgs[0] = val;
                observeProperties(...observerArgs)
            }
            
            setterCb(rootProp)

            value = val;

            if(originalSetter) return originalSetter.call(obj, value) 

            return !!value;
        }

    }

}