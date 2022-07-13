# Promise

首先，我们以常见的 `Promise` 面试题为切入点，来看看面试官们都爱考什么：

1. `Promise` 解决了什么问题？
   1. 将嵌套改为链式调用，增加了可阅读性和可维护性。
   2. `Promise` 解决的是异步编码风格的问题。
2. `Promise` 常用的 API 有哪些？
3. 能不能手写一个符合 `Promise/A+` 规范的 `Promise`？
4. `Promise` 在事件循环中的执行过程是怎样的？
5. `Promise` 有什么缺陷，可以如何解决？



## 一、Promise 出现的原因

在 `Promise` 出现以前，我们处理多个异步请求嵌套时，代码往往是这样的：

```js
let fs = require('fs')
fs.readFile('./name.txt','utf8',function(err,data){
  fs.readFile(data, 'utf8',function(err,data){
    fs.readFile(data,'utf8',function(err,data){
      console.log(data);
    })
  })
})
```

为了拿到回调的结果，我们必须一层一层的嵌套。

而且基本上我们还需要对每次请求后的结果进行一系列的处理，使得代码更加难以阅读和维护。

这就是**回调地狱**。产生**回调地狱**的原因归结起来有两点：

1. 嵌套调用：第一个函数的输出往往是第二个函数的输入
2. 并发处理多个异步请求：往往需要同步请求最终的结果

原因分析出来后，问题的解决思路就很清晰了：

1. 消灭嵌套调用：通过 `Promise` 的链式调用
2. 合并多个任务的请求结果：使用 `Promise.all` 

**将上面的示例代码改为Promise实现**

```js
let fs = require('fs')

function read(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    })
  })
}

read('./name.txt').then((data)=>{
  return read(data) 
}).then((data)=>{
  return read(data)  
}).then((data)=>{
    console.log(data);
},err=>{
    console.log(err);
})
```

这样的话，臃肿的嵌套就变得线性多了。



## 二、从零开始，手写 Promise

### Promise/A+

