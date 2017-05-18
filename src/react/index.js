// @flow
import HivexConsole from '../misc/console'
import type Store from '../store'
import Listener from '../render/listener'

export function listen(component:hivexReactComponent, context:Store, dependencies:Array<prop>) : Listener {
    // context is `this` in the Hivex Store
    let myHivex = context;

    const hivexComponent = new Listener({
      name:component.constructor.name,
      dependencies,
      destination:component.state,
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

    component.componentDidMount = (...args) => {

      hivexComponent.rendered = true;
      hivexComponent.mounted = true;
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
      hivexComponent.rendered = false
      hivexComponent.mounted = false;

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
      hivexComponent.updating = false;
    }

    component.forceUpdate = (...args) => {
      hivexComponent.updating = true;
      forceUpdateFunc.apply(component, args)
    }


    return hivexComponent;

  
}