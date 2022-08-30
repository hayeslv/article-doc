# webpack-dev-server原理解析

`webpack-dev-server` 为你提供了一个简单的 `web` 服务器，能够实时重新加载。



## 静态资源服务

​		`webpack-dev-server` 会使用当前路径作为请求的资源路径，就是我们运行 `webpack-dev-server` 命令的路径。可以通过指定 `content-base` 来修改这个默认行为，这个路径标识的是静态资源的路径。

​		`content-base` 只和我们的静态资源相关（也就是图片、数据等），需要和 `output.publicPath 和 output.path` 做一个区分，后面两者指定的是我们打包出文件存放的路径，`output.path` 是我们实际的存放路径，设置的 `output.publicPath` 会拿我们打包出的 `html` 来替换 `path` 路径，但是它所指向的也是我们的 `output.path` 打包的文件。

例如我们有这么一个配置：

```js
output: {
  filename: "[name].[hash].js", // 打包后的文件名称
  path: path.resolve(__dirname, ".hmbird"), // 打包后的路径，resolve拼接绝对路径
  publicPath: "http://localhost:8080/"
}
```

打包出的 `html` 模块

```html
<body>
  <script type="text/javascript" src="http://localhost:8080/app.********.js"></script>
</body>
```

如果我们 `contentBase` 指定的静态资源路径下有一个 `index.html`，并且打包出的结果页中也有一个 `index.html`，也就是两个文件的访问路径相同的话，会返回哪一个文件？

​	结果：返回我们打包处理的结果页面，静态资源的优先级是低于打包出的文件的。



### 如何提供的静态资源服务？

原理其实就是启动了一个 `express` 服务器，调用 `app.static` 方法

源码如下：

```js
setupStaticFeature() {
  const contentBase = this.options.contentBase;
  const contentBasePublicPath = this.options.contentBasePublicPath;
  if(Array.isArray(contentBase)) {
    // 1、数组
    contentBase.forEach((item) => {
      this.app.use(contentBasePublicPath, express.static(item));
    })
  } else if(isAbsoluteUrl(String(contentBase))) {
    // 2、绝对的url路径（例如：http://www.**.com/src） 不推荐使用，建议通过proxy来进行设置
    this.log.warn(
      'Using a URL as contentBase is deprecated and will be removed in the next major version. Please use the proxy option instead.'
    );

    this.log.warn(
      'proxy: {\n\t"*": "<your current contentBase configuration>"\n}'
    );
    
    // 重定向我们的请求到contentBase
    this.app.get("*", (req, res) => {
      res.writeHead(302, {
        Location: contentBase + req.path + (req._parsedUrl.search || "")
      })
      res.end()
    })
  } else if(typeof contentBase === "number") {
    // 3、数字，不推荐使用
    this.log.warn(
      'Using a number as contentBase is deprecated and will be removed in the next major version. Please use the proxy option instead.'
    );

    this.log.warn(
      'proxy: {\n\t"*": "//localhost:<your current contentBase configuration>"\n}'
    );
    
    // 重定向请求到contentBase
    this.app.get("*", (req, res) => {
      res.writeHead(302, {
        Location: `//localhost:${contentBase}${req.path}${req._parsedUrl.search || ""}`
      })
      res.end()
    })
  } else {
    // 4、字符串
    this.app.use(
    	contentBasePublicPath,
      express.static(contentBase, this.options.staticOptions)
    )
  }
}
```



## 热更新

通过建立 `websocket` 实现服务端和客户端的双向通讯，当我们的服务端发生变化时可以通知客户端进行页面的刷新。

实现的方式主要有两种：`iframe mode` 和 `inline mode`

### 1、`iframe mode`

我们的页面被嵌套在一个 `iframe` 中，当资源改变的时候会重新加载，只需要在路径中加入 `webpack-dev-server` 就可以了。不需要其他任何处理。（`http://localhost:8080/webpack-dev-server/index.html`）

![1](.\assets\1.jpg)

### 2、`inline mode`

不在单独引入一个 `js`，而是将创建客户端 `socket.io` 的代码一同打包进我们的 `js` 中



### `webpack-dev-server`是如何实现HRM（模块热更新）的呢？

也就是在不刷新页面的情况下实现页面的局部刷新。

​		`Webpack` 会从**修改模块**开始根据**依赖关系**往入口方向查找热加载接收代码。如果没有找到的话，默认是会刷新整个页面的。如果找到的话，会替换那个模块的代码为修改后的代码，并且从替换模块到接收热加载之间的模块的**相关依赖模块**都会重新执行---返回新模块值，替换点模块缓存。

​		简单来说就是，有一个 `index.js` 引入了一个文件的 `home.js`，如果我们修改了 `home.js` 内容，热加载模块如果在 `home.js` 则只更新 `home.js`；如果在 `index.js` 则更新 `index.js` 和 `home.js` 两个文件的内容。如果这两个文件都没有热更新模块，则刷新整个页面。

