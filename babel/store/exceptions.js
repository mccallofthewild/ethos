function validateStateQuery(props){
  if(typeof props != "object"){
    throw new Error("first argument to openState must be an object or an array")
  }
}

export default {
  validateStateQuery,
}