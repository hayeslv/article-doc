# 数组相关的手写

## 1、实现数组的map方法

数组的 `map()` 会返回一个新的数组，这个新数组中的每个元素对应原数组中对应位置的元素调用一次提供的函数后的返回值。

`map` 需要传入两个参数，第一个是**回调函数**，第二个是回调函数的 `this` 指向的值



**注意：**

- 回调函数必须是一个函数
- 调用该方法的对象必须是数组
- 如果数组大小为0，则直接返回空数组

用法：

```js
const a = [1, 2, 3, 4];
const b = a.myMap(v => v*2);
console.log(b); // [2, 4, 6, 8]
```

代码实现：

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

