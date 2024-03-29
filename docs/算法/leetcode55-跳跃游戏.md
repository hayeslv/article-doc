# 跳跃游戏

[跳跃游戏](https://leetcode.cn/problems/jump-game/)

给定一个非负整数数组 `nums` ，你最初位于数组的 **第一个下标** 。

数组中的每个元素代表你在该位置可以跳跃的最大长度。

判断你是否能够到达最后一个下标。



## 示例

```js
输入：nums = [2,3,1,1,4]
输出：true
解释：可以先跳 1 步，从下标 0 到达下标 1, 然后再从下标 1 跳 3 步到达最后一个下标。
```



## 思路

注意：本题需要注意的是“每个元素代表的是在该位置可以跳跃的**最大长度**”。也就是说，如果数组总长度为5，并且第一个位置的数为 10，就可以直接返回 `true` 了。并不是只能跳距离 `10`（直接跳出数组）。

我们可以通过遍历数组来依次保存当前可以到达的最远位置。

以示例中的数组为例：`[2, 3, 1, 1, 4]`：

- 第一个位置 `0`，最大跳跃长度为 `2`，也就是说可以跳一步或两步
  - 跳一步，到位置 `1`，值为 `3`
    - 此时最大跳跃距离 + 当前位置 = 4，等同于我们数组下标的最后一位了，所以可以直接返回 `true`
  - 跳两步，到位置 `2`，值为 `1`



## 代码实现

```js
var canJump = function(nums) {
  let maxPos = 0; // 记录当前最远能到达的位置
  let n = nums.length;
  for(let i=0; i<n; i++) {
    // 如果当前遍历的数组下标已经大于最远能达到的位置了，则说明不能到达最后一个下标了，返回false
    if(i > maxPos) return false;
    // 更新最远能到达的为止
    maxPos = Math.max(maxPos, (i + nums[i]));
  }
  return true
};
```

在上述写法的条件下，我们还可以做一点小小的优化：在某些情况下，我们已经达到了一个很远的值，这个时候可以提前返回结果

```js
var canJump = function(nums) {
  let maxPos = 0, n = nums.length;
  // 遍历条件中，maxPos如果大于等于 n-1 了（能到达最后一个位置），或者 i比maxPos大了（无法前进了）。都会直接跳出循环
  for(let i=0; i<=maxPos && maxPos<n-1; i++) {
    maxPos = Math.max(maxPos, (i + nums[i])); // 更新maxPos
  }
  return maxPos >= n - 1;
};
```



















