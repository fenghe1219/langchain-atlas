window.COURSE_LESSONS.push({
  id: "roadmap",
  num: "10",
  tone: 5,
  short: "学习路线与自测",
  navSubtitle: "把知识变成能力",
  title: "下一步，把它真正做出来",
  lede: "看完教程不等于学会。真正的分水岭，是你能不能在不照抄的情况下设计一个小系统、解释关键取舍、定位一次失败。这一章给出 30 天路线、术语速查和综合自测。",
  duration: "25 分钟",
  level: "总结",
  tags: ["Roadmap", "Interview", "Glossary", "Next Steps"],
  objectives: [
    "用 30 天计划把知识转成项目经验",
    "用术语卡片快速复习核心概念",
    "通过综合题检查自己是否真的理解",
    "知道遇到问题时该查什么、怎么验证"
  ],
  terms: [
    { term: "Retrieval", definition: "从知识源中找相关资料的过程，重点在召回质量。" },
    { term: "Groundedness", definition: "回答是否有资料依据，而不是模型自由发挥。" },
    { term: "Agentic", definition: "由模型参与决定下一步动作的系统形态。" }
  ],
  sections: [
    {
      id: "plan",
      kicker: "01 / 30 天路线",
      title: "从看懂到做出来",
      html: `
        <p>不要同时学十个框架。用一个小项目反复迭代，比收藏 100 篇教程更有效。下面是一条适合有基础 Python 的学习者的路线。</p>
        <table class="compare-table">
          <thead><tr><th>阶段</th><th>目标</th><th>交付物</th></tr></thead>
          <tbody>
            <tr><td>第 1 周</td><td>跑通模型、消息、Prompt、结构化输出</td><td>一个命令行文本处理小工具</td></tr>
            <tr><td>第 2 周</td><td>理解 Runnable、流式、批量与错误处理</td><td>可批量处理文件并输出 JSON 的脚本</td></tr>
            <tr><td>第 3 周</td><td>完成 RAG：加载、切分、检索、引用</td><td>能回答自己文档问题的知识库</td></tr>
            <tr><td>第 4 周</td><td>加入只读工具、会话与人工审批</td><td>一个可演示的企业助手 demo</td></tr>
            <tr><td>第 5 周起</td><td>评估、观测、权限、部署</td><td>有测试、有 trace、有 README 的作品</td></tr>
          </tbody>
        </table>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>每天的最小闭环</strong><p>读 20 分钟 → 改一个能运行的小例子 → 记录一个失败点 → 用自己的话解释一次。不要只看视频。</p></div></div>
        <h3>三个可以写进作品集的项目</h3>
        <div class="concept-grid three">
          <div class="concept-card"><span class="concept-card-icon">A</span><strong>个人知识库</strong><p>导入笔记或课程 PDF，支持引用、拒答和来源跳转。</p></div>
          <div class="concept-card"><span class="concept-card-icon">B</span><strong>工单分诊助手</strong><p>分类、提取字段、建议处理人，并用固定评估集比较 Prompt。</p></div>
          <div class="concept-card"><span class="concept-card-icon">C</span><strong>安全审批 Agent</strong><p>只读工具 + 写操作审批 + LangGraph 检查点 + 审计日志。</p></div>
        </div>
      `
    },
    {
      id: "flashcards",
      kicker: "02 / 术语速查",
      title: "点一张卡片，检验记忆",
      html: `
        <p>先自己想答案，再点击卡片揭晓。能用自己的话解释，才说明真的理解。</p>
        <div class="lab" data-widget="flashcards">
          <div class="lab-top"><div><div class="lab-kicker">INTERACTIVE · FLASH CARDS</div><h3>LangChain 核心术语</h3><p>点击卡片翻面。建议遮住答案先复述。</p></div><span class="lab-hint">9 张卡</span></div>
          <div class="lab-body">
            <div class="flashcard-grid">
              <button class="flashcard" type="button"><b>Runnable</b><span>点击揭晓</span><div class="flash-answer">统一的可执行接口，支持 invoke、batch、stream。Prompt、模型、解析器都可以是 Runnable。</div></button>
              <button class="flashcard" type="button"><b>LCEL</b><span>点击揭晓</span><div class="flash-answer">用竖线组合 Runnable 的表达方式，例如 prompt | model | parser。</div></button>
              <button class="flashcard" type="button"><b>Embedding</b><span>点击揭晓</span><div class="flash-answer">把文本映射为向量，使语义相近的内容距离更近，用于检索与聚类。</div></button>
              <button class="flashcard" type="button"><b>RAG</b><span>点击揭晓</span><div class="flash-answer">先检索相关资料，再让模型基于资料生成回答，通常配合来源引用。</div></button>
              <button class="flashcard" type="button"><b>Tool Calling</b><span>点击揭晓</span><div class="flash-answer">模型返回结构化工具调用请求，应用执行后将结果回传给模型。</div></button>
              <button class="flashcard" type="button"><b>Agent</b><span>点击揭晓</span><div class="flash-answer">模型驱动“决策 → 调用工具 → 观察 → 继续”的循环，直到完成目标。</div></button>
              <button class="flashcard" type="button"><b>StateGraph</b><span>点击揭晓</span><div class="flash-answer">用状态、节点和边表达工作流，支持分支、循环、持久化与中断。</div></button>
              <button class="flashcard" type="button"><b>Checkpoint</b><span>点击揭晓</span><div class="flash-answer">某个 thread 的状态快照，用于恢复多轮对话、审批和中断后的任务。</div></button>
              <button class="flashcard" type="button"><b>Prompt Injection</b><span>点击揭晓</span><div class="flash-answer">不可信内容试图覆盖指令或诱导模型越权。防御靠权限、隔离与审批，不只靠 Prompt。</div></button>
            </div>
            <div class="flashcard-hint">复习建议：看到术语后先给出“一句话定义 + 一个使用场景 + 一个风险”。</div>
          </div>
        </div>
      `
    },
    {
      id: "interview",
      kicker: "03 / 自测",
      title: "面试与设计题：先说结论，再说取舍",
      html: `
        <h3>1. LangChain 和直接调用模型 API 的区别？</h3>
        <p>结论：直接调用更轻，LangChain 提供模型无关的抽象、消息、Prompt、检索、工具、流式和可观测性集成。取舍：小脚本直接调用；多步骤、需要替换组件或工程化时再用框架。</p>
        <h3>2. RAG 效果不好，你怎么排查？</h3>
        <p>先把检索和生成拆开：检查召回文档是否包含答案；再检查上下文顺序、Prompt 引用约束和模型输出。不能只靠改 Prompt。补充指标：Recall@k、来源命中率、忠实度、引用准确率、拒答准确率。</p>
        <h3>3. Agent 如何防止误操作？</h3>
        <p>最小权限、工具白名单、参数校验、写操作幂等、人工审批、审计与回滚。Prompt 只能作为辅助，不能作为安全边界。</p>
        <h3>4. 什么时候上 LangGraph？</h3>
        <p>出现明确分支、循环、持久化、人工中断或复杂恢复需求时。线性三步以内，直接函数或 Runnable 通常更清晰。</p>
        <h3>5. 怎么控制成本？</h3>
        <p>分层模型、限制上下文、缓存检索与回答、批处理、预算告警、按租户限流；同时用评估确认降本没有把质量降到不可接受。</p>
        <div class="callout info"><span class="callout-icon">i</span><div class="callout-body"><strong>遇到新 API 怎么办</strong><p>优先查官方文档，看当前版本的类名、参数和迁移指南；用最小代码验证；不要相信没有版本信息的二手代码。LangChain 生态迭代很快，版本意识本身就是能力。</p></div></div>
      `
    },
    {
      id: "resources",
      kicker: "04 / 继续前进",
      title: "资料在精不在多",
      html: `
        <div class="concept-grid">
          <div class="concept-card"><span class="concept-card-icon">L</span><strong>LangChain 官方文档</strong><p><a href="https://docs.langchain.com/" target="_blank" rel="noreferrer">docs.langchain.com ↗</a><br>先看 Overview 和当前版本的 Agent / RAG 指南。</p></div>
          <div class="concept-card"><span class="concept-card-icon">G</span><strong>LangGraph 文档</strong><p>重点看 StateGraph、Persistence、Human-in-the-loop，而不是一上来啃所有概念。</p></div>
          <div class="concept-card"><span class="concept-card-icon">S</span><strong>LangSmith</strong><p>用真实项目跑 trace，建立 20-50 条评估样本，再谈“优化”。</p></div>
          <div class="concept-card"><span class="concept-card-icon">P</span><strong>Python 基础</strong><p>类型标注、异常处理、异步、Pydantic、虚拟环境、测试，这些比背 API 更长期。</p></div>
        </div>
        <h3>最后一项练习</h3>
        <p>选一个你真正关心的文档集，做一个最小 RAG。要求：能引用来源、资料不足时拒答、记录失败案例、写一页 README 解释架构与取舍。做到这四点，你已经跨过了“只会跑 demo”的门槛。</p>
        <div class="chapter-bridge"><strong>你的下一步：</strong>关掉教程，打开编辑器，写一个 50 行的最小版本。学习真正发生的地方，不在阅读里，而在你第一次不得不自己调试的时候。</div>
      `
    }
  ],
  quiz: [
    {
      q: "一个 AI 应用答错了，最有效的第一步通常是什么？",
      options: [
        "立刻换更大的模型",
        "定位错误发生在检索、生成、工具还是权限层",
        "把 Prompt 写长一倍",
        "增加更多动漫头像"
      ],
      answer: 1,
      explain: "先分诊，再改。不同层的错误需要不同手段；盲换模型既慢又贵。"
    },
    {
      q: "以下哪种场景最值得使用 LangGraph，而不是简单链？",
      options: [
        "一次翻译任务",
        "单轮摘要",
        "需要人工审批、中断恢复与条件分支的退款流程",
        "固定格式的文本分类"
      ],
      answer: 2,
      explain: "分支、状态和中断恢复是 LangGraph 的核心价值。简单任务没必要增加图结构复杂度。"
    },
    {
      q: "评估 RAG 时，为什么要同时看检索和生成？",
      options: [
        "因为两者一定同时出错",
        "因为回答错误可能来自召回缺失，也可能来自生成不忠实，必须分别定位",
        "因为向量库只支持中文",
        "因为模型不会生成文本"
      ],
      answer: 1,
      explain: "端到端分数无法告诉你问题在哪一层。拆开评估才能有效优化。"
    },
    {
      q: "Agent 工具设计的第一原则是？",
      options: [
        "工具越多越好",
        "给模型最大权限以提升成功率",
        "最小权限、明确边界、可审计，写操作加确认",
        "所有工具都返回自然语言大段文本"
      ],
      answer: 2,
      explain: "模型会犯错，系统边界必须限制错误的影响范围。"
    },
    {
      q: "学习 LangChain 最靠谱的姿势是？",
      options: [
        "收藏所有教程，等看完再动手",
        "围绕一个小项目，边查官方文档边迭代，并记录失败",
        "只背 API 名称",
        "永远只用旧版代码，因为稳定"
      ],
      answer: 1,
      explain: "项目驱动 + 官方文档 + 复盘失败，比被动阅读更能形成可迁移能力。"
    }
  ],
  bridge: "教程到这里结束，但学习才刚刚开始。打开你的编辑器，把第一个最小 RAG 跑起来吧。"
});