# 在二叉树中添加一行

[在二叉树中添加一行](https://leetcode.cn/problems/add-one-row-to-tree/

给定一个二叉树的根 `root` 和两个整数 `val` 和 `depth` ，在给定的深度 `depth` 处添加一个值为 `val` 的节点行。

注意，根节点 `root` 位于深度 `1` 。

加法规则如下:

- 给定整数 `depth`，对于深度为 `depth - 1` 的每个非空树节点 `cur` ，创建两个值为 `val` 的树节点作为 `cur` 的左子树根和右子树根。

- `cur` 原来的左子树应该是新的左子树根的左子树。
- `cur` 原来的右子树应该是新的右子树根的右子树。
- 如果 `depth == 1` 意味着 `depth - 1` 根本没有深度，那么创建一个树节点，值 `val` 作为整个原始树的新根，而原始树就是新根的左子树。



## 示例

输入：`val = 1; depth = 2`

```js
      4                 4
  2       6   =>      1   1
3   1   5           2       6
                  3   1   5
```



## 代码实现

- 对二叉树进行递归
  - 参数1：当前节点
  - 参数2：当前节点的深度
  - 参数3：目标深度
  - 参数4：插入节点的值
- 边界条件：如果目标深度等于1的情况
  - 让新节点的 `left` 指针指向 `root`
- 递归找到 `depth` 的上一个节点 `node`，让该节点则左右指针分别指向两个新的节点；左边新节点的左指针指向 `node` 的左子节点，右边新节点的右指针指向 `node` 的右子节点 

```js
var addOneRow = function(root, val, depth) {
  if(depth === 1) { // depth如果为1，则新节点就变为根节点
    let L = new TreeNode(val, root, null);
    return L;
  }
  dfs(root, 1, depth, val);
  return root;
}
function dfs(node, depth, targetDepth, value) {
  if(!node) return;
  if(depth + 1 === targetDepth) { // 找到了目标深度的父节点
    // 构建两个新的左右子节点
    let L = new TreeNode(value, node.left, null); // 左侧新节点的左子节点指向 node.left
    let R = new TreeNode(value, null, node.right); // 右侧新节点的右子节点指向 node.right
    // 更新node的左右节点
    node.left = L;
    node.right = R;
    return;
  }
  // 递归左右子节点
  dfs(node.left, depth + 1, targetDepth, value);
  dfs(node.right, depth + 1, targetDepth, value);
}
```