我们想要手写一个 Promise，就要遵循 [Promise/A+](https://promisesaplus.com/) 规范，业界所有 Promise 的类库都遵循这个规范。

其实 Promise/A+ 规范对如何实现一个符合标准的 Promise 类库已经阐述的很详细了。每一行代码在 Promise/A+ 规范中都有迹可循，所以在下面的实现的过程中，我会尽可能的将代码和 Promise/A+ 规范一一对应起来。



### 基础版Promise

先回顾一下 `Promies` 的使用方式

```js
const p1 = new Promise((resolve, reject) => {
  console.log("create a promise");
  resolve("成功了");
})

console.log("after new Promise");

const p2 = p1.then(data => {
  console.log(data);
  throw new Error("失败了");
})

const p3 = p2.then(data => {
  console.log("success", data);
}, error => {
  console.log("failed", error);
})
```

控制台输出：

```js
"create a promise"     // new Promise 会立刻执行
"after new promise"    // 按照代码顺序，打印信息
"成功了"                // p2、p3都是异步，并且p2是p1的执行；p1调用resolve会走到p2的then，打印传参（“成功了”）
"failed Error: 失败了"  // faild Error: 失败了。抛出异常，p3走 catch
```

- 首先我们在调用 `Promise` 时，会返回一个 `Promise` 对象。
- 构建 `Promise` 对象时，需要传入一个 **executor函数**：`Promise` 的主要业务流程都在 `executor` 中执行
  - 如果运行在 `executor` 中的业务执行成功了，就调用 `resolve` 函数
  - 否则（失败了）调用 `reject` 函数
- `Promise` 的状态不可逆，同时调用 `resolve` 和 `reject` 函数，默认会采取第一次调用的结果

以上简单介绍了 Promise 的一些主要的使用方法，结合 [Promise/A+](https://promisesaplus.com/) 规范，我们可以分析出 Promise 的基本特征：

1. `Promise` 有三个状态：`pending`、`fulfilled`、`rejected`
   1. 默认状态是 `pending`
   2. 状态只能从 `pending` 到 `fulfilled` 或者 从 `pending` 到 `rejected`
   3. 状态一旦确认，就不会改变
2. `new Promise` 时，需要传递一个 `executor()` 执行器，执行器立即执行
3. `executor` 接收两个参数：`resolve` 和 `reject`
4. `Promise` 有一个 `value` 保存成功状态的值；有一个 `reason` 保存失败状态的值
5. `promise` 必须有一个 `then` 方法，`then` 接收两个参数：
   1. `onFulfilled`： 成功的回调
   2. `onRejected`：失败的回调
6. 如果 `then` 中抛出了异常，那么就会把这个异常作为参数，传递给下一个 `then` 的失败回调 `onRejected`

按照上面的特征，我们试着勾勒下 Promise 的形状：

```js
// ./version1.js
// 三个状态 PENDING、FULFILLED、REJECTED
const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class Promise {
  constructor(executor) {
    // 默认状态为 PENDING
    this.status = PENDING;
    // 存放成功状态的值，默认为 undefined
    this.value = undefined;
    // 存放失败状态的值，默认为 undefined
    this.reason = undefined;

    // 调用此方法就是成功
    let resolve = (value) => {
      // 状态为 PENDING 时才可以更新状态，防止 executor 中调用了两次 resolve/reject 方法
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
      }
    };
    // 调用此方法就是失败
    let reject = (reason) => {
      // 状态为 PENDING 时才可以更新状态，防止 executor 中调用了两次 resolve/reject 方法
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
      }
    };

    try {
      // 立即执行，将 resolve 和 reject 函数传给使用者
      executor(resolve, reject);
    } catch (error) {
      // 发生异常时执行失败逻辑
      reject(error);
    }
  }
  // 包含一个 then 方法，并接收两个参数 onFulfilled，onRejected
  then(onFulfilled, onRejected) {
    if (this.status === FULFILLED) {
      onFulfilled(this.value);
    }
    if (this.status === REJECTED) {
      onRejected(this.reason);
    }
  }
}
```

写完代码我们可以测试一下：

```js
const promise = new Promise((resolve, reject) => {
  resolve('成功');
}).then(
  (data) => {
    console.log('success', data)
  },
  (err) => {
    console.log('faild', err)
  }
)
```

控制台输出：

```js
"success 成功"
```



### 异步

现在我们已经实现了一个基础版的 `Promise`，但是还不要高兴的太早，这里我们只是处理了同步操作的 `Promise`。

如果在 `executor()` 中传入一个异步操作的话呢？来尝试一下：

```js
const promise = new Promise((resolve, reject) => {
  // 传入一个异步操作
  setTimeout(() => {
    resolve('成功');
  },1000);
}).then(
  (data) => {
    console.log('success', data)
  },
  (err) => {
    console.log('faild', err)
  }
)
```

执行测试脚本后会发现，没有任何返回（打印）

这是因为 `promise` 在调用 `then` 方法时，当前的 `promise` 并没有成功，一直处于 `pending` 状态。此时根据 `then` 函数的实现，肯定不会有任何执行。

解决方法：我们在调用 `then` 方法时，如果发现当前状态是 `pending`，就将成功和失败的回调分别存放起来，在 `executor()` 的异步任务被执行时，触发 `resolve` 或 `reject`，再依次调用成功或失败的回调。（发布订阅模式）

```js
class Promise {
  constructor(executor) {
    // ...
    // 存放成功的回调
    this.onResolvedCallbacks = [];
    // 存放失败的回调
    this.onRejectedCallbacks= [];

    let resolve = (value) => {
      if(this.status ===  PENDING) {
        this.status = FULFILLED;
        this.value = value;
        // 依次将对应的函数执行
        this.onResolvedCallbacks.forEach(fn=>fn());
      }
    } 
    let reject = (reason) => {
      if(this.status ===  PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        // 依次将对应的函数执行
        this.onRejectedCallbacks.forEach(fn=>fn());
      }
    }
  }
  then(onFulfilled, onRejected) {
    if (this.status === PENDING) {
      // 如果promise的状态是 pending，需要将 onFulfilled 和 onRejected 函数存放起来，等待状态确定后，再依次将对应的函数执行
      this.onResolvedCallbacks.push(() => {
        onFulfilled(this.value)
      });

      // 如果promise的状态是 pending，需要将 onFulfilled 和 onRejected 函数存放起来，等待状态确定后，再依次将对应的函数执行
      this.onRejectedCallbacks.push(()=> {
        onRejected(this.reason);
      })
    }
  }
}
```

测试一下：

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功');
  },1000);
}).then(
  (data) => {
    console.log('success', data)
  },
  (err) => {
    console.log('faild', err)
  }
)
```

执行测试脚本，控制台等待 `1s` 后输出：

```js
"success 成功"
```

这种 `收集依赖 -> 触发通知 -> 取出依赖执行` 的方式，被广泛运用于发布订阅模式的实现。



### then的链式调用 & 值穿透特性

​		`promise` 的优势在于可以链式调用。在使用 `promise` 的时候，当 `then` 函数中 `return` 了一个值，不管是什么值，我们都可以在下一个 `then` 中获取到，这就是所谓的 **`then` 的链式调用**。

​		当我们不在 `then` 中放入参数，例如：`promise.then().then()`，那么后面的 `then` 依旧可以得到之前 `then` 返回的值，这就是所谓的**值的穿透**。

​		实现思路：如果每次调用 `then` 的时候，我们都重新创建一个 `promise` 对象，并把上一个 `then` 的返回结果传给这个新的 `promise` 的 `then` 方法，就可以一直 `then` 下去了。

有了上面的想法，我们再结合 [Promise/A+](https://promisesaplus.com/) 规范 规范梳理一下思路：

1. `then` 的参数 `onFulfilled` 和 `onRejected` 可以缺省，如果 `onFulfilled` 或者 `onRejected` 不是函数，则将其忽略，且依旧可以在下面的 `then` 中获取到之前返回的值；
2. `promise` 可以 `then` 多次，每次执行完 `promise.then` 方法后返回的都是一个**新的`promise`**；
3. 如果 `then` 的返回值 `x` 是一个普通值，那么就会把这个结果作为参数，传递给下一个 `then` 的成功回调中；
4. 如果 `then` 中抛出了异常，那么就会把这个异常作为参数，传递给下一个 `then` 的失败回调中；
5. 如果 `then` 的返回值 `x` 是一个 `promise`，那么会等这个 `promise` 执行完
   1. `promise` 如果成功，就走下一个 `then` 的成功
   2. `promise` 如果失败，就走下一个 `then` 的失败
   3. `promise` 如果抛出了异常，就走下一个 `then` 的失败
6. 如果 `then` 的返回值 `x` 和 `promise` 是同一个引用对象，造成循环引用，则抛出异常，把异常传递给下一个 `then` 的失败回调中；
7. 如果 `then` 的返回值 `x` 是一个 `promise`，且 `x` 同时调用 `resolve` 和 `reject` 函数，则第一次调用优先，其他所有调用被忽略。

**我们将代码补充完整：**

```js
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

