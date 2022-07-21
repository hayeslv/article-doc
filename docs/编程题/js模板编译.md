# JS模板编译的实现

编译是一种格式变成另一种格式的过程。编译会导致好的结果，比如**书写简单的代码，编译出来复杂的代码**；或者**提高代码的使用性能**。

这里只聊聊模板编译。



## 模板编译的简单实现

**写一个最简单的模板**

```html
<p>Hello, {{name}}!</p>
```

这个模板用数据 `{name: "world"}` 渲染后的结果是：

```html
<p>Hello, world!</p>
```

**解决方法**：最简单的方案，正则替换就行了

```js
const compile = function(template, data) {
  return template.replace(/{{(.+?)}}/g, (match, key) => data[key])
}

const template = "<p>Hello, I'm {{name}}! {{age}} years old!</p>"
const data = {
  name: "hayes",
  age: 18
}
const result = compile(template, data)
console.log(result); // <p>Hello, I'm hayes! 18 years old!</p>
```

缺点很明显，除了正则替换字段，其他啥都干不了，

来看看简单的嵌套需求：

- 模板

```html
<p>Hello, I'm {{user.name}}! {{user.age}} years old!</p>
```

- 渲染数据

```js
const data = {
	user: {
    name: "hayes",
    age: 18
  }
}
```

现在再使用上面的方法，就失效了。还用正则的话，会很难做。因为需要做语法/词法分析，来看看大括号内写的是什么了。



## 模板编译

其实对于上述的模板，也可以使用如下方式来写：

```js
const compile = function(data) {
  return `<p>Hello, I'm ${data.name}! ${data.age} years old!</p>`
}
```

好处：只需**一次编译**，之后再使用就只需要直接填充数据即可。而且也方便支持 `data.user.name` 这种形式。



### 工具：使用`new Function` 生成函数

生成一个函数，传入 `x` 和 `y`，执行 `return x + y` 来获得求和的功能

```js
const fn = new Function("x", "y", "return x + y");
```

打印 `fn`，可以看到输出的内容如下：

```js
ƒ anonymous(x,y) {
return x + y
}
```



### 1、构建模板生成函数

传入模板字符串，通过 `new Function` 方式返回一个新函数。新函数接收一个 `obj` 对象

```js
const compile = function(template) {
  // 模板字符串
  let result = "";
  // ...
  return new Function("obj", result);
}
```

### 2、正则替换

把 `{{xxx}}` 找出来，替换为 `obj.xxx`

```js
const compile2 = function(template) {
  // 模板字符串
  let result = template.replace(/{{(.+?)}}/g, (match, key) => {
    return `obj.${key}`
  });
  result = `return "${result}"`;
  return new Function("obj", result);
}
const template2 = "<p>Hello, I'm {{user.name}}! {{user.age}} years old!</p>"
const render2 = compile2(template2)
console.log(render2);
```

此时，函数打印如下：

```js
ƒ anonymous(obj
) {
return "<p>Hello, I'm obj.user.name! obj.user.age years old!</p>"
}
```

我们需要把字符串中的 `obj.user.name` 和 `obj.user.age` 变成动态的。

修改一下正则

```js
const compile2 = function(template) {
  // 模板字符串
  let result = template.replace(/{{(.+?)}}/g, (match, key) => {
    return `" + obj.${key} + "`  // 前后添上加号
  });
  result = `return "${result}"`;
  return new Function("obj", result);
}
const template2 = "<p>Hello, I'm {{user.name}}! {{user.age}} years old!</p>"
const render2 = compile2(template2)
console.log(render2);
```

再来看看函数的打印：

```js
ƒ anonymous(obj
) {
return "<p>Hello, I'm " + obj.user.name + "! " + obj.user.age + " years old!</p>"
}
```

**最终代码：**

```js
const compile = function(template) {
  // 模板字符串
  let result = template.replace(/{{(.+?)}}/g, (match, key) => {
    return `" + obj.${key} + "`
  });
  result = `return "${result}"`;
  // 或者如下形式
  // let result = template.replace(/{{(.+?)}}/g, (match, key) => {
  //   return `" + ${key} + "`
  // });
  // result = `with(obj) { return "${result}" }`;
  return new Function("obj", result);
}
const template = "<p>Hello, I'm {{user.name}}! {{user.age}} years old!</p>"
const render = compile(template)

const data = {
  user: {
    name: "hayes",
    age: 18
  }
}

const result = render(data)
console.log(result); // <p>Hello, I'm hayes! 18 years old!</p>
```

渲染结果：

```js
"<p>Hello, I'm hayes! 18 years old!</p>"
```























