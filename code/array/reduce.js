Array.prototype.myReduce = function(callback, initialValue) {
  if(this[0] === undefined && initialValue === undefined) return new TypeError("reduce数组为空并且初始值为空")
  // 初始值value，默认使用传参initialValue，如果initialValue没值则使用数组的第一个值
  let value = initialValue === undefined ? this[0] : initialValue
  // 使用数组第一个值作为初始值，则遍历的下标就得从1开始
  let i = initialValue === undefined ? 1 : 0
  for(i; i<this.length; i++) {
    value = callback(value, this[i], i)
  }
  return value
}

const fn = (prev, cur, index) => {
  return prev + cur
}
const arr = [1,2,3,4]
var b = arr.myReduce(fn, 10)
var c = arr.myReduce(fn)

console.log(b); // 20
console.log(c); // 10