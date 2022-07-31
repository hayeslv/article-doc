# JS大数相加、大数相乘

`JavaScript` 只有一种数字类型，可以使用也可以不使用小数点来书写数字。

在 `JavaScript` 中，数字不分为整数类型和浮点数类型，所有的数字都是**浮点数类型**。`JavaScript` 采用 `IEEE754` 标准定义的 64 位浮点格式表示数字，此格式用 64 位存储数值。其中 `0~51`存储数字片段，`52~62`存储指数，`63` 位存储符号。

来看看 `JavaScript` 中数字的**最大值**和**最小值**：

```js
console.log(Number.MAX_VALUE); // 1.7976931348623157e+308
console.log(Number.MIN_VALUE); // 5e-324
```

> 注：这里的最大值指的是字面意思上的最大值；最小值则指的是正数情况下小数点后能表示的最小值。



## 一、实现两个大数相加

思路：大数可能会超出 `JavaScript` 的**数字类型范围**，超出后结果**损失精度**，所以可以用字符串的方式来存储大数。

题解：

```js
let a = "9876543210123456789000000000123";
let b = "1234567898765432100000012345678901";
function add(str1, str2) {
  // 获取两个数字的最大长度
  let maxLength = Math.max(str1.length, str2.length);
  // 用0补齐长度，让它们两个长度相同
  str1 = str1.padStart(maxLength, 0); // "0009876543210123456789000000000123"
  str2 = str2.padStart(maxLength, 0); // "1234567898765432100000012345678901"
  let temp = 0; // 每个位置相加之和
  let flag = 0; // 进位：相加之和如果大于等于10，则需要进位
  let result = "";
  for(let i=maxLength-1; i>=0; i--) {
    // 获取当前位置的相加之和：字符串1 + 字符串2 + 进位数字
    temp = parseInt(str1[i]) + parseInt(str2[i]) + flag;
    // 获取下一个进位
    flag = Math.floor(temp/10);
    // 拼接结果字符串
    result = temp%10 + result;
  }
  if(flag === 1) {
    // 如果遍历完成后，flag还剩1，说明两数相加之后多了一位，类似于：95 + 10 = 105
    result = "1" + result;
  }
  return result;
}
```



## 二、实现两个大数相乘

给定两个以字符串形式表示的非负整数 `num1` 和 `num2`，返回 `num1` 和 `num2` 的乘积，它们的乘积也表示为字符串形式。

**思路：**

- 首先，两个多位数相乘，我们可以分解成**其中一个多位数**和**另一个多位数的每一位**相乘
  - 这里利用的思路和上面的**大数相加**一致
- 得到其每一位相乘的结果后，在其结果后面补齐相应的0，并将其放入结果数组中
- 最后，用上述**大数相加**的函数，对结果数组进行累加，即可得到最终的相乘字符串了。
- 需要注意的点是相乘的两数其中之一可能是0，所以最后一步需要将左侧的0（除了最右边的一位）全部去掉



```js
function multiply(str1, str2) {
  let result = "";
  const multiplyArr = [];
  let count = 0; // 当前位数（从个位开始）
  // 用位数少的每一位去乘位数多的，这样需要的存储空间更小，运算速度更快
  if(str1.length < str2.length) {
    [str1, str2] = [str2, str1];
  }
  // 循环用第二个数的每一位乘以第一个数
  for(let i=str2.length-1; i>=0; i--) {
    let multiplyItem = manyMultiplyOne(str1, str2[i]); // 获取多位数乘单位数的结果
    multiplyArr[count] = multiplyItem.padEnd(multiplyItem.length + count, "0"); // 进行补0操作
    count++;
  }
  // 接下来，将multiplyArr中的每一项累加，就能得到最终的结果了
  result = multiplyArr[0] // 从第一个开始累加
  for(let i=1; i<multiplyArr.length; i++) {
    result = add(result, multiplyArr[i]);
  }

  // 去除末尾以外的前置0
  result = removeLeftZero(result);

  return result;
}

/**
 * 多位数乘单个数
 */
function manyMultiplyOne(many, one) {
  let temp = 0; // 每个位置相乘的结果
  let flag = 0; // 进位数
  let result = "";

  // 进行每一位的乘法运算，并进行进位操作（从后往前操作，代表从最小位置开始：个十百千万）
  for(let i=many.length-1; i>=0; i--) {
    temp = many[i] * one + flag; // 获取当前项的乘积
    flag = Math.floor(temp/10); // 获取进位数
    result = temp%10 + result;
  }

  // 最后，如果进位还要剩下，则将进位放在最前面
  if(flag !== 0) {
    result = flag + result;
  }

  return result;
}

// 两数相加，用的上面介绍的函数
function add(str1, str2) {
  // 获取两个数字的最大长度
  let maxLength = Math.max(str1.length, str2.length);
  // 用0补齐长度，让它们两个长度相同
  str1 = str1.padStart(maxLength, 0); // "0009876543210123456789000000000123"
  str2 = str2.padStart(maxLength, 0); // "1234567898765432100000012345678901"
  let temp = 0; // 每个位置相加之和
  let flag = 0; // 进位：相加之和如果大于等于10，则需要进位
  let result = "";
  for(let i=maxLength-1; i>=0; i--) {
    // 获取当前位置的相加之和：字符串1 + 字符串2 + 进位数字
    temp = parseInt(str1[i]) + parseInt(str2[i]) + flag;
    // 获取下一个进位
    flag = Math.floor(temp/10);
    // 拼接结果字符串
    result = temp%10 + result;
  }
  if(flag === 1) {
    // 如果遍历完成后，flag还剩1，说明两数相加之后多了一位，类似于：95 + 10 = 105
    result = "1" + result;
  }
  return result;
}

function removeLeftZero(str) {
  let count = 0; // 计算从头部开始，有几个0
  for(let i=0; i<str.length; i++) {
    if(str[i] === "0" && i < str.length - 1) {
      count++;
    } else {
      break;
    }
  }
  return str.substr(count, str.length);
}
```



























