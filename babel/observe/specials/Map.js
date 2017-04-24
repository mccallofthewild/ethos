// @flow
import {
  observeProperties,
} from '../'

import {
  isObject,
} from '../utils'

const proto = {
  getters:[
    'get', 'has', 'entries', 'keys', 'values', 'forEach'
  ],
  
  setters:[
    'delete', 'clear'
  ]
}

// export  (...args:any)=>args


export default (...observeArgs:observeArgs)=>{
        let [ obj, rootProp, getterCb, setterCb ] = observeArgs;

        proto.setters.forEach(
          setter=>{
            let originalFn = obj[setter]
            if( !(typeof originalFn == 'function') ) return;
            
            obj[setter] = (...args)=>{
              originalFn.call(obj, ...args)
              setterCb(rootProp)
            }
            
          })

        let originalSet = obj.set
        obj.set = (key, value)=>{
          console.log(value, 'set')
          if( isObject(value) ){
            observeProperties(value, rootProp, getterCb, setterCb)
          }
          try{
            originalSet.apply(originalSet, [key, value])
          }catch(error){}
        }

        proto.getters.forEach(
          getter=>{
            let originalFn = obj[getter]
            if( !(typeof originalFn == 'function') ) return;
            
            obj[getter] = (...args)=>{
              originalFn.apply(obj, args)
              getterCb(rootProp)
            }
          }
        )

        obj.forEach(
          (value, key, map)=>{
            if(isObject(value)) observeProperties(value, rootProp, getterCb, setterCb)
          }
        )


        return obj
}