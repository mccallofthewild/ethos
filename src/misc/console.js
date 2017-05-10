// @flow
const HivexConsole : Object = {
  intro() : void {
    try{
      console.group(`%c HIVEX.js 🐝 \t\t\t`, `font-size:16px; background-color:black; color:white; padding:5px; width:100%;`)
      console.groupEnd()
    }catch(error){}
  },

  log(...args:any) : void {
    try{
      console.log(`🍯 `, ...args)
    }catch(error){}
  },

  error(...args:any) : void {
    try{
      console.group(`%c🍯 Hivex Error`, `font-size:12px;`)
      console.error(...args);
      console.groupEnd()
    }catch(error){}
  }
}
export default HivexConsole