const resolvePromise = (promise2, x, resolve, reject) => {
  // 自己等待自己完成是错误的实现(循环引用)，用一个类型错误结束掉 promise 
  if (promise2 === x) { 
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  // 只能调用一次
  let called;
  // 后续的条件要严格判断 保证代码能和别的库一起使用
  if ((typeof x === 'object' && x != null) || typeof x === 'function') { 
    try {
      // 为了判断 resolve 过的就不用再 reject 了（比如 reject 和 resolve 同时调用的时候）
      let then = x.then;
      if (typeof then === 'function') { 
        // 不要写成 x.then，直接 then.call 就可以了 因为 x.then 会再次取值，比如：Object.defineProperty
        then.call(x, y => { // 根据 promise 的状态决定是成功还是失败
          if (called) return;
          called = true;
          // 递归解析的过程（因为可能 promise 中还有 promise）
          resolvePromise(promise2, y, resolve, reject); 
        }, r => {
          // 只要失败就走reject
          if (called) return;
          called = true;
          reject(r);
        });
      } else {
        // 如果 x.then 是个普通值就直接返回 resolve 作为结果
        resolve(x);
      }
    } catch (e) {
      // Promise/A+ 2.3.3.2
      if (called) return;
      called = true;
      reject(e)
    }
  } else {
    // 如果 x 是个普通值就直接返回 resolve 作为结果
    resolve(x)
  }
}

class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks= [];

    let resolve = (value) => {
      if(this.status ===  PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolvedCallbacks.forEach(fn=>fn());
      }
    } 

    let reject = (reason) => {
      if(this.status ===  PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn=>fn());
      }
    }

    try {
      executor(resolve,reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFulfilled, onRejected) {
    //解决 onFufilled，onRejected 没有传值的问题
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    //因为错误的值要让后面访问到，所以这里也要抛出个错误，不然会在之后 then 的 resolve 中捕获
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
    // 每次调用 then 都返回一个新的 promise
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 使用 setTimeout 来模拟异步
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            // x可能是一个proimise
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e)
          }
        }, 0);
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e)
          }
        }, 0);
      }

      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e)
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(()=> {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0);
        });
      }
    });

    return promise2;
  }
}
```

测试一下：

```js
const promise = new Promise((resolve, reject) => {
  reject('失败');
}).then().then().then(data=>{
  console.log(data);
},err=>{
  console.log('err',err);
})
```

控制台输出：

```js
"失败 err"
```

至此，我们已经完成了 `promise` 最关键的部分：`then` 的链式调用和值的穿透。搞清楚了 `then` 的链式调用和值的穿透，你也就搞清楚了 `Promise`



### 测试 `Promise` 是否符合规范

Promise/A+规范提供了一个专门的测试脚本，可以测试所编写的代码是否符合Promise/A+的规范。

首先，在 promise 实现的代码中，增加以下代码：

```js
MyPromise.defer = MyPromise.deferred = function () {
  let dfd = {};
  dfd.promise = new MyPromise((resolve,reject)=>{
    dfd.resolve = resolve;
    dfd.reject = reject;
  })
  return dfd;
}

