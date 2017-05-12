// @flow
import {
  observeProperties,
} from '../'

import {
  isObject,
} from '../utils'

const proto = {
  setters:[
    'delete', 'clear'
  ]
}


export default (...observeArgs:observeArgs)=>{
        let [ obj, rootProp, getterCb, setterCb ] = observeArgs;

        proto.setters.forEach(
          setter=>{
            let originalFn = obj[setter]
            if( !(typeof originalFn == 'function') ) return;
            
            obj[setter] = (...args)=>{
              let rtnVal = originalFn.call(obj, ...args)
              setterCb(rootProp)
              return rtnVal;
            }
            
          })

        let originalSet = obj.set
        obj.set = (key, value)=>{

          if( isObject(value) ){
            observeProperties(value, rootProp, getterCb, setterCb)
          }

          try{
            let rtnVal = originalSet.apply(originalSet, [key, value]);

            setterCb(rootProp);

            return rtnVal;

          }catch(error){}
        }


        obj.forEach(
          (value, key, map)=>{
            if( isObject(value) ){
              observeProperties(value, rootProp, getterCb, setterCb)
            }
          }
        )


        return obj
}