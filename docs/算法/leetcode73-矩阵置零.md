# 矩阵置零

[矩阵置零](https://leetcode.cn/problems/set-matrix-zeroes/)

给定一个 `m * n` 的矩阵，如果一个元素为 **0** ，则将其所在行和列的所有元素都设为 **0** 。请使用 **[原地](http://baike.baidu.com/item/原地算法)** 算法**。**



## 示例

```js
// 示例1
1 1 1         1 0 1
1 0 1   =>    0 0 0
1 1 1         1 0 1
// 示例2
0 1 2 0      0 0 0 0
3 4 5 2  =>  0 4 5 0
1 3 1 5      0 3 1 0
```



## 思路

对于二维数组，我们可以考虑使用双重循环来遍历数组的每一项

- 遍历二维数组

- 当前遍历项为数字 `0` 时，将其横竖两个方向不为 `0` 的数字变为字母 `o`

  - 为什么要先改为字母 `o`，拿**示例2**来说，如果直接改为数字 `0`，那么第一轮遍历会将数组变为：

    ```js
    0 0 0 0
    0 4 5 2
    0 3 1 5
    ```

    第二轮的结果为：

    ```js
    0 0 0 0
    0 0 0 0
    0 3 1 5
    ```

    则最终结果肯定是一个全为 `0` 的数组

- 最后将字母 `o` 改为数字 `0` 即可



## 代码实现

```js
var setZero = function(matrix) {
  let n = matrix.length; // 获取总行数
  let m = matrix[0].length; // 获取总行数
  // 开始遍历二维数组
  for(let i=0; i<n; i++) { // 行遍历
    for(let j=0; j<m; j++) { // 列遍历
      if(matrix[i][j] === 0) { // 发现当前遍历项为 0 了
        for(let z=0; z<n; z++) { // 处理当前行的所有数据
          if(matrix[z][j] !== 0) { // 避免影响到其他 “原始的数字0”
            matrix[z][j] = "o";
          }
        }
        for(let z=0; z<m; z++) { // 处理当前列的所有数据
          if(matrix[i][z] !== 0) {
            matrix[i][z] = "0";
          }
        }
      }
    }
  }
  // 将全部的字母 o 替换成数字 0
  for(let i=0; i<n; i++) {
    for(let j=0; j<m; j++) {
      matrix[i][j] = 0;
    }
  }
  return matrix;
}
```

优化（标记法）：只维护两个一维数组，分别代表行列

```js
var setZeroes = function(matrix) {
  const n = matrix.length, m = matrix[0].length;
  // 创建行列数组，内部元素全部初始化为false，表示此行/列不为0
  const row = new Array(n).fill(false); 
  const col = new Array(m).fill(false);
  // 遍历二维数组
  for(let i=0; i<n; i++) {
    for(let j=0; j<m; j++) {
      if(matrix[i][j] === 0) { 
        // 例如示例1中 [1,1] 是0，则这里就是 row[1] = col[1] = true
        // 代表第一行全是0，第一列也全是0
        row[i] = col[j] = true;
      }
    }
  }
  // 依据row和col两个数组，更新0
  for(let i=0; i<n; i++) {
    for(let j=0; j<m; j++) {
      if(row[i] || col[j]) matrix[i][j] = 0;
    }
  }
  return matrix;
}
```

























