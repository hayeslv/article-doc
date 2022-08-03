# Tree Shaking

- `webpack`中解释：`tree shaking` 是一个术语，通常用于描述移除 `JavaScript` 上下文中未引用的代码（`dead-code`）。它依赖于 `ES2015` 模块系统中的静态结构特性。

​		当 JS 代码达到一定体积时，将代码分成模块会更易于管理。但是，这样做可能会导入实际上未使用的代码。`Tree Shaking` 是一种通过消除最终文件中未使用的代码来优化体积的方法。



## 一、什么是 Tree Shaking

- 较早时候由 `rollup` 实现

官方说法：本质上消除无用的 JS 代码。

当引入一个模块时，并不引入整个模块的所有代码，而是只引入我需要的代码，那些我不需要的无用代码就会被 “摇掉”

- `webpack2` 开始也实现了 `tree-shaking` 功能

具体来说，在 `Webpack` 项目中，有一个入口文件，相当于一棵树的主干，入口文件有很多依赖的模块，相当于树的枝杈。而在实际情况中，虽然我们的功能文件依赖了某个模块，但其实只使用了其中的某些功能而非全部。

通过 `tree-shaking`，将没有使用的模块摇掉，这样就可以达到删除无用代码的目的。

- 问题

​		`tree-shaking` 虽然能够消除无用代码，但仅针对 `ES6` 模块语法，因为 `ES6` 模块采用的是静态分析，从字面量对代码进行分析。对于运行时才知道引用了什么模块的 `CommonJS` （动态分析模块）它就束手无策了。

​		不过可以通过插件将 `CommonJS` 转为 `ES6` 然后实现 `tree-shaking`。（`rollup-plugin-commonjs`）



### 背景

虽然 `Tree Shaking` 的概念早在 1990 年就已经被提出。

但真正应用在 `Javascript` 中，是在 ES6 模块规范被提出之后，因为只有模块是通过 `static` 方式引用时，`Tree Shaking` 才会起作用。

在 ES6 模块规范之前，我们使用 `require()` 语法的 `CommonJS` 模块规范。这些模块是 `dynamic` 动态加载的，这意味着我们可以根据代码中的条件导入新模块。

```js
var myModule
if(confition) {
  myModule = require("foo")
} else {
  myModule = require("bar")
}
```

`CommonJS` 模块的这种 `dynamic` 性质意味着无法应用 `Tree Shaking`，因为在实际运行代码之前无法确定需要哪些模块。

在 `ES6` 中，引入了模块的新语法，这是 `static` 的。使用 `import` 语法，我们不再能够动态导入模块。

如下所示的代码是不被允许的：

```js
if(condition) {
  import foo from "foo"
} else {
  import bar from "bar"
}
```

相反，我们必须在任何条件之外定义全局范围内的所有导入。

```js
import foo from "foo"
import bar from "bar"
if(condition) {
  // foo()
} else {
  // bar()
}
```

这种语法可以确定导入后使用的任何代码，而无需先运行这些代码。（可以有效的 `Tree Shaking`）



## 二、为什么需要 Tree Shaking

当今的 `Web` 应用越来越大，浏览器处理 `JavasSript` 是非常耗费资源（耗时）的，如果我们能将其中的无用代码去掉，仅提供有效代码给浏览器处理，无疑会减少浏览器的负担，而 `Tree Shaking` 正是解决了这一痛点。

从这个角度看，`Tree Shaking` 属于性能优化的范畴。

通过减少 `Javascript` 中的无用代码，来减少文件体积，浏览器加载资源的时间就会降低，进而减少用户打开页面所需的等待时间（增强用户体验）



## 三、Tree Shaking 是如何工作的

### 1、消除无用代码

**消除无用代码**：`dead code elimination`（DCE）

`Tree Shaking` 是 DCE 的一种新的实现，传统的 DCE 消灭不可能执行的代码，而 `Tree Shaking` 更关注消除没有用到的代码。

> **DCE**
>
> - 代码不会被执行，不可到达
> - 代码执行的结果不会被用到
> - 代码只会影响死变量，只写不读

传统编译型语言都是由编译器将**无用代码**从 AST （抽象语法树）中删除，`Tree Shaking` 更关注于消除那些引用了但并没有被使用的模块，这种消除原理依赖于 `ES6` 的模块特性。

> ES6 Module
>
> - 只能作为模块顶层的语句出现
> - `import` 的模块名只能是字符串常量
> - `import binding` 是 `immutable`（不可变）的



### 2、工作原理

- `ES6` 的模块引入是静态分析的，可以在编译时正确判断到底加载了什么代码
- 分析程序流，判断哪些变量被使用和引用了，打包这些代码

`Tree Shaking`核心：**分析程序流**

基于作用域，在 `AST` 过程中对函数或全局对象形成对象记录，然后再整个形成的作用域链对象中进行匹配 `import` 导入的标识，最后只打包匹配的代码，而删除那些未被匹配使用的代码。

> 注意：
>
> 1. 尽可能少写包含副作用的代码，比如修改全局变量这种操作。
> 2. 引用类实例化并调用实例上的方法后，也会产生 `rollup` 无法处理的副作用。





## 四、实例

### 1、消除变量

- `a.js`

```js
const a = 1
const b = 2

export default a
```

- `main.js`

```js
import a from "./a"

export default function() {
  console.log(a);
}
```

执行打包命令：`npx rollup .\src\main.js --file build.js` （打包 `main.js` 文件，打包好的内容放在 `build.js` 文件中）

- 最终打包结果（`build.js`）

```js
const a = 1;

function main() {
  console.log(a);
}

export { main as default };
```

可以发现，变量 `b` 是没有用到的。最终打包的文件中也就没有变量 `b` 存在。



### 2、消除函数

- `a.js`

```js
export const add = (a, b) => a + b
export const ride = (a, b) => a * b
```

- `main.js`

```js
import { add } from "./a"
const result = add(1, 2)
console.log(result);
```

- 执行打包命令后的结果（`build.js`）

```js
const add = (a, b) => a + b;

const result = add(1, 2);
console.log(result);
```

可以发现，函数 `ride` 是没有被打包进来的



## 五、副作用

有些代码，是在 `import` 时执行了一些行为，这些行为不一定和任何导出相关。例如 `polyfill`，通常是在项目中全局引入，而不是在主文件中通过导入的方式引用。

`Tree Shaking` 并不能自动判断哪些脚本是副作用，因此手动指定它们非常重要。

**webpack中使用**

`Tree Shaking` 通常是和打包工具配合使用的，例如 `Webpack`，只需要在配置文件中设置 `mode` 即可。

```js
// webpack.production.config.js
module.exports = {
  mode: "production"
}
```

要将某些文件标记为副作用，我们需要将它们添加到 `package.json` 文件中。

```js
{
  "sideEffects": [
    "./polyfill.js"
  ]
}
```





























