# hash和history



## hash和history的区别

- `hash` 在路由地址栏 `URL` 上有 `#`，用 `window.location.hash` 读取。而 `history` 路由没有 `#`。
- `f5` 刷新页面后，`hash` 路由会加载到地址栏对应的页面，而 `history` 路由一般就 404 报错了（刷新是网络请求，后端没有准备时就会报错）。
- `hash` 路由支持低版本的浏览器，而 `history` 路由是 `HTML5` 新增的 `API`。
- `hash` 的特点在于它虽然出现在了 `URL` 中，但是不包括在 `http` 请求中，对于后端是没有一点影响的，所以改变 `hash` 不会重新加载页面，这也是单页应用的必备。
- `history` 使用了浏览器的历史记录栈，之前有 `back、forward、go` 方法，之后在 `HTML5` 中新增了 `pushState() 和 replaceState()` 方法，它们提供了对历史记录进行修改的功能，不过在进行修改时，虽然改变了当前的 `URL`，但是浏览器不会马上向后端发送请求。
- `history` 这种路由模式需要后端配置支持。比如：当我们进入项目主页的时候，一切正常，可以访问，但是当我们刷新页面或者直接访问路径的时候就会返回 404，这是因为在 `history` 模式下，只是动态的通过 `js` 操作 `window.history` 来改变浏览器地址栏里的路径，并没有发起 `http` 请求，但是当我们之间输入这个地址的时候，就一定要对服务器发起 `http` 请求，但是这个目标在服务器上又不存在，所以会返回 404。



## hash模式

`hash` 值变化后，浏览器不会重新发起请求，但是会触发 `window.hashChange` 事件。假如我们在 `hashChange` 事件中获取当前的 `hash` 值，并根据 `hash` 值来修改页面内容，就能达到前端路由的目的了。

`html`：菜单中 `href` 设置为 `hash` 形式，`id` 为 `app` 中放置页面内容

```html
<ul>
  <li>
  	<a href="#index">首页</a>
  </li>
  <li>
  	<a href="#news">资讯</a>
  </li>
  <li>
  	<a href="#user">个人中心</a>
  </li>
</ul>
<div id="app"></div>
```

`js`：在 `window.onhashchange` 中获取 `hash` 值，根据不同的值，修改 `app` 中不同的内容，起到了路由的效果

```js
// 我们从 #a 跳转到 #b
function hashChange(e) {
  console.log(location.hash) // #b
  console.log(location.href) // http://****#b
  console.log(e.newURL) // http://****#b
  console.log(e.odlURL) // http://****#a
  
  let app = document.getElementBuId("app")
  switch(location.hash) {
    case "#index":
      app.innerHTML = "<h1>这是首页内容</h1>"
      break
    case "#news":
      app.innerHTML = "<h1>这是新闻内容</h1>"
      break
    case "#user":
      app.innerHTML = "<h1>这是个人中心</h1>"
      break
    default:
      app.innerHTML = "<h1>404</h1>"
  }
}
window.onhashchange = hashChange
```

封装：

```js
class Router {
  constructor() {
    this.routers = [] // 存放我们的路由配置
  }
  add(route, callback) {
    this.routers.push({
      path: route,
      render: callback
    })
  }
  listen(callback) {
    let self = this
    return function() {
      let hash = location.hash
      for(let i=0; i<self.routers.length; i++) {
        let route = self.routers[i]
        if(hash === route.path) {
          callback(route.render())
          return
        }
      }
    }
  }
}

let router = new Router()
router.add("#index", () => {
  return "<h1>首页</h1>"
})
router.add("#news", () => {
  return "<h1>新闻</h1>"
})
router.add("#user", () => {
  return "<h1>个人中心</h1>"
})
router.listen(renderHtml => {
  let app = document.getElementBuId("app")
  app.innerHTML = renderHtml
})
```

实现一个 `Router` 类，通过 `add` 方法添加路由配置，第一个参数为路由路径，第二个参数为 `render` 函数，返回要插入页面的 `html`；通过 `listen` 方法，监听 `hash` 变化，并将每个路由返回的 `html`，插入到 `app` 中。

