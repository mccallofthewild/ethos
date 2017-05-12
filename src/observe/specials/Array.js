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

              let rtnVal = originalFn.apply(dest, args);

              // setterCb runs after all changes are made.
              setterCb(rootProp)

              return rtnVal;

            }
        });

        return obj
}