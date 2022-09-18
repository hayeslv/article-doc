- 引入FontAwesome依赖

```bash
npm i -S @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/react-fontawesome@latest
```

- 使用

```jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export default function Counter(props) {
  return <FontAwesomeIcon icon={faPlus} />
}
```

















