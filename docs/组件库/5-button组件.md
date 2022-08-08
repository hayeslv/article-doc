# 开发Button组件



## 一、最小步骤实现一个简单的Button组件

- 创建文件：`src/button/index.ts`（目前是空文件）

```ts
// 在这个文件将组件暴露出去：插件或单个组件的形式
```

- `Button`真正的源码位置：`src/button/src/button.tsx`

```tsx
import { defineComponent } from "vue";

export default defineComponent({
  name: "HButton",
  setup() {
    return () => {
      return <button>按钮</button>;
    };
  },
});
```

依据最小功能原则，上述代码就是 `Button` 组件的最基本样子了。



### 1、默认插槽内容

`defaultSlot` 是 `Button` 组件的默认插槽内容。因为它是渲染内容，所以我们将其放在渲染函数中。

```tsx
export default defineComponent({
  name: "HButton",
  setup(props, { slots }) {
    return () => {
      const defaultSlot = slots.default ?  slots.default() : "按钮"
      return <button>{defaultSlot}</button>;
    };
  },
});
```



### 2、导出组件

`src/button/index.ts`

```ts
// 在这个文件将组件暴露出去：插件或单个组件的形式
import type { App } from "vue";
import Button from "./src/button";

// 具名导出
export { Button };

// 导出插件
export default {
  install(app: App) {
    app.component(Button.name, Button);
  },
};
```



### 3、预览组件

在 `main.ts` 中以插件形式引入 `Button`

```ts
import Button from "./button";

createApp(App)
  .use(Button)
  .mount("#app");
```

此时，在项目中就可以全局使用 `<HButton></HButton>` 组件了



## 二、按钮类型

### 1、添加 `type` 类型

```ts
// button/src/button-type.ts
import type { ExtractPropTypes, PropType } from "vue";

export type IButtonType = "primary" | "secondary" | "text";

export const buttonProps = {
  type: {
    type: String as PropType<IButtonType>,
    default: "secondary",
  },
} as const;

export type ButtonProps = ExtractPropTypes<typeof buttonProps>
```

### 2、根据 `type` 组装样式

根据 `props` 传入的 `type` 值，对 `button` 设置 `clsss` 样式名称

```tsx
// button/src/button.tsx
import { defineComponent, toRefs } from "vue";
import { buttonProps } from "./button-type";

export default defineComponent({
  name: "HButton",
  props: buttonProps,
  setup(props, { slots }) {
    const { type } = toRefs(props);

    return () => {
      const defaultSlot = slots.default ?  slots.default() : "按钮";
      return <button class={`h-btn h-btn--${type.value}`}>{defaultSlot}</button>;
    };
  },
});
```

来看看我们渲染出来的HTML

```html
<button class="h-btn h-btn--primary">按钮</button>
```

搞定！接下来就是为其添加样式了。



## 三、组件样式

这里用了 `css` 的变量 **var**，好处是将来我们可以通过 `js` 的方式直接修改变量，从而在**运行时**直接修改整体的色调（为将来动态换肤做准备）

### 1、公共样式

由于我们做的组件库需要**主题定制**，所以将相关的变量抽取出来

```scss
// src/style/variable.scss
// 定义主题变量
$h-border-radius: var(--h-border-radius, 2px); // 一般圆角
$h-font-size-md: var(--h-font-size-md, 12px); // 当组件size为''时使用此字号大小
$h-animation-duration-slow: var(--h-animation-duration-slow, 300ms);
$h-animation-ease-in-out-mooth: var(
  --h-animation-ease-in-out-smooth,
  cubic-bezier(0.645, 0.045, 0.355, 1)
);
$h-light-text: var(--h-light-text, #ffffff); // 有色深色背景下字体颜色（固定）
$h-primary: var(--h-primary, #5e7ce0); // 主要按钮，同品牌色
$h-primary-hover: var(--h-primary-hover, #7693f5); // 主要按钮悬停
$h-primary-active: var(--h-primary-active, #344899); // 主要按钮激活
$h-text: var(--h-text, #252b3a); // 正文文本
$h-block: var(--h-block, #ffffff); // 大面积的不可折叠区块的背景色（例如顶部导航背景色）
$h-line: var(--h-line, #adb0b8); // 边框分割线，仅用于边框
$h-form-control-line-active: var(--h-form-control-line-active, #5e7ce0); // 表单控件边框激活色，用于获得焦点
$h-brand-active: var(--h-brand-active, #526ecc); // 品牌色激活色（加深）
$h-brand-active-focus: var(--h-brand-active-focus, #344899); // 品牌色焦点色（重度加深）
```



### 2、按钮基础样式

