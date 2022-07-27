

# Tree Shaking 实现流程



- `rollup` 中的 `Tree Shaking` 使用 `acorn` 实现 `AST` 抽象语法树的遍历解析，`acorn` 和 `babel` 功能相同，但 `acorn` 更加轻量，在此之前 `AST` 工作流也是必须要了解的；
- `rollup` 使用 `magic-string` 工具操作字符串和生成 `source-map`

**流程**

- `rollup` 阶段，解析源码，生成 `AST tree`，对 `AST tree` 上的每个节点进行遍历，判断出是否 `include`（标记避免重复打包），标记后生成 `chunks`，最后导出。
- `generate/write`阶段，根据 `rollup` 阶段做的标记，进行代码收集，最后生成真正用到的代码。



## 1、模块解析

- 





https://juejin.cn/post/6968262966604988429#heading-9