// @flow
declare type anycb = (...any:any)=>?any

declare type reactComponent = {
  [any]:any
}

declare type hivexFormattedKeys = {
  [string] : string
}

declare type hivexReactComponent = {
  _hivex_mounted_at:Date,
  _hivex_mounted:boolean,
  _hivex_is_updating:boolean,
  _hivex_id:string,
  _hivex_has_rendered:boolean,
  hivexStateKeys:hivexFormattedKeys,

  componentDidMount: anycb,
  componentWillUnmount: anycb,
  componentWillUpdate: anycb,
  componentDidUpdate: anycb,
  forceUpdate: anycb,
  state:any
}

declare type prop = string|number