```scss
// src/button/style/button-base.scss
@import "../../style/variable.scss";

@mixin button-base {
  // 布局样式
  @apply inline-flex items-center justify-center;

  // 元素属性
  @apply
  border-[1px] border-solid border-transparent
  h-[28px] py-0 px-[20px]
  bg-transparent;
  border-radius: $h-border-radius;

  // 文本属性
  @apply outline-0 leading-normal whitespace-nowrap
  cursor-pointer;

  // 文字样式
  font-size: $h-font-size-md;

  // 其他样式
  transition: background-color $h-animation-duration-slow $h-animation-ease-in-out-mooth,
    border-color $h-animation-duration-slow $h-animation-ease-in-out-mooth,
    color $h-animation-duration-slow $h-animation-ease-in-out-mooth;
}

// $variant：传入type
@mixin button-variant($variant, $pseudo: false) {
  @each $key, $value in $variant { // 第一层是多态的类型
    &.h-btn--#{$key} {
      @each $item-key, $item-value in $value { // 第二层是多态类型下的样式
        @if $pseudo { // 如果是伪类就继续第三层
          &:#{$item-key} {
            @each $sub-item-key, $sub-item-value in $item-value { // 第三层是伪类的样式
              #{$sub-item-key}: $sub-item-value;
            }
          }
        } @else { // 不是伪类就直接设置样式
          #{$item-key}: $item-value;
        }
      }
    }
  }
}
```



### 3、不同type的自定义样式

```scss
// src/button/style/button-config.scss
// 所有不同type的按钮自定义样式，作为参数使用
$type: (
  primary: (
    color: $h-light-text,
    background-color: $h-primary,
  ),
  secondary: (
    color: $h-text,
    background-color: $h-block,
    border-color: $h-line,
  ),
  text: (
    padding: 0,
    color: $h-brand-active,
  ),
);

// 伪类的配置
$pseudo: (
  primary: (
    hover: (
      background-color: $h-primary-hover,
    ),
    focus: (
      background-color: $h-primary-hover,
    ),
    active: (
      background-color: $h-primary-active,
    ),
  ),
  secondary: (
    hover: (
      border-color: $h-form-control-line-active,
      color: $h-brand-active,
    ),
    focus: (
      border-color: $h-form-control-line-active,
    ),
    active: (
      border-color: $h-form-control-line-active,
      color: $h-brand-active,
    ),
  ),
  text: (
    hover: (
      background-color: $h-brand-active-focus,
    ),
    focus: (
      background-color: $h-brand-active-focus,
    ),
    active: (
      background-color: $h-brand-active-focus,
    ),
  )
)
```





### 4、按钮样式

```scss
// src/button/style/button.scss
@use "./button-config.scss";
@import "./button-base.scss";
.h-btn {
  // 将button-base的样式放进来
  @include button-base;

  // 导入type相关的样式
  @include button-variant(button-config.$type);
  // 导入hover等伪类
  @include button-variant(button-config.$pseudo, true);
}
```

上述代码，其实就是想生成如下代码

```scss
.h-btn {
  // ========== button-base部分 ==========
  // 布局样式
  @apply inline-flex items-center justify-center;

  // 元素属性
  @apply
  border-[1px] border-solid border-transparent
  h-[28px] py-0 px-[20px]
  bg-transparent;
  border-radius: $h-border-radius;

  // 文本属性
  @apply outline-0 leading-normal whitespace-nowrap
  cursor-pointer;

  // 文字样式
  font-size: $h-font-size-md;

  // 其他样式
  transition: background-color $h-animation-duration-slow $h-animation-ease-in-out-mooth,
    border-color $h-animation-duration-slow $h-animation-ease-in-out-mooth,
    color $h-animation-duration-slow $h-animation-ease-in-out-mooth;
  
  // ========== button-type部分 ==========
  // 主要按钮
  &.h-btn--primary {
    color: $h-light-text;
    background-color: $h-primary;

    &:hover,
    &:focus {
      background-color: $h-primary-hover;
    }

    &:active {
      background-color: $h-primary-active;
    }
  }

  // 次要按钮
  &.h-btn--secondary {
    color: $h-text;
    background-color: $h-block;
    border-color: $h-line;

    &:hover,
    &:focus,
    &:active {
      border-color: $h-form-control-line-active;
      color: $h-brand-active;
    }
  }

  // 文字按钮
  &.h-btn--text {
    padding: 0;
    color: $h-brand-active;

    &:hover,
    &:focus,
    &:active {
      color: $h-brand-active-focus;
    }
  }
}
```



### 5、引入样式

```scss
// index.scss
@import "button/style/button.scss"
```

现在，就可以看到按钮的效果了~

