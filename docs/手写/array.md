# 数组相关的手写

## 1、实现数组的map方法

数组的 `map()` 会返回一个新的数组，这个新数组中的每个元素对应原数组中对应位置的元素调用一次提供的函数后的返回值。

`map` 需要传入两个参数，第一个是**回调函数**，第二个是回调函数的 `this` 指向的值



**注意：**

- 回调函数必须是一个函数
- 调用该方法的对象必须是数组
- 如果数组大小为0，则直接返回空数组

**用法：**

```js
const a = [1, 2, 3, 4];
const b = a.myMap(v => v*2);
console.log(b); // [2, 4, 6, 8]
```

**代码实现：**

```js
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
```

**在使用层面：**

- 可以向 `map` 传入两个参数
  - 参数1是回调函数
  - 参数2是参数1的 `this` 指向
- 可以从 `map` 参数1的回调函数中获得三个回调参数
  - `value` 、 `index` 、当前数组



**使用reduce实现数据的map方法：**

```js
Array.prototype.myMap = function(callback, thisArg) {
  if(!Array.isArray(this)) throw new TypeError("this不是一个数组");
  if(typeof callback !== "function") return new TypeError(callback + "不是一个函数");
  if(this.length === 0) return []

  let res = []
  this.reduce((pre, cur, index, arr) => {
    return res[index] = callback.call(thisArg, cur, index, arr)
  }, [])
  return res
}
```



## 2、实现数组的reduce方法

`reduce` 方法接收一个函数作为累加器，数组中的每个值（从左往右）开始缩减，最终变成一个值

**参数：**

- `callback`：回调函数
  - `previousValue`：上次调用回调函数时的返回值，或者初始值
  - `currentValue`：当前正在处理的数组元素
  - `currentIndex`：当前正在处理的数组元素下标
  - `array`：调用 `reduce` 方法的数组
- `initialValue`：可选的初始值，作为第一次调用回调函数时传给 `previousValue`（回调函数的第一个参数）的值

**代码实现：**

```js
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
```

**测试代码：**

```js
const fn = (prev, cur, index) => {
  return prev + cur
}
const arr = [1,2,3,4]
var b = arr.myReduce(fn, 10)
var c = arr.myReduce(fn)

console.log(b); // 20
console.log(c); // 10
```









