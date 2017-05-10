// @flow
import HivexConsole from '../misc/console'
import type Store from '../store'

export function listen(component:hivexReactComponent, context:Store) : void {
    // context is `this` in the Hivex Store
    let myHivex = context;

    let {
      componentDidMount: mountFunc,
      componentWillUnmount: unmountFunc,
      componentWillUpdate: willUpdateFunc,
      componentDidUpdate: didUpdateFunc,
      forceUpdate: forceUpdateFunc
    } = component

    component.componentDidMount = (...args) => {
      component._hivex_has_rendered = true;
      component._hivex_id = `${component.constructor.name}/timestamp/${Date.now()}/id/${Math.round(Math.random() * 10000000)}`
      component._hivex_mounted = true;
      component._hivex_mounted_at = new Date()
      myHivex.listeners[ component._hivex_id ] = component
      myHivex.updateListeners()
      try {
        if (mountFunc) mountFunc.apply(component, args)
      } catch (error) {
        HivexConsole.error(error)
      }
    }

    /**
     * runs original `componentWillUnmount` function, if one was there
     * sets _hivex_mounted to false and removes component from
     * the store's listeners
     * 
     * @param {any} args 
     */
    component.componentWillUnmount = (...args) => {

      try {
        if (unmountFunc) unmountFunc.apply(component, args)


      } catch (error) {
        HivexConsole.error(error)
      }
      component._hivex_has_rendered = false
      component._hivex_mounted = false;
      delete myHivex.listeners[ component._hivex_id ]

    }

    component.componentWillUpdate = (...args) => {
      try{
        if(willUpdateFunc) willUpdateFunc.apply(component, args)
      }
      catch(error){
        HivexConsole.error(error)
      }
      component._hivex_is_updating = true;
    }

    component.componentDidUpdate = (...args) => {
      try{
        if(didUpdateFunc) didUpdateFunc.apply(component, args)
      }
      catch(error){
        HivexConsole.error(error)
      }
      component._hivex_is_updating = false;
    }

    component.forceUpdate = (...args) => {
      component._hivex_is_updating = true;
      forceUpdateFunc.apply(component, args)
    }
  
}