## 一、初始化cli

- 安装依赖

```bash
npm i -g ts-node-dev
```

用于调试程序

```bash
pnpm add -D commander inquirer@8.2.2 fs-extra kolorist
```



## 二、编写脚本

```ts
// cli/src/index.ts
import { Command } from "commander";

// Command可以创建命令，注册命令接口，与用户进行交互
const cmd = new Command();

// 注册命令、参数，以及用户传入之后的回调函数
// $ ts-node ./src/index.ts create --type component
cmd.command("create")
  .description("创建一个组件模板或配置文件")
  // 添加命令参数 -t | --type，<type>表明为必选参数
  .option("-t --type <type>", "创建类型，可选值：component，lib-entry")
  // 注册回调函数
  .action((args) => {
    console.log(args);
  });

// 执行命令行参数的解析
cmd.parse();
```

在 `cli`下命令行输入：`tsnd .\src\index.ts create -t component`

可以看到打印的 `args`：`{ type: 'component' }`



### 用户未传入时，让其选择

```ts
import { Command } from "commander";
import * as inquirer from "inquirer";

// 选项列表
const CREATE_TYPES = ["component", "lib-entry"];

const cmd = new Command();

// $ ts-node ./src/index.ts create --type component
cmd.command("create")
  .description("创建一个组件模板或配置文件")
  .option("-t --type <type>", "创建类型，可选值：component，lib-entry")
  .action(async(args) => {
    // 容错，判断用户是否输入了type
    let { type } = args;
    // 未输入，提示用户重新输入，给用户一个列表去选择
    if (!type) {
      const result = await inquirer.prompt([
        {
          // 获取输入后的属性名
          name: "type",
          // 交互方式为列表选择
          type: "list",
          // 提示信息
          message: "（必填）请选择创建类型：",
          // 选项列表
          choices: CREATE_TYPES,
          // 默认选项：默认数组的第一项
          default: 0,
        },
      ]);
      // 将选中的type赋值
      type = result.type;
    }
  });

// 执行命令行参数的解析
cmd.parse();
```

现在执行：`yarn dev create`，（注意，这里没有传 -t 的参数），就可以看到出现选择项了

![8](..\assets\8.png)



### 重构

- `cli/command/create.ts`

具体实现

```ts
import * as inquirer from "inquirer";
import { red } from "kolorist";

// 选项列表
const CREATE_TYPES = ["component", "lib-entry"];

export async function onCreate(args = { type: "" }) {
  // 容错，判断用户是否输入了type
  let { type } = args;
  //! 错误1：未输入，提示用户重新输入，给用户一个列表去选择
  if (!type) {
    const result = await inquirer.prompt([
      {
        // 获取输入后的属性名
        name: "type",
        // 交互方式为列表选择
        type: "list",
        // 提示信息
        message: "（必填）请选择创建类型：",
        // 选项列表
        choices: CREATE_TYPES,
        // 默认选项：默认数组的第一项
        default: 0,
      },
    ]);
    // 将选中的type赋值
    type = result.type;
  }
  //! 错误2：用户输入了信息，但是输入错误，要求用户重新选择
  if (!CREATE_TYPES.includes(type)) {
    console.log(
      red(`当前类型仅支持：${CREATE_TYPES.join(", ")};您输入的是："${type}"，请重新选择！`),
    );
    return onCreate();
  }

  // 输入则创建对应的内容
}
```

- `cli/src/index.ts`

调用

```ts
import { Command } from "commander";
import { onCreate } from "../command/create";

// Command可以创建命令，注册命令接口，与用户进行交互
const cmd = new Command();

// 注册命令、参数，以及用户传入之后的回调函数
// $ ts-node ./src/index.ts create --type component
cmd.command("create")
  .description("创建一个组件模板或配置文件")
  // 添加命令参数 -t | --type，<type>表明为必选参数
  .option("-t --type <type>", "创建类型，可选值：component，lib-entry")
  // 注册回调函数
  .action(onCreate);

// 执行命令行参数的解析
cmd.parse();
```



### 让用户继续选择组件分类

```ts
// 组件分类
const DOCS_CATEGORIES = ["通用", "导航", "反馈", "数据录入", "数据显示"];

export async function onCreate(args = { type: "" }) {
  // ...

  // 输入则创建对应的内容
  try {
    switch (type) {
      case "component": {
        // 如果是组件，我们还需要收集组件信息
        const info = await inquirer.prompt([
          {
            name: "name",
            type: "input",
            message: "（必填）请输入组件name，将用作文件名和文件夹名称",
            validate(value: string) {
              if (value.trim() === "") return "组件name不能为空！";
              return true;
            },
          },
          {
            name: "title",
            type: "input",
            message: "（必填）请输入组件中文名称，将用作文档列表中显示",
            validate(value: string) {
              if (value.trim() === "") return "组件名称不能为空！";
              return true;
            },
          },
          {
            name: "category",
            type: "list",
            message: "（必填）请选择组件分类，将用作文档列表分类中",
            choices: DOCS_CATEGORIES,
            default: 0,
          },
        ]);
        // 根据info信息，创建组件模板文件
        createComponent(info);
        break;
      }
      default:
        break;
    }
  } catch (error) {

  }
}
```



### 创建组件文件

`cli/shared/create-component`

```ts
import { ensureDirSync } from "fs-extra";
import { resolve } from "path";
import { lightBlue, lightGreen } from "kolorist";

export interface ComponentMeta {
  name: string;
  title: string;
  category: string;
}

export default function createComponent(meta: ComponentMeta) {
  const { name } = meta;

  // 这里name需要做一些规范

  // 拼接组件目录：希望创建的目录 src/xxx/
  const componentDir = resolve("../src", name);

  // 其他核心文件目录：组件源文件、类型、样式、测试
  const compSrcDir = resolve(componentDir, "src");
  const styleDir = resolve(componentDir, "style");
  const testDir = resolve(componentDir, "test");

  ensureDirSync(compSrcDir);
  ensureDirSync(styleDir);
  ensureDirSync(testDir);
}
```

执行 `yarn dev create -t component`， 依次输入相应的内容，就可以看到成功创建了文件





