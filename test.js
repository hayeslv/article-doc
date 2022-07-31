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

console.log(multiply("123", "456"));