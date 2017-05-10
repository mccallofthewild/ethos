// @flow

export function applyState(component:reactComponent, futureState:Object) : Promise<> {
  return new Promise((resolve, reject)=>{
    try{
      component.setState()
    }catch(error){

    }
  })
}