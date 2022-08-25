# 二叉树着色游戏

[二叉树着色游戏](https://leetcode.cn/problems/binary-tree-coloring-game/)

有两位极客玩家参与了一场「二叉树着色」的游戏。游戏中，给出二叉树的根节点 root，树上总共有 n 个节点，且 n 为奇数，其中每个节点上的值从 1 到 n 各不相同。

游戏从「一号」玩家开始（「一号」玩家为红色，「二号」玩家为蓝色），最开始时，

- 「一号」玩家从 [1, n] 中取一个值 x（1 <= x <= n）；


- 「二号」玩家也从 [1, n] 中取一个值 y（1 <= y <= n）且 y != x。


- 「一号」玩家给值为 x 的节点染上红色，而「二号」玩家给值为 y 的节点染上蓝色。


 

之后两位玩家轮流进行操作，每一回合，玩家选择一个他之前涂好颜色的节点，将所选节点一个 未着色 的邻节点（即左右子节点、或父节点）进行染色。

如果当前玩家无法找到这样的节点来染色时，他的回合就会被跳过。

若两个玩家都没有可以染色的节点时，游戏结束。着色节点最多的那位玩家获得胜利 ✌️。

 

现在，假设你是「二号」玩家，根据所给出的输入，假如存在一个 y 值可以确保你赢得这场游戏，则返回 true；若无法获胜，就请返回 false。



## 示例

```js
             1
     '2'            "3"
  4       5      6      7
8   9  10   11
```

输入：`root = [1,2,3,4,5,6,7,8,9,10,11], n=11, x=3`

输出：`true`

解释：玩家1选择了 `3`，那么玩家2可以选择值为 `2` 的节点，就能确保获胜了



## 代码实现

由于**第一次选择**过后，从第二轮开始每次都只能选择**相邻的节点**，所以实际上第一步的位置就已经决定了是否能获胜

当玩家一选择后，玩家二（我们）为了阻止玩家一能拿到更多的节点，我们需要**选择其相邻的节点**

- 相邻节点有三个：父节点、左子节点、右子节点
- 以下三种情况可以确保我们（玩家二）获胜
  - `x.left > x.right + x.parent + 1`
  - `x.right > x.left + x.parent + 1`
  - `x.parent > x.left + x.right + 1`

```js
var btreeGameWinningMove = function(root, n, x) {
    let xNode = getNodeByValue(root, x) // 获取值为x的节点
    let L = getNodeNum(xNode.left) // 获取x左子树的节点数量
    let R = getNodeNum(xNode.right) // 获取x右子树的节点数量
    let parent = n - L - R - 1 // 总数 - 左子树节点数量 - 右子树节点数量 - 1（本身） = 剩余的节点数量
    if(L > R + parent + 1) return true
    if(R > L + parent + 1) return true
    if(parent > L + R + 1) return true
    return false
};

// 获取子树的节点数量
function getNodeNum(node) {
    let num = 0;
    dfs(node);
    return num;

    function dfs(node) {
        if(!node) return
        num += 1;
        dfs(node.left);
        dfs(node.right);
    }
}

// 根据value获取节点
function getNodeByValue(root, x) {
    if(!root) return root;
    if(root.val === x) {
        return root;
    }
    let node
    if(root.left) node = getNodeByValue(root.left, x) || node
    if(root.right) node = getNodeByValue(root.right, x) || node
    return node
}
```









