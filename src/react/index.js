// @flow
import HivexConsole from '../misc/console'
import type Store from '../store'
import Component from '../render/component'

export function listen(component:hivexReactComponent, context:Store, stateQuery:Object) : void {
    // context is `this` in the Hivex Store
    let myHivex = context;

    const hivexComponent = new Component({
      name:component.constructor.name,
      stateQuery,
      destination:component.state,
      reactComponent:component,
      render(){
        component.forceUpdate()
      }
    }, context)

    component.__hivex = hivexComponent;

    let {
      componentDidMount: mountFunc,
      componentWillUnmount: unmountFunc,
      componentWillUpdate: willUpdateFunc,
      componentDidUpdate: didUpdateFunc,
      forceUpdate: forceUpdateFunc
    } = component

    component.componentWillMount = (...args) => {

      component.__hivex.rendered = true;
      component.__hivex.mounted = true;
      myHivex.listeners.set(component.__hivex.__id, hivexComponent)
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
      component.__hivex.rendered = false
      component.__hivex.mounted = false;
      myHivex.listeners.delete(component.__hivex.__id)

    }

    component.componentWillUpdate = (...args) => {
      try{
        if(willUpdateFunc) willUpdateFunc.apply(component, args)
      }
      catch(error){
        HivexConsole.error(error)
      }
      component.__hivex.updating = true;
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

    component.forceUpdate = (...args) => {
      component.__hivex.updating = true;
      forceUpdateFunc.apply(component, args)
    }

    

  
}