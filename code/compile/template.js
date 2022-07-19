// 版本1
// const compile = function(template, data) {
//   let result = template;
//   for(const key in data) {
//     if(data.hasOwnProperty(key)) { // 判断key是否是data身上的
//       const reg = new RegExp(`{{${key.trim()}}}`, "g")
//       result = result.replace(reg, data[key])
//     }
//   }
//   return result
// }

// 版本2
// const compile = function(template, data) {
//   return template.replace(/{{(.+?)}}/g, (match, key) => data[key])
// }

// const template = "<p>Hello, I'm {{name}}! {{age}} years old!</p>"
// const data = {
//   name: "hayes",
//   age: 18
// }
// const result = compile(template, data)
// console.log(result); // <p>Hello, I'm hayes! 18 years old!</p>




const compile = function(template) {
  // 模板字符串
  let result = template.replace(/{{(.+?)}}/g, (match, key) => {
    return `" + obj.${key} + "`
  });
  console.log(result);
  result = `return "${result}"`;
  return new Function("obj", result);
}
const template = "<p>Hello, I'm {{user.name}}! {{user.age}} years old!</p>"
const render = compile(template)

const data = {
  user: {
    name: "hayes",
    age: 18
  }
}
const result = render(data)
console.log(result); // <p>Hello, I'm hayes! 18 years old!</p>