> 注：解决@apply警告
>
> 在 `.vscode` 文件夹下新建 `settings.json` 文件，添加如下代码：
>
> ```json
> {
>   "css.validate": false,
>   "scss.validate": false,
>   "less.validate": false,
> }
> ```



## 四、按钮尺寸

### 1、类型和API

- 期待的用法

```vue
<h-button size="large">button</h-button>
```

- 给按钮添加 `size` 属性

```ts
// button/src/button-type.ts
export type IButtonSize = "small" | "medium" | "large";

export const buttonProps = {
  // ...
  size: {
    type: String as PropType<IButtonSize>,
    default: "medium"
  }
} as const;
```

- 根据传入的内容，生成相应的样式

```tsx
// button/src/button.tsx
export default defineComponent({
  setup(props, { slots }) {
    const { type, size } = toRefs(props); // 结构size
    return () => {
      const defaultSlot = slots.default ?  slots.default() : "按钮";
      {/* 生成size样式 */}
      return <button class={`h-btn h-btn--${type.value} h-btn--${size.value}`}>{defaultSlot}</button>;
    };
  },
});
```

- 渲染出的内容

```vue
<HButton>Medium</HButton>
<!-- 等同于 -->
<button class="h-btn--medium">Medium</button>
```



### 2、添加样式

- 在 `scss` 配置项（`button-config.scss`） 中添加样式配置

```scss
// 按钮尺寸
$size: (
  small: (
    height: 24px,
    padding: 0 16px,
    font-size: $h-font-size-sm,
  ),
  medium: (
    font-size: $h-font-size-md,
  ),
  large: (
    height: 32px,
    padding: 0 24px,
    font-size: $h-font-size-lg,
  ),
);
```

- 在公共样式 `varable.scss` 中添加相应变量

```scss
$h-font-size-sm: var(--h-font-size-md, 10px); //当组件size为'small'时使用此字号大小
$h-font-size-md: var(--h-font-size-md, 12px); //当组件size为'medium'时使用此字号大小
$h-font-size-lg: var(--h-font-size-md, 14px); //当组件size为'large'时使用此字号大小
```

- 在 `button.scss` 中添加配置

```scss
.h-btn{
  // 导入size相关样式
  @include button-variant(button-config.$size);
}
```



## 五、禁用状态

- 定义属性

```ts
// button-type.ts
export const buttonProps = {
  // ...
  disabled: {
    type: Boolean,
    default: false,
  },
} as const;
```

- 使用 `disable` 属性

```tsx
export default defineComponent({
  setup(props, { slots }) {
    // 解构出disabled属性
    const { type, size, disabled } = toRefs(props);

    return () => {
      const defaultSlot = slots.default ?  slots.default() : "按钮";
      // 设置在button上
      return <button disabled={disabled.value} class={`h-btn h-btn--${type.value} h-btn--${size.value}`}>{defaultSlot}</button>;
    };
  },
});
```

- 编写样式

在 `button-config.scss` 中添加 `disabled` 伪类样式的配置

```scss
$pseudo: (
  primary: (
    // ...
    disabled: (
      color: $h-light-text,
      background-color: $h-primary-disabled,
      border: none,
    )
  ),
  secondary: (
    // ...
    disabled: (
      color: $h-disabled-text,
      background-color: $h-disabled-bg,
      border: 1px solid $h-disabled-line,
    )
  ),
  text: (
    // ...
    disabled: (
      color: $h-disabled-text,
    )
  )
);
```

- 在 `variable.scss` 中添加缺失的变量

```scss
$h-primary-disabled: var(--h-primary-disabled, #98a8df); // 主要按钮禁用状态
$h-disabled-text: var(--h-disabled-text, #757a83); // 禁用文本
$h-disabled-bg: var(--h-disabled-bg, #c6c9cf); // 禁用背景
$h-disabled-line: var(--h-disabled-line, #a5a8ad); // 禁用边框
```

- 在 `button.scss` 中添加 `disabled` 状态下的鼠标样式

```scss
.btn {
  // ...
  &[disabled] {
    cursor: not-allowed;
  }
}
```



## 六、块级组件

### 1、添加 `props`

```ts
// button-type.ts
export const buttonProps = {
  // ...
  block: {
    type: Boolean,
    default: false,
  },
} as const;
```

### 2、使用 `block`

```tsx
export default defineComponent({
  props: buttonProps,
  setup(props, { slots }) {
    const { block } = toRefs(props);

    return () => {
      const defaultSlot = slots.default ?  slots.default() : "按钮";
      const blockClass = block.value ? "h-btn--block" : ""; // block样式

      return <button class={`h-btn ${blockClass}`}>{defaultSlot}</button>;
    };
  },
});
```











