// @flow


// a hack to get VScode flow to work
import _Store from '../src/store';
import _Queue from '../src/store/queue';
import _Component from '../src/render/component';

declare type Store = _Store;

declare type Queue = _Queue;

declare type Component = _Component;
// end hack


declare type what = [Store, Queue, Component];

declare type observeArgs = [ Object, prop, anycb, anycb ]

declare type anycb = (...any:any)=>?any

declare type ObjectType<T> = {
  [prop]:T
}

declare type reactComponent = {
  [any]:any
}

declare type hivexFormattedQuery = {
  [string] : string
}

declare type openQuery = Array<prop> | ObjectType<prop>;

declare type openArgs = [
  string|openQuery, openQuery|Component, Component
];

declare type formattedOpenArgs = [
  string, openQuery, Component
];

declare type hivexComponentData = {
    __id:string,
    stateQuery:hivexFormattedQuery,
    mounted:boolean,
    updating:boolean,
    rendered:boolean,
}

declare type hivexReactComponent = {
  __hivex:hivexComponentData,

  componentWillMount: anycb,
  componentDidMount: anycb,
  componentWillUnmount: anycb,
  componentWillUpdate: anycb,
  componentDidUpdate: anycb,
  forceUpdate: anycb,
  state:Object,
}

declare type prop = string|number

