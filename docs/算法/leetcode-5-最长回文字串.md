# 最长回文字串

[最长回文字串](https://leetcode.cn/problems/longest-palindromic-substring/)

给你一个字符串 `s`，找到 `s` 中最长的回文字串。



## 示例

- 示例1

```js
输入：s = "babad"
输出："bab"
解释："aba" 同样是符合题意的答案
```

- 示例2

```js
输入：s = "cbbd"
输出："bb"
```



## 代码实现

### 方法一：暴力法

实现一个函数，判断是否是回文

```js
function isHuiwen(str) {
  let i=0, j=str.length-1;
  while(i < j) {
    if(str[i] !== str[j]) return false;
    i++;
    j--;
  }
  return true;
}
```

双重循环，遍历全部字符串

```js
var longestPalindrome = function(s) {
  if(isHuiwen(s)) return s;
  let maxLength=0, maxStr="";
  for(let i=0; i<s.length; i++) {
    for(let j=i; j<s.length; j++) { // 从i开始向后遍历
      // 拿出当前的字符串
      let str = s.slice(i, j+1);
      // 如果是回文，并且长度比maxLength大，则进行更新
      if(isHuiwen(str) && str.length > maxLength) {
        maxLength = str.length;
        maxStr = str;
      }
    }
  }
  return maxStr;
}
```



### 方法二：动态规划

定义二维数组 `dp`， `dp[i][j]` 表示子串 `i~j`是否为回文字串

- 循环 `s` 的子串，看是否满足 `s[i]、s[j]` 相等
  - 如果相等，则 `dp[i][j]` 是否为回文串取决于 `dp[i+1][j-1]`是否是回文（子串的长度为0或1也算做回文字串）
    - 如果当前回文字串的长度比 `res` 更长，则更新 `res`
  - 否则继续循环

```js
var longestPalindrome = function(s) {
  let n = s.length;
  let res = "";
  // dp[i][j] 标识 s[i] --- s[j] 是否是回文串
  // 初始化dp（二维数组）
  let dp = Array.from(new Array(n), () => new Array(n).fill(false));
  // 循环字符串：需要从尾部开始循环，因为在判断子串的时候，i需要+1，j需要-1
  for(let i=n-1; i>=0; i--) {
    for(let j=i; j<n; j++) {
      // 判断dp[i][j]是否是回文
      // 条件1：s[i] === s[j]
      // 条件2：子串是回文
      //       (1) 子串长度小于2
      //       (2) dp[i+1][j-1] 是回文
      dp[i][j] = (s[i] === s[j]) && (j-i<2 || dp[i+1][j-1]);
      // 如果dp[i][j]是回文，并且长度比res更长，则更新res
      if(dp[i][j] && j-i+1 > res.length) {
        res = s.slice(i, j+1);
      }
    }
  }
  return res;
}
```





