![2](.\assets\2.jpg)

上图注释：

绿色是 `webpack` 控制区域，蓝色是 `webpack-dev-server` 控制区域，红色是文件系统，青色是我们项目本身。

- 第一步：**`webpack`监听文件变化并打包（1、2）**


`webpack-dev-middleware` 调用 `webpack` 的 `api` 对文件系统 `watch`，当文件发生改变后，`webpack` 重新对文件进行编译打包，然后保存到内存中。打包到了内存中，不生成文件的原因就在于访问内存中的代码比访问文件系统中的文件更快，而且也减少了代码写入文件的开销。

- 第二步：**`webpack-dev-server` 对静态文件的监听（3）**

`webpack-dev-server` 是对文件变化的一个监控，这一步不同于第一步，并不是监控代码变化重新打包。当我们在配置文件中配置了 `devServer.watchContentBase` 为 `true` 的时候，`Server` 会监听这些配置文件夹中静态文件的变化，变化后会通知浏览器对应用进行 `live reload`。

注意：这里是浏览器刷新，和 `HRM` 是两个概念。

- 第三步：**`devServer` 通知浏览器端文件发生改变（4）**

`sockjs` 在服务端和浏览器端建立了一个 `webSocket` 长连接，以便将 `webpack` 编译和打包的各个阶段状态告知浏览器，最关键的步骤还是 `webpack-dev-server` 调用 `webpack api` 监听 `compile` 的 `done` 事件，当 `compile` 完成后，`webpack-dev-server` 通过 `_sendStatus` 方法将编译打包后的新模块 `hash` 值发送到浏览器端。

- 第四步：**`webpack` 接收到最新 `hash` 值验证并请求模块代码（5、6）**

`webpack-dev-server/client` 端并不能个请求**更新的代码**，也不会执行热更模块操作，而是把这些工作又交回给了 `webpack`，`webpack/hot/dev-server` 的工作就是根据 `webpack-dev-server/client` 传给它的信息以及 `dev-server` 的配置决定是**刷新浏览器**还是进行**模块热更新**。当然如果仅仅是刷新浏览器（执行步骤11），也就没有后面那些步骤了。

- 第五步：**`HotModuleReplacement.runtime` 对模块进行热更新（7、8、9）**

`HotModuleReplacement.runtime` 是客户端 `HMR` 的中枢，它接收到上一步传递给它的新模块的 `hash` 值，它通过 `JsonpMainTemplate.runtime` 向 `server` 端发送 `Ajax` 请求，服务端返回一个 `json`，该 `json` 包含了所有要更新的模块的 `hash` 值，获取到更新列表后，该模块再次通过 `jsonp` 请求，获取到最新的模块代码。

- 第六步：**`HotModulePlugin` 将会对新旧模块进行对比（10）**

`HotModulePlugin` 将会对新旧模块进行对比，决定是否更新模块，在决定更新模块后，检查模块之间的依赖关系，更新模块的同时更新模块见的依赖引用，第一个阶段是找出 `outdatedModules` 和 `outdatedDependencies`。第二个阶段从缓存中删除过期的模块和依赖。第三个阶段是将新的模块添加到 `modules` 中，当下次调用 `__webpack_require__`（`webpack` 重写的 `require` 方法）方法的时候，就是获取到了新的模块代码了。



## `webpack-dev-server` 是如何实现从内存中加载打包好的文件的？

关键就在于 `webpack-dev-middleware`，它的作用是生成一个与 `webpack` 的 `compiler` 绑定的中间件，然后在 `express` 启动的服务 `app` 中调用这个中间件。

这个中间件的主要作用有3个：

1. 通过 `watch mode`，监听资源的变更，然后自动打包。
2. 使用内存文件系统，快速编译。
3. 返回中间件，支持 `express` 的 `use` 格式

对于 `webpack-dev-middleware`，最直观简单的理解就是一个**运行于内存中的文件系统**。你定义了 `webpack.config`，`webpack` 就能据此梳理出所有模块的关系脉络，而 `webpack-dev-middleware` 就在此基础上形成一个微型的文件映射系统，每当应用程序请求一个文件---比如说你定义的某个 `entry`，它匹配到了就把内存中缓存的对应结果作为文件内容返回给你，反之则进入到下一个中间件。

源码结构如下：

![3](.\assets\3.jpg)

除了 `utils` 等工具方法文件，最主要的文件就是 `index.js` 和 `middleware.js`



### `index.js`：watch model && 输出到内存

```js
// index.js
function wdm(compiler, options = {}) {
  // ...
  // 绑定钩子函数
  setupHooks(context);
  // ...
  // 输出到内存
  setupOutputFileSystem(context);
  // ...
  // 启动监听
  context.watching = context.compiler.watch(watchOptions, error => {
    if(error) {
      context.logger.error(error);
    }
  })
}
module.exports = wdm;
```

