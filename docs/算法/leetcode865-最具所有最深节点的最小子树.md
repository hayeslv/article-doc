# 最具所有最深节点的最小子树

[最具所有最深节点的最小子树](https://leetcode.cn/problems/smallest-subtree-with-all-the-deepest-nodes/)

给定一个根为 `root` 的二叉树，每个节点的深度是 **该节点到根的最短距离** 。

返回包含原始树中所有 **最深节点** 的 最小子树 。

如果一个节点在 **整个树** 的任意节点之间具有最大的深度，则该节点是 **最深的** 。

一个节点的 **子树** 是该节点加上它的所有后代的集合。



## 示例

- 示例1

```js
        3
   5         1
6    2     0    8
   7   4
```

输出：`[2, 7, 4]`

节点 `5、3 和 2` 包含树中最深的节点，但节点 `2` 的子树最小，因此我们返回它

- 示例2

```js
    0
1        3
  2
```

输出：`[2]`

树中最深的节点为 `2`，有效子树为节点：`2、1 和 0`的子树，但节点 `2` 的子树最小

> 通过这两个示例可以发现，示例1中，如果是 左右子节点都存在（`7、4`），则返回上级节点（`2`）
>
> 否则返回最下级节点 （示例2中的 `2`）



## 代码实现

做一次深度优先搜索，记录所有节点的深度，从而找到最深的节点。在做一次深度优先搜索，用回溯的方式找到最小子树

- 如果 `node` 没有左右子树，返回 `node`
- 如果 `node` 左右子树的后带中都有最深节点，返回 `node`
- 如果只有左子树或右子树中**有且拥有所有的最深节点**，则返回这颗子树的根节点（`node` 的左/右孩子）

```js
var subtreeWithAllDeepest = function(root) {
  let depthMap = new Map(); // 搜集所有node的深度
  depthMap.set(null, -1); // root的父节点为null，root深度设为0，则null设为-1
  let max = -1; // 最大深度从-1开始
  dfs(root, null); // 传入当前节点，已经其父节点
  // 获取最大值
  max = Math.max(...depthMap.values())
  return answer(root); // 第二次递归，返回其最深子树
  
  function dfs(node, parent) {
    if(!node) return;
    depthMap.set(node, depthMap.get(parent) + 1); // 设置当前节点的深度为：其父节点深度+1
    // 递归左右子节点
    dfs(node.left, node);
    dfs(node.right, node);
  }
  
  function answer(node) {
    // node不存在或者node的深度和最深节点一致，则直接返回node
    if(!node || depthMap.get(node) === max) return node;
    let L = answer(node.left);
    let R = answer(node.right);
    // 如果左右子节点都存在，则返回当前节点：经过answer之后，L和R不是null就是最深节点
    if(L && R) return node;
    // L和R至少有一个不存在，返回存在的那个，否则
    return L || R || null;
  }
}
```













