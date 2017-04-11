function validateObjectQuery(props){
  if(typeof props != "object"){
    throw new Error("first argument to object query must be an object or an array")
  }
}

export default {
  validateObjectQuery,
}