`index.js` 是一个中间件的容器包装函数，接受两个参数：一个是 `webpack` 的 `compiler` ，另一个是配置对象，经过一系列处理后返回一个中间件函数。

主要完成得事情是上面三个：

- `setupHooks()`
- `setupOutputFileSystem()`
- `context.compiler.watch()`



### setupHooks

此函数的作用是在 `compiler` 的 `invalid、run、done、watchRun` 这 4 个编译生命周期上，注册对应的处理方法

```js
// utils/setupHooks.js
function serupHooks(context) {
  // ...
  context.compiler.hooks.watchRun.tap("wabpack-dev-middleware", invalid);
  context.compiler.hooks.invalid.tap("webpack-dev-middleware", invalid);
  context.compiler.hooks.done.tap("webpack-dev-middleware", done);
}
module.exports = setupHooks;
```

- 在 `done` 生命周期上注册 `done` 方法，该方法主要是 `report` 编译的信息以及执行 `context.callbacks` 回调函数
- 在 `invalid、run、watchRun` 等生命周期上注册 `invalid` 方法，该方法主要是 `report` 编译的状态信息 



### setupOutputFileSystem

其作用是使用 `memory-fs` 对象替换掉 `compiler` 的文件系统对象，让 `webpack` 编译后的文件输出到内存中

```js
const memfs = require("memfs");
outputFileSystem = memfs.createFsFromVolume(new memfs.Volume());
```



### context.compiler.watch

调用的就是 `compiler` 的 `watch` 方法，一旦我们改动文件，就会重新执行编译打包。



### middleware.js：返回中间件

此文件返回的是一个 `express` 中间件函数的包装函数，其核心处理逻辑主要针对 `request` 请求，根据各种条件判断，最终返回对应的文件内容。

```js
export default function wrapper(context) {
  return function middleware(req, res, next) {
    // 1. 定义goNext方法
    function goNext() {  }
    // 2. 请求类型判断，若请求不包含于配置中（默认 GET、HEAD 请求），则直接调用 goNext() 方法处理请求
    const acceptedMethods = context.options.methods || ["GET", "HEAD"];
    if(acceptedMethods.indexOf(req.methods) === -1) {
      return goNext();
    }
    // 3. 根据请求的url地址，在内存中寻找对应文件，并构造response返回
    return new Promise((resolve) => {
      function processRequest() {
        // ...
      }
      ready(context, processRequest, req);
    })
  }
}
```



### goNext 方法

该方法判断是否是服务端渲染。如果是，则调用 `ready()` 方法（此方法即为 `ready.js` 文件，作用为根据 `context.state` 状态判断直接执行回调还是将回调存储 `callbacks` 队列中）。如果不是，则直接调用 `next()` 方法，流转至下一个 `express` 中间件

```js
function wrapper(context) {
  return async function middleware(req, res, next) {
    function goNext() {
      if(!context.options.serverSideRender) {
        return next();
      }
      return new Promise((resolve) => {
        ready(
          context,
          () => {
            res.locals.webpack = { devMiddleware: context };
            
            resolve(next())
          },
          req
        )
      })
    }
  }
}
```



### ready.js 文件

​		判断 `context.state` 的状态，将直接执行回调函数 `fn`，或在 `context.callbacks` 中添加回调函数 `fn`。这也解释了上文提到的另一个特性 “在编译期间，停止提供旧版的 `bundle` 并且将请求延迟到最新的编译结果完成之后”。若 `webpack` 还处于编译状态，`context.state` 会被设置为 `false`，所以当用户发起请求时，并不会直接返回对应的文件内容，而是会将回调函数 `processRequest` 添加至 `context.callbacks` 中，而上文中我们说到在 `compile.hooks.done` 上注册了回调函数 `done`，等编译完成之后，将会执行这个函数，并循环调用 `context.callbacks`。

```js
// utils.ready.js
if(context.state) {
  return callback(context.stats)
}

const name = (req && req.url) || callback.name;
context.logger.info(`wait until bundle finished${name ? `: ${name}` : ""}`);
context.callbacks.push(callback);
```



### processRequest 函数

在返回的中间件实例中定义了一个 `processRequest` 函数，此方法通过 `url` 查找到 `filename` 路径，如果 `filename` 不存在则直接调用 `goNext` 方法，否则的话找到对应文件构造 `response` 对象返回。在 `ready` 方法中调用 `processRequest` 函数

```js
function processRequest() {
  const filename = getFilenameFormUrl(context, req.uer);
  // 查找文件
  if(!filename) {
    return resolve(goNext())
  }
  // 构造response对象，并返回
  let content;
  try {
    content = context.outputFileSystem.readFileSync(filename);
  } catch (_ignoreError) {
    return resolve(goNext());
  }
  content = handleRangeHeaders(content, req, res);
  res.send(content);
}
```



































