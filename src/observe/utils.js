// @flow
export function isObject(data:any) : boolean {
  return (typeof data == "object") && (data !== null)
}