这样就实现了一个简单的 `hash` 路由。





## history模式

`hash` 模式看起来是比较丑的，都带个 `#` 号，我们也可以采取 `history` 模式。`history` 就是我们平时看到的正常链接形式。

```js
"https://www.xxx.com#index" // hash模式路由
"https://www.xxx.com/index" // history模式路由
```

`history` 模式基于 `window.history` 对象的方法

**原理**

​		首先我们要改造我们的超链接，给每个超链接增加 `onclick` 方法，阻止默认的超链接跳转，改用 `history.pushState` 或 `history.replaceState` 来更改浏览器中的 `url`，并修改页面内容。由于通过 `history` 的 `api` 调整，并不会向后端发起请求，所以也就达到了前端路由的目的。

​		如果用户使用浏览器的前进后退按钮，则会触发 `window.onpopstate` 事件，监听页面根据路由地址修改页面内容。

​		也不一定非要使用超链接，任意元素作为菜单都行，只要在点击事件中通过 `history` 进行调整即可。

html：

```html
<ul>
  <li>
  	<a href="/index">首页</a>
  </li>
  <li>
  	<a href="/news">资讯</a>
  </li>
  <li>
  	<a href="/user">个人中心</a>
  </li>
</ul>
<div id="app"></div>
```

js：

```js
// 改造超链接，阻止默认跳转（默认的跳转是会刷新页面的）
document.querySelector("#menu").addEventListener("click", function(e) {
  if(e.target.nodeName === "A") { // a标签
    e.preventDefault()
		let path = e.target.getAttribute("href") // 获取超链接的 href，改为pushState调整，不刷新页面
    window.history.pushState({}, "", path) // 修改浏览器中显示的url地址
    render(path) // 根据path，更改页面内容
  }
})
function render(path) {
  let app = document.getElementById("app")
  switch(path) {
    case "/index":
      app.innerHTML = "<h1>首页</h1>"
      break
    case "/news":
      app.innerHTML = "<h1>新闻</h1>"
      break
    case "/user":
      app.innerHTML = "<h1>个人中心</h1>"
      break
    default:
      app.innerHTML = "<h1>404</h1>"
  }
}
// 监听浏览器的前进后退事件，并根据当前路径渲染页面
window.onpopstate = function(e) {
  render(location.pathname)
}
// 第一次进入页面显示首页
render("/index")
```

同 `hash` 模式一样，我们也可以用类封装一下，通过 `add` 方法添加路由，通过 `pushState` 进行调整，初始化时更改所有超链接的跳转方式

```js
class Router {
  constructor() {
    this.routers = []
    this.renderCallback = null
  }
  add(route, callback) {
    this.routers.push({
      path: route,
      render: callback
    })
  }
  pushState(path, data = {}) {
    window.history.pushState(data, "", path)
    this.renderHtml(path)
  }
  listen(callback) {
    this.renderCallback = callback
    this.changeA()
    window.onpopstate = () => this.renderHtml(this.getCurrentPath())
    this.renderHtml(this.getCurrentPath())
  }
  changeA() {
    document.addEventListener("click", (e) => {
      if(e.target.nodeName === "A") {
        e.preventDefault()
        let path = e.target.getAttribute("href")
        this.pushState(path)
      }
    })
  }
  getCurrentPath() {
    return location.pathname
  }
  renderHtml(path) {
    for(let i=0; i<this.routers.length; i++) {
      let route = this.routers[i]
      if(path === route.path) {
        this.renderCallback(route.render())
        return
      }
    }
  }
}
let router = new Router()
router.add("/index", () => {
  return "<h1>首页</h1>"
})
router.add("/news", () => {
  return "<h1>新闻</h1>"
})
router.add("/user", () => {
  return "<h1>个人中心</h1>"
})
router.listen((renderHtml) => {
  let app = document.getElementById("app")
  app.innerHTML = renderHtml
})
```









