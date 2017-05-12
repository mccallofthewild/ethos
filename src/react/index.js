// @flow
import HivexConsole from '../misc/console'

import Component from '../render/component'

import Store from '../store'



export function listen(component:hivexReactComponent, context:Store) : void {
    // context is `this` in the Hivex Store
    let myHivex : Store = context;

    let {

      componentDidMount: mountFunc,
      componentWillUnmount: unmountFunc,
      componentWillUpdate: willUpdateFunc,
      componentDidUpdate: didUpdateFunc,
      forceUpdate: forceUpdateFunc

    } = component;

    const hivexComponent = new Component({

      name:component.constructor.name,
      destination:component.state,
      render:()=>{
        component.forceUpdate()
      }
      
    }, context)

    component.componentDidMount = (...args) => {
      
      hivexComponent.mount();

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

      hivexComponent.unmount();

      try {
        
        if (unmountFunc) unmountFunc.apply(component, args)

      } catch (error) {
        HivexConsole.error(error)
      }

      myHivex.listeners.delete(component.__hivex.__id)

    }

    component.componentWillUpdate = (...args) => {
      try{
        if(willUpdateFunc) willUpdateFunc.apply(component, args)
      }
      catch(error){
        HivexConsole.error(error)
      }
      hivexComponent.updating = true;
    }

    component.componentDidUpdate = (...args) => {
      try{
        if(didUpdateFunc) didUpdateFunc.apply(component, args)
      }
      catch(error){
        HivexConsole.error(error)
      }
      component.__hivex.updating = false;
    }

    // component.forceUpdate = (...args) => {
    //   component.__hivex.updating = true;
    //   forceUpdateFunc.apply(component, args)
    // }
  
}