```js
Array.prototype.myMap = function(callback, thisValue) {
  const result = []
  thisValue = thisValue || []
  const arr = this
  for(let item of arr) {
    console.log(item);
    result.push(callback(item))
  }
  // 会多打印一个myMap
  // for(let i in arr) {
  //   console.log(i);
  //   result.push(callback(arr[i]))
  // }
  return result
}

const arr1 = [1,2,3]
const arr2 = arr1.myMap(v => v * 2)
console.log(arr2);
```