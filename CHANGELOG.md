# Changelog

## 0.3.3 - 2026-10-08

- 将 ChatGPT 引用元数据映射回正文，在原引用位置生成 `[来源标题](URL)`。
- 同时兼容 `content_references` 的 `matched_text`/`safe_urls` 和 `citations` 的位置/元数据结构。
- 只有无法定位到正文的真实来源才追加到 Round 的 Sources 列表。

## 0.3.2 - 2026-10-08

- 将导出结构从逐消息改为逐 Round：每轮包含一个 User 提问和一个 Assistant 最终回答。
- Markdown 使用一级对话标题、二级 Round 标题和粗体角色标签。
- 优先选择标记为 `final` 的回答；旧数据没有频道标记时选择最后一条有效回答。
- 过滤思考耗时、`thoughts`、推理状态、隐藏分析和无效工具过程。
- 修复 `thoughts` 被误判为附件并触发附件警告的问题。
- 清理 ChatGPT 内部引用标记；存在真实来源 URL 时输出 Sources 列表。
- JSON、TXT 和参考材料分片统一采用 Round 数据结构。

## 0.3.1 - 2026-10-08

- 建立 `ChatGPT Web Utils` 独立仓库和统一安装入口。
- 将项目主页、问题反馈、下载和自动更新地址切换到本仓库。
- 修复 API 导出公式未转换为 Markdown `$` / `$$` 定界符的问题。
- 转换时跳过 fenced code block 和行内代码，避免改写代码示例。

## 0.3.0

- 提供当前对话和历史对话导出。
- 支持 Markdown、JSON、TXT 和参考材料分片。
- 支持 LaTeX 公式复制与可选引用兼容模式。
