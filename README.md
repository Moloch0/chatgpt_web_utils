# ChatGPT Web Utils

一个面向 ChatGPT 网页版的 Tampermonkey/Violentmonkey 用户脚本，将对话导出、Markdown 整理和 LaTeX 公式复制集中在一个工具面板中。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)。
2. 点击 [安装 ChatGPT Web Utils](https://raw.githubusercontent.com/Moloch0/chatgpt_web_utils/main/chatgpt-web-utils.user.js)。
3. 在用户脚本管理器中确认安装，然后刷新 [ChatGPT](https://chatgpt.com/)。

脚本管理器会根据脚本头部的 `@version` 和 `@updateURL` 检查更新。发布新版本时必须同时递增 `@version`。

## 功能

- 导出当前对话或账号历史列表中的对话。
- 支持 Markdown、JSON、TXT 和适合参考材料的分片 Markdown。
- 按 `Round` 组织每轮用户提问和最终回答，不再把每个 API 节点当成独立章节。
- 自动过滤“思考了 4s”、`thoughts`、内部推理状态和工具过程。
- 将 API 正文中的 `\(...\)`、`\[...\]` 转换为 `$...$`、`$$...$$`。
- 保留代码块、列表、表格和可用的附件引用。
- 清理内部引用标记，并在接口提供真实 URL 时生成 Sources 列表。
- 复制包含公式的页面选区时保留 LaTeX 源码。
- 双击公式进行复制；按住 `Alt` 双击时仅复制 TeX 正文。
- 可选的浏览器原生选区引用兼容模式。

## 使用

打开 ChatGPT 后，点击页面右下角的 **ChatGPT Web Utils** 按钮：

- 选择“当前对话”或“历史对话”。
- 选择导出格式。
- 点击“导出文件”；当前对话也可以直接复制 Markdown。

当前对话默认优先读取 ChatGPT 接口，以获得尚未渲染到页面上的完整内容。接口不可用时会回退到当前页面已经加载的消息。

Markdown 导出采用以下层级：一级标题是对话标题，二级标题是 `Round N`，`User` 和 `Assistant` 使用粗体标签。隐藏思维链不会导出；真正的用户可见回答内容会保留。

## 隐私与权限

- 脚本只匹配 `chatgpt.com` 和 `chat.openai.com`。
- 网络请求仅访问当前 ChatGPT 站点的会话及对话接口。
- 对话内容不会上传到第三方服务。
- 导出文件由浏览器在本地生成。
- 设置只保存在浏览器 `localStorage` 中。

导出内容可能包含私人对话，请妥善保管生成的文件。

## 已知限制

- ChatGPT 的页面结构和内部接口可能随时变化。
- 历史导出只涵盖当前账号历史接口返回且有权限访问的对话。
- 图片和附件不会嵌入导出文件，只保留可用链接或占位信息。
- 自动更新依赖 GitHub Raw 可访问，以及用户脚本管理器允许更新检查。

## 开发与发布

仓库根目录的 `chatgpt-web-utils.user.js` 是唯一安装入口，不需要构建步骤。

发布修改时：

1. 更新脚本头部和 `globalThis.OmniGPTVersion` 中的版本号。
2. 更新 `CHANGELOG.md`。
3. 提交并推送到 `main` 分支。

## 来源与许可

本项目基于 [OmniGPT](https://github.com/sakur7a/OmniGPT) 继续维护，并保留原项目贡献者署名。

项目采用 [GPL-3.0-or-later](LICENSE) 许可证。