module.exports = MyPromise
```

按照测试脚本：

```bash
npm i -D promises-aplus-tests
```

如果当前的 promise 源码的文件名为 promise.js

那么在对应的目录执行以下命令：

```bash
promises-aplus-tests promise.js
```

promises-aplus-tests 中共有 872 条测试用例。以上代码，可以完美通过所有用例。



## 三、Promise 的 API

虽然上述的 `promise` 源码已经符合 Promise/A+ 的规范，但是原生的 `Promise` 还提供了一些其他方法，如：

- Promise.resolve()
- Promise.reject()
- Promise.prototype.catch()
- Promise.prototype.finally()
- Promise.all()
- Promise.race()

下面具体说一下每个方法的实现：

### 1、Promise.resolve

默认产生一个成功的 `promise`

```js
class MyPromise {
  static resolve(data) {
    if(data instanceof MyPromise) {
      return data
    } else {
      return new MyPromise((resolve, reject) => {
        resolve(data)
      })
    }
  }
}
```

这里需要注意的是，`Promise.resolve` 是具备**等待功能**的。如果参数是 `promise` 则会等这个 `promise` 解析完毕，再向下执行

测试一下：

```js
MyPromise.resolve(new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("ok")
  }, 3000);
})).then(
  data => {
    console.log(data, "success");
  },
  err => {
    console.log(err, "error");
  }
)
```

执行测试，控制台等待 `3s` 后输出：

```js
"ok success"
```



### 2、Promise.reject

默认产生一个失败的 `promise`，`Promise.reject` 会直接将值编程错误结果

```js
static reject(reason) {
  if(reason instanceof MyPromise) {
    return reason
  } else {
    return new MyPromise((resolve, reject) => {
      reject(reason)
    })
  }
}
```

同理，`promise.reject` 也是具备等待功能的

测试：

```js
MyPromise.reject("失败").then(
  data => {
    console.log(data, "success");
  },
  err => {
    console.log(err, "error");
  }
)
```

控制台打印：

```js
"失败 error"
```



### 3、Promise.prototype.catch

用来捕获 `promise` 的异常

```js
Promise.prototype.catch = function(errCallback) {
  return this.then(null,errCallback)
}
```

测试：

```js
MyPromise.reject("失败")
  .then(data => console.log(data, "success"))
  .catch(err => console.log(err, "error"))
```

控制台打印：

```js
"失败 error"
```



### 4、Promise.prototype.finally

`finally` 不是表示最终的意思，而是无论如何都会执行的意思。如果返回一个 `promise` 会等待这个 `promise` 执行完毕。

如果返回的是成功的 `promise`，会采用上一次的结果；

如果返回的是失败的 `promise`，会采用失败的结果，传到 `catch` 中。

```js
MyPromise.prototype.finally = function(callback) {
  return this.then(
    value => {
      return MyPromise.resolve(callback()).then(() => value)
    },
    reason => {
      return MyPromise.resolve(callback()).then(() => { throw reason })
    }
  )
}
```

测试

```js
MyPromise.resolve("成功")
  .then(data => console.log(data, "success"))
  .catch(err => console.log(err, "error"))
  .finally(() => console.log("最后打印"))
```

控制台打印

```js
"成功 success"
"最后打印"
```









































































