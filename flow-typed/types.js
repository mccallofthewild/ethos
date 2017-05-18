// @flow


// a hack to get VScode flow to work
import _Source from '../src/store';
import _Queue from '../src/store/queue';
import _Listener from '../src/render/listener';

declare type Source = _Source;

declare type Queue = _Queue;

declare type Listener = _Listener;
// end hack


declare type what = [Source, Queue, Listener];

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
  string|openQuery, openQuery|Listener, Listener
];

declare type formattedOpenArgs = [
  string, openQuery, Listener
];

declare type hivexComponentData = Listener;
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

