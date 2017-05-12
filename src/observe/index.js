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

/**
 * for properties on the root of the observed object (typically state)
 * ( no root prop passed )
 * 
 * @export
 * @param {Object} obj 
 * @param {anycb} getterCb 
 * @param {anycb} setterCb 
 */
export function hivexObserve(obj:Object, getterCb:anycb, setterCb:anycb) : void {

    let descriptors = {}

    Object.getOwnPropertyNames(obj)
    .forEach(
        (prop)=> descriptors[prop] = getHivexDescriptor(obj, prop, [obj, prop, getterCb, setterCb])
    )
    Object.defineProperties(obj, descriptors);

}


/**
 * for nested properties in the observed object (requires root prop)
 * 
 * @export
 * @param {...observeArgs} args 
 * @returns {Object} 
 */
export function observeProperties(...args:observeArgs) : Object {

    let [
            obj, rootProp, getterCb, setterCb
        ] = args;


    let descriptors = {}

    Object.getOwnPropertyNames(obj)
    .forEach(
        (prop)=> descriptors[prop] = getHivexDescriptor(obj, prop, args)
    )

    Object.defineProperties(obj, descriptors);
    
    /*
     Define properties first to avoid applying unnecessary getters/setters to
     methods overwritten on blacklisted objects
    */
    const blacklist = /(Map|Array)/

    const protoString = obj.__proto__.constructor.name;

    const isBlacklisted = blacklist.test(protoString);
    
    if( isBlacklisted ) {
        obj = specials[protoString](...args)
    }
    
    return obj;

}

function getHivexDescriptor(obj, prop, observerArgs) : Object {

    let [ sameObj, rootProp, getterCb, setterCb ] = observerArgs;

    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);

    const {

        get:originalGetter=false,
        set:originalSetter=false,
        configurable,
        enumerable,

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
            

            value = val;

            /*
             setterCb must run AFTER the value is set,
             or it will be updating on an old value
            */
            setterCb(rootProp)

            if(originalSetter) return originalSetter.call(obj, value) 

            return value;
        }

    }

}