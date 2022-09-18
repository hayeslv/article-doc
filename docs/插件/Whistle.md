# 使用 `whistle` 进行代理

- 安装

```bash
npm i -g whistle
```

- 启动

```bash
w2 start
```

默认服务器地址：`http://127.0.0.1:8899`

- 打开 `url` ：`http://127.0.0.1:8899`

配置 `Rules`

```bash
http://10.10.160.66:8030/muck-web/ http://127.0.0.1:8080/muck-web/
```

将 `http://10.10.160.66:8030/muck-web/` 代理到 `http://127.0.0.1:8080/muck-web/`

相当于网页访问 `http://10.10.160.66:8030/muck-web/`，实际上是访问到了 `http://127.0.0.1:8080/muck-web/`



- 使用 `chrome` 插件：`SwitchyOmega`

添加情景模式->代理服务器 `website`（名字）

`HTTP` -> `127.0.0.1` -> `8899`

添加情景模式 -> 自动切换模式 `dev`（名字）

规则：域名通配符 -> `10.10.160.66` -> `website`

最后，插件选择  `dev` 模式即可







