# 出现次数最多的子树元素和

[出现次数最多的子树元素和](https://leetcode.cn/problems/most-frequent-subtree-sum/)

给你一个二叉树的根结点 `root` ，请返回出现次数最多的子树元素和。如果有多个元素出现的次数相同，返回所有出现次数最多的子树元素和（不限顺序）。

一个结点的 `「子树元素和」` 定义为以**该结点为根的二叉树上所有结点的元素之和（包括结点本身）**。



## 示例

- 示例1

```js
输入：
   5
2    -3
输出：[2, -3, 4]
```

`2` 和 `-3` 两个节点没有子节点，所以**子树元素和**就是他们本身的值，根节点 `5` 的**子树元素和**为 `5 + 2 - 3 = 4`

- 示例2

```js
输入：
   5
2    -5
输出：[2]
```

根节点的**子树元素和**为 `2`；左叶子为 `2`；右叶子为 `-5`。`2` 出现的次数最多，所以只返回 `2`



## 代码实现

- 先实现一个递归函数，用于计算**每个节点的子元素和**；过程中将其出现的次数记录进一个 `map` 中
- 对 `map` 结构后进行排序（根据出现次数排序），拿出最大值后（首位的次数），再次对数组进行过滤（与最大值相同的元素）

```js
var findFrequentTreeSum = function(root) {
  let map = new Map();
  getSumValue(root, map); // 经过调用后，全部的结果都在map中了
  // 排序：以示例1为例，map解构后的数据为 `[[2, 1], [-3, 1], [4, 1]]`，每个元素（[2,1]）的第二项为出现次数
  const sortArr = [...map].sort((a, b) => b[1] - a[1]);
  // 二维数组的第一个元素的出现次数为“最大出现次数”
  let max = sortArr[0][1]
  return sortArr.filter(v => v[1] === max).map(v => v[0]);
}
// 计算node的子元素和，map用于该值的记录出现次数
function getSumValue(node, map) {
  if(!node) return 0;
  // 当前node的子元素和 = 左叶子的子元素和 + 右叶子的子元素和 + 自身的value值
  const result = getSumValue(node.left, map) + getSumValue(node.right, map) + node.val;
  // 判断map中是否记录过当前值
  if(map.has(result)) {
    // 出现过的话，则拿出上一次的值，对其进行+1
    map.set(result, map.get(result) + 1);
  } else {
    // 没出现过，则将其次数置为1
    map.set(result, 1);
  }
  return result;
}
```













