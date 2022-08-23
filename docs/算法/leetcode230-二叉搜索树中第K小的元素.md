# 二叉搜索树中第K小的元素

[二叉搜索树中第K小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

给定一个二叉搜索树的根节点 `root` ，和一个整数 `k` ，请你设计一个算法查找其中第 `k` 个最小元素（从 1 开始计数）。



## 示例

- 示例1

```js
输入：k = 1
     3
 1       4 
   2
输出：1
```

解释：结果数组排序后为 `[1,2,3,4]`，第1个最小的值为 `1`

- 示例2

```js
输入：k = 3
       5
    3    6
  2   4
1
输出：3
```

解释：排序后的数组为 `[1,2,3,4,5,6]`，第3个最小值为 `3`



## 代码实现

**方法1：遍历**

遍历整棵二叉树，拿到全部节点后进行排序，返回第 `k` 个值

```js
var kthSmallest = function(root, k) {
  let list = []
  getList(root, list)
  return list.sort((a, b) => a - b) // 对结果数组进行排序（从小到大）
  					[k - 1] // 返回第 k-1 项（因为数组下标是从0开始的）
}
function getList(node, list) {
  if(!node) return
  list.push(node.val) // 将当前节点值放入数组
  // 递归遍历左右子节点
  getList(node.left, list)
  getList(node.right, list)
}
```

优化点：题目点名了是一颗**二叉搜索树**，它的特点就是中序遍历后的结果是有序的，利用这一点可以不需要进行 `sort` 排序了

```js
var kthSmallest = function(root, k) {
  let list = []
  getList(root, list)
  return list[k - 1] // 直接返回相应的值（list已经是有序的了）
}
function getList(node, list) {
  if(!node) return
  // 先遍历左子树
  getList(node.left, list)
  // 再将当前节点的值插入
  list.push(node.val)
  // 然后遍历又子树
  getList(node.right, list)
}
```



**方法2：记录子树的节点数**

优点：对每个节点的子节点数量进行缓存，如果我们需要频繁地查找第 `k` 小的值，就会快很多（只有初始化的时候会遍历一次）

在方法1中，我们之所以需要中序遍历，是因为我们不知道子树的节点数量，不得不通过遍历子树的方式来获知。

因此，我们可以记录下以**每个节点为根节点**的子树的**节点数**，并在查找第 `k` 小的值时，进行搜索：

- 从根节点（`root`）开始计算
- 对当前 `node` 进行如下操作
  - 如果 `node` 的左子树的节点数 `left` 小于 `k-1`，说明 `k` 一定在右子树中
    - 将 `node` 赋值为其右子树的节点
    - 修改 `k` 等于 `k - (left + 1)`
    - 继续搜索
  - 如果 `node` 的左子树的节点数 `left` 等于 `k-1`，则直接返回 `node` 即可
  - 如果 `node` 的左子树的节点数 `left` 大于 `k-1`，则 `k` 一定在左子树中
    - 将 `node` 赋值为其左子树的节点，并继续搜索

```js
var kthSmallest = function(root, k) {
  const tree = new MyTree(root);
  return tree.kthSmallest(k);
}
class MyTree {
  constructor(root) {
    this.root = root;
    this.nodeNum = new Map();
    this.countNodeNum(root); // 初始化的时候计算一次（在其中进行缓存）
  }
  // 统计以node为根节点的子树的节点数
  countNodeNum(node) {
    if(!node) return 0;
    // key为node，值为 1（当前节点） + 左子树节点 + 右子树节点
    this.nodeNum.set(node, 1 + this.countNodeNum(node.left) + this.countNodeNum(node.right));
    return this.nodeNum.get(node);
  }
  // 获取以node为根节点的子树的节点数
  getNodeNum(node) {
    return this.nodeNum.get(node) || 0;
  }
  // 返回二叉搜索树中第k小的元素
  kthSmallest(k) {
    let node = this.root; // 根节点是root
    while(node) {
      const left = this.getNodeNum(node.left); // 获取左子树的节点数
      if(left < k-1) {
        node = node.right;
        k = k - (left + 1);
      } else if(left === k-1) {
        break;
      } else {
        node = node.left
      }
    }
    return node.val
  }
}
```









































