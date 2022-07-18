// thisArg：执行callback函数时，被用作this
Array.prototype.myMap = function(callback, thisArg) {
  // this代表当前数组，因为是数组来调用的map方法
  if(!Array.isArray(this)) throw new TypeError("this不是一个数组");
  if(typeof callback !== "function") return new TypeError(callback + "不是一个函数");
  if(this.length === 0) return []

  let res = []
  for(let i=0; i<this.length; i++) {
    res[i] = callback.call(thisArg, this[i], i, this) // map的三个参数：当前遍历值，当前遍历位置，整个数组
  }
  return res
}


const arr1 = [1,2,3]
const arr2 = arr1.myMap(v => v * 2)
console.log(arr2);