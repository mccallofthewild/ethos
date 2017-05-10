import {
  observeProperties,
} from '../'

import {
  isObject,
} from '../utils'

const methods : { [string]: Array<string> } = {
  /*
  not necessary to overwrite getters because by the time the
  getter can be run, you have already accessed the object on state,
  and therefore already run the getter callback :)
  */
  
  setters:[
    'copyWithin','fill','pop','push','reverse','shift','sort','splice','unshift'
  ],
}

export default function overwrite(...observeArgs:observeArgs) : Array<any> {

        let [ obj, rootProp, getterCb, setterCb ] = observeArgs;

        // where the methods will be written to

        const dest = obj;
        console.log(obj, 'idkdude')
        methods.setters.forEach(
          (setter:string)=>{
            let originalFn : anycb = dest[setter];
            if( !(typeof originalFn == 'function') ) return;
            
            dest[setter] = function (...args){
              // `this` is scoped to whatever the array is
              args.forEach(
                $arg=>{
                  if(isObject($arg)) observeProperties($arg, rootProp, getterCb, setterCb);
                }
              )
              console.log('running setter')
              let rtnVal = originalFn.apply(dest, args);

              // setterCb runs after all changes are made.
              setterCb(rootProp)

              return rtnVal;

            }
        });

        // methods.getters.forEach(
        //   (getter:string)=>{
        //     let originalFn = dest[getter]
        //     if( !(typeof originalFn == 'function') ) return;
            
        //     dest[getter] = function (...args){ 
        //       // `this` is scoped to whatever the array is
        //       console.log('running getter')
        //       getterCb(rootProp)
        //       return originalFn.apply(dest, args);
        //     }
        // })

        // recursive
        // observeProperties(obj, rootProp, getterCb, setterCb)
        console.log('watching stuff')
        return obj
}