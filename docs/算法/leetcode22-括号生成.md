# 括号生成

[括号生成](https://leetcode.cn/problems/generate-parentheses/)

数字 `n` 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 **有效的** 括号组合。



## 示例

- 示例1

```js
输入：n = 1
输出：["()"]
```

- 示例2

```js
输入：n = 3
输出：["((()))","(()())","(())()","()(())","()()()"]
```



## 代码实现

**方式一：暴力法**

- 生成一个 `2n` 大小的数组（左右括号）
- 生成所有可能性的字符串
  - 当生成无效字符串时直接终止当前递归（左括号大于右括号时）
  - 当前生成的字符串长度等于 `2n` 时（生成完毕），将该字符串放入结果数组 `result` 中

```js
var generateParenthesis = function(n) {
  const result = []
  generate(new Array(2*n), 0, result);
  return result;
}
function generate(current, pos, result) {
  if(pos === current.length) { // 当前数组已经生成完毕（被放满了）
    if(isValid(current)) { // 看看是否有效
      result.push(current);
    }
  } else {
    // 当前数据current还没放满
    current[pos] = "("
    generate(current, pos+1, result)
    current[pos] = ")"
    generate(current, pos+1, result)
  }
}
function isValid(current) {
  let blance = 0
  for(let c of current) {
    if(c === "(") {
      blance++
    } else {
      blance--
    }
    if(blance < 0) { // 左括号比右括号多了
      return false
    }
  }
  // 最后是左括号等于右括号才是平衡的
  return blance === 0
}
```



**方法二：回溯法**

在暴力解法中，我们知道序列完全生成完，才判断是否有效，所以过程中生成了许多无效的序列。

我们可以进行**模式识别**，在每一步都能产生有效序列，这样可以尽早实现剪枝。对于递归中的每一步，我们通过回溯的方法来寻找其他可能的解。

```js
var generateParenthesis = function(n) {
  const result = []
  // 参数1：结果数组
  // 参数2：保存中间字符串的数组
  // 参数3：左括号的数量
  // 参数4：右括号的数量
  backtrack(result, [], 0, 0, n)
  return result
}
function backtrack(result, cur, open, close, max) {
  if(cur.length === 2*max) {
    // 当前中间数组长度等于2n了，说明已经满了
    result.push(cur.join(""))
    return
  }
  if(open < max) { // 左括号还能放
    cur.push("(") // 加一个左括号
    backtrack(result, cur, open+1, close, max) // 左括号数量加一，继续递归
    // 递归结束后，回溯到之前的状态
    cur.pop()
  }
  if(close < open) { // 右括号还能放
    cur.push(")")
    backtrack(result, cur, open, close+1, max) // 右括号数量加一，继续递归
    // 回溯
    
  }
}
```



























