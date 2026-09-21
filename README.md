<picture>
  <img alt="Der Orange — Backend engineering & AI applications" src="./assets/header.svg" width="100%" />
</picture>

### 你好，我是 Der_Orange 👋

使用 **Go / Python** 构建后端服务，也用 **TypeScript / React** 把想法做成可交互的产品。

目前关注 **企业知识检索、Agent 工具编排与可靠的业务工作流**。我关心的不只是生成答案，还有答案的依据、操作的权限，以及失败后的恢复。

[浏览项目](https://github.com/Masterora?tab=repositories) · [Enterprise-RAG](https://github.com/Masterora/Enterprise-RAG) · [BankPilot Agent](https://github.com/Masterora/bankpilot-agent)

---

### 重点项目

#### [Enterprise-RAG](https://github.com/Masterora/Enterprise-RAG) · 企业知识助手

把分散的企业资料整理为知识库，围绕资料问答，并回到原文核查引用。

- **业务与权限：** Go-zero 承载认证、租户隔离、知识权限和运行控制。
- **Agent 与证据：** LangGraph 编排知识工具、检索与引用校验。
- **异步与恢复：** Outbox、JetStream 文档任务，以及运行取消、恢复和事件补拉。

`Go` `Python` `React` `PostgreSQL` `Milvus` `NATS`

[运行指南](https://github.com/Masterora/Enterprise-RAG#快速开始) · [运行时设计](https://github.com/Masterora/Enterprise-RAG/blob/HEAD/docs/agent-runtime.md) · [质量验证](https://github.com/Masterora/Enterprise-RAG/blob/HEAD/docs/quality-evaluation.md)

#### [BankPilot Agent](https://github.com/Masterora/bankpilot-agent) · 个人账单核查

将银行、微信和支付宝账单整理为统一账本，核对重复、转账与退款，用自然语言查看带交易证据的结果。

- **可核查：** 查询结果保留交易证据与运行快照。
- **职责清晰：** 模型选择工具，程序负责金额计算、用户隔离与写入校验。
- **确认后写入：** 预算变更展示前后差异，经确认后生效。

`Python` `FastAPI` `LangGraph` `React` `PostgreSQL`

[架构设计](https://github.com/Masterora/bankpilot-agent/blob/HEAD/docs/ARCHITECTURE.md) · [运行手册](https://github.com/Masterora/bankpilot-agent/blob/HEAD/docs/RUNBOOK.md) · [交付与验证](https://github.com/Masterora/bankpilot-agent/blob/HEAD/docs/CURRENT_STATE.md)

### 其他作品

| 项目 | 做什么 | 技术 |
| :--- | :--- | :--- |
| [Anti-BlameShift](https://github.com/Masterora/Anti-BlameShift) | 将设计图标注、接口说明与数据流关联起来 | React · Fastify · SQLite |
| [Vesti](https://github.com/Masterora/Vesti) | 按里程碑协作、提交交付证明与模拟托管支付；Solana devnet 路径仍属实验阶段 | TypeScript · Solana |
| [Agent Arena](https://github.com/Masterora/agent-arena) | 在模拟或加密行情中比较参数化交易策略，查看收益与风险指标 | React · FastAPI |
| [Color God](https://github.com/Masterora/Color-God) | 图片取色、色彩转换与基础颜料配比探索 | JavaScript · CSS |

### 工程关注

**后端可靠性** — 状态流转、幂等、异步任务与故障恢复。  
**Agent 可控性** — 工具权限、证据引用、运行状态与效果评估。  
**完整交付** — 从 API 和数据模型，到交互界面、运行文档与验证入口。

---

<sub>项目能力与当前验证范围见各仓库文档。欢迎通过对应项目的 Issues 交流。</sub>
