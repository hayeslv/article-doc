# newFunction语法

这是一种创建函数的方法，很少被使用，但有些时候只能选择它。



## 语法

创建函数的语法：函数的参数首先出现，而函数体在最后。所有参数都是字符串的形式。

```js
const func = new Function([arg1, arg2, ..., argN], functionBody);
```

- 示例1：一个带有两个参数的函数

```js
const sum = new Function("a", "b", "return a + b");
console.log(sum(1, 2)); // 3
// 等价于
function sum(a, b) {
  return a + b
}
```

- 示例2：没有参数的函数

```js
const sayHi = new Function(`alert("hi")`);
sayHi(); // hi
// 等价于
function sayHi() {
  alert("hi")
}
```

这种函数最大的不同之处在于，它实际上是运行时通过参数传递的字符串创建的

原本的函数需要在运行之前就声明好，而 `new Function` 则是在运行时创建的函数

```js
// 从远程接收一个函数并执行它
let str = "...远程的代码..."
let func = new Function(str)
func()
```

使用 `new Function` 创建函数的应用场景比较特殊，比如在复杂的 Web 应用程序中，我们需要从远程（服务器或cdn）获取代码或者动态地从模板编译函数时才会使用。



## 特点

我们使用 `new Function` 创建的函数，它的环境并不指向当前的上下文（词法环境），而是指向全局上下文（只能访问全局变量）。

```js
function getFunc() {
  let name = "hayes"
  let func = new Function("console.log(name)")
  return func
}
getFunc()() // name is not defined
```

与正常函数做对比

```js
function getFunc() {
  let name = "hayes"
  let func = function(){ console.log(name) }
  return func
}
getFunc()() // "hayes"，从 getFunc 的词法环境中获取的
```

`new Function` 的这种特性看起来有点奇怪，不过在实际中却非常有用。

如果我们必须通过一个字符串来创建一个函数。在编写代码时我们是不知道该函数的具体代码的（这也是为什么我们不用常规方法创建函数），但在执行过程中会知道具体代码。一般是通过远程方式获取。

`new Function` 创建的函数需要和主脚本进行互动。

问题在于，将 `JavaScript` 发布到生产环境前，会对其进行压缩，通过删除多余的注释和空格等代码，更重要的是，会将局部变量命名为更短的变量。

> 如果函数中存在变量 `let userName`，压缩程序会把它替换为 `let a`（如果 `a` 已被占用了，那就使用其他字符），剩余的局部变量也会被进行类似的替换。
>
> 一般来说这样的替换是安全的，毕竟这些变量是函数内的局部变量，函数外的任何东西都无法访问它。
>
> 在函数内部，压缩程序会替换所有使用了这些变量的代码，它会分析代码的结构，而不是硬生生地查找然后替换，因此它不会“破坏”你的程序。
>
> 但在这种情况下，如果 `new Function` 可以访问自身函数以外的变量，它也很有可能无法找到重命名的 `userName`，这是因为新函数的创建在代码压缩以后，变量名已经被替换了。

即使我们可以在 `new Function` 中访问外部的词法环境，我们也会受挫于压缩程序。

所以，当我们需要向 `new Function` 创建出的新函数传递数据时，必须**显式地通过参数进行传递**。

```js
const fn = new Function("a", "b", "return a + b");
fn(1, 2) // 3
```









































