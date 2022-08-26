# 删除给定值的叶子节点

[删除给定值的叶子节点](https://leetcode.cn/problems/delete-leaves-with-a-given-value/)

给你一棵以 `root` 为根的二叉树和一个整数 `target`，请你删除所有值为 `target` 的**叶子节点**。

注意，一旦删除值为 `target` 的叶子节点，它的父节点就可能变成叶子节点；如果新叶子节点的值也恰好是 `target`，那么这个节点也应该被删除。

也就是说，你需要重复此过程直到不能继续删除。



## 示例

`target` 为 `2`

```js
     1                 1               1
  2     3      =>    2   3      =>        3
2     2   4                4                4
```

解释：

- 一开始树的叶子节点有 `3` 个，分别是 `2、2、4`
- 第一次删除后：原先的 `3` 个叶子节点只剩下一个 `4` 了，但是第二层又多了一个叶子节点 `2`
- 第二次删除后：将第二层的叶子节点 `2` 也删掉，就是最后的结果了。



## 代码实现

由题意可知，我们需要删除的是从**叶子节点开始**的所有**值为 `target` 的节点**，我们的操作顺序应该从叶子节点开始，逐步向上直到二叉树的根节点为止。

因此我们可以使用递归的方法遍历整棵二叉树，并在回溯时进行删除操作：例如原本 `root.left` 为 `2`，但是 `removeLeafNodes(root.left, target)` 的结果是 null（被删除了），则直接赋值即可（就完成回溯删除了），既：`root.left = removeLeafNodes(root.left, target)`

在递归的过程中，对于二叉树的每个节点，它的子节点一定先于它被操作。

对于当前被操作的某个节点，它有以下几种情况：

- `node` 的左右孩子均不存在
  - 判断值是否为 `target`，如果是则删除，递归函数返回 `null`
  - 否则返回 `node`
- `node` 有孩子存在：返回 `node`

```js
var removeLeafNodes = function(root, target) {
  if(!root) return root;
  root.left = removeLeafNodes(root.left, target);
  root.right = removeLeafNodes(root.right, target);
  
  if(!root.left && !root.right && root.val === target) return null
  
  return root;
}
```







