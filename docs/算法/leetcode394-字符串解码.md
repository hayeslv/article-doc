# 字符串解码

[字符串解码](https://leetcode.cn/problems/decode-string/)

给定一个经过编码的字符串，返回它解码后的字符串。

编码规则为: `k[encoded_string]`，表示其中方括号内部的 `encoded_string` 正好重复 `k` 次。注意 `k` 保证为正整数。

你可以认为输入字符串总是有效的；输入字符串中没有额外的空格，且输入的方括号总是符合格式要求的。

此外，你可以认为原始数据不包含数字，所有的数字只表示重复的次数 `k` ，例如不会出现像 `3a` 或 `2[4]` 的输入。



## 示例

- 示例1

```js
输入：s = "3[a]2[bc]"
输出："aaabcbc"
```

- 示例2

```js
输入：s = "3[a2[c]]"
输出："accaccacc"
```



## 思路

观察**示例2**，可以看到存在嵌套的现象，这说明我们需要存储计算前的内容，例如 `3[a2[c]]`：

- 存储状态
  - 使用 `repetStack` 作为重复次数的状态栈，`resStack` 作为积累的字符串栈
  - `resStr` 作为临时的拼接字符串，`repeat` 表示临时重复次数
- 遍历字符串
  - 首先遇到数字 `3`：将 `3` 存入 `repeat`
  - 然后遇到左括号：将 `resStr` 压入栈 `resStack`；将 `repeat` 压入栈 `repetStack`。然后将 `resStr` 和 `repeat` 重置为初始状态
  - 遇到字符 `a`：积累字符串 `resStr = resStr + "a"`
  - 遇到数字 `2`：积累重复次数 `repeat = reapeat * 10 + 2`
    - 此时：`repetStack = [3]; resStack = [""]; repeat = 2; resStr = "a"; `
  - 又遇到左括号：压入 `resStr` 和 `repeat`，然后将其重置
    - 此时：`repetStack = [3, 2]; resStack = ["", "a"]; repeat = 0; resStr = ""; `
  - 遇到字符 `c`：`resStr = "c"`
  - 遇到右括号：
    - 弹出重复次数：`let count = repetStack.pop()`
    - 计算重复次数的字符串：`let temp = ""`、`while(count--) temp += resStr`
    - 此时 `temp = "cc"`
    - 然后和前面已经求得的字符串进行拼接：`resStr = resStack.pop() + temp` => `resStr = "acc"`
  - 再遇到右括号：
    - 弹出重复次数：`3`
    - 临时字符串（重复字符串）：`"accaccacc"`
    - 此时 `temp = "accaccacc"; resStack = [""]`
    - `resStr = resStack.pop() + temp` => `"accaccacc"`
  - 得到最终结果



## 代码实现

```js
var decodeString = function(s) {
  // 用两个栈来存放当前状态，前者是重复次数，后者是累积字符串
  let repeatStack=[], resStack=[];
  // 拼接字符串
  let resStr = "";
  // 临时重复次数
  let repeat = 0;
  // 遍历
  for(let i=0; i<s.length; i++) {
    let cur = s[i];
    if(cur === "[") {
      // 临时字符串和临时重复次数都入栈
      repeatStack.push(repeat);
      resStack.push(resStr);
      // 重置，准备下一次积累
      repeat = 0;
      resStr = "";
    } else if(cur === "]") {
      // 取出需要重复的次数
      let count = repeatStack.pop();
      // 生成重复字符串
      let temp = ""
      while(count--) temp += resStr;
      // 和之前的进行拼接
      resStr = resStack.pop() + temp;
    } else if(cur >= "0" && cur <= "9") {
      repeat = repeat * 10 + (cur - "0")
    } else {
      // 字符积累
      resStr += cur;
    }
  }
  return resStr;
}
```



























