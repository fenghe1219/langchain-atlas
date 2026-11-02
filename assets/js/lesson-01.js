window.COURSE_LESSONS.push({
  id: "landscape",
  num: "01",
  tone: 1,
  short: "全景认知",
  navSubtitle: "先建立正确心智模型",
  title: "LangChain 到底在解决什么问题？",
  lede: "很多初学者一上来就背 API，结果写了几百行代码，却说不清每个组件为什么存在。这一章先不急着写代码，而是把整张地图铺开：模型、Prompt、检索、工具、状态和可观测性分别负责什么。",
  duration: "22 分钟",
  level: "零基础",
  tags: ["LangChain 1.x", "生态地图", "心智模型"],
  objectives: [
    "用一句话说清 LangChain、LangGraph、LangSmith 的区别",
    "画出一次普通 AI 请求的完整数据流",
    "判断一个需求应该用普通调用、RAG 还是 Agent",
    "避开网上常见的 LangChain 0.x 旧写法"
  ],
  terms: [
    { term: "LLM", definition: "大语言模型。负责理解与生成文本，但不自带你的业务数据。" },
    { term: "Orchestration", definition: "编排：把模型、数据、工具和业务规则连接成可运行流程。" },
    { term: "Agent", definition: "会自主决定下一步动作的模型驱动循环，不只是返回一段文字。" }
  ],
  sections: [
    {
      id: "mental-model",
      kicker: "01 / 心智模型",
      title: "它不是模型，而是模型周边的一切",
      html: `
        <p>先记住一句话：<strong>LLM 是发动机，LangChain 更像底盘、传动系统和仪表盘。</strong>模型负责“理解和生成”，但一个能上线的人工智能应用还必须处理提示词、私有数据、工具调用、对话状态、错误重试、权限和日志。LangChain 的价值，是把这些通用能力变成可组合的积木。</p>
        <div class="concept-grid three">
          <div class="concept-card"><span class="concept-card-icon">M</span><strong>Model · 模型</strong><p>接收消息，生成回答。它不知道你公司的制度，也不会主动查数据库。</p></div>
          <div class="concept-card"><span class="concept-card-icon">P</span><strong>Prompt · 提示</strong><p>告诉模型角色、任务、约束和上下文。Prompt 是接口，不是随便聊天。</p></div>
          <div class="concept-card"><span class="concept-card-icon">R</span><strong>Retriever · 检索</strong><p>从你的知识库里找出相关资料，让模型基于事实回答。</p></div>
          <div class="concept-card"><span class="concept-card-icon">T</span><strong>Tool · 工具</strong><p>查订单、发邮件、算价格。让模型能“做事”，而不只是“说话”。</p></div>
          <div class="concept-card"><span class="concept-card-icon">S</span><strong>State · 状态</strong><p>记住对话历史、任务进度和中间结果，支撑多轮与长流程。</p></div>
          <div class="concept-card"><span class="concept-card-icon">O</span><strong>Observability · 观测</strong><p>看到每一步输入输出、耗时和成本，出了问题能定位。</p></div>
        </div>
        <h3>一次请求，实际经历了什么？</h3>
        <div class="flow-row">
          <div class="flow-step"><b>用户输入</b><span>问题、文件或按钮事件</span></div>
          <div class="flow-step"><b>组装上下文</b><span>系统规则 + 历史 + 检索资料</span></div>
          <div class="flow-step"><b>模型推理</b><span>生成文本或工具调用请求</span></div>
          <div class="flow-step"><b>执行 / 解析</b><span>调用工具、校验结构化结果</span></div>
          <div class="flow-step"><b>返回应用</b><span>展示、引用、记录与评估</span></div>
        </div>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>一个很好用的类比</strong><p>直接用模型 API 像买了一个发动机自己焊车；LangChain 提供的不是“更聪明的发动机”，而是标准化的方向盘、油箱、仪表和接口。</p></div></div>
      `
    },
    {
      id: "ecosystem",
      kicker: "02 / 生态地图",
      title: "2026 年的四个关键词",
      html: `
        <p>搜索 LangChain 教程时，你会同时看到 LangChain、LangGraph、LangSmith 和大量 Integration 包。它们不是互相替代，而是分工不同。</p>
        <table class="compare-table">
          <thead><tr><th>名字</th><th>主要负责</th><th>你什么时候会用到</th></tr></thead>
          <tbody>
            <tr><td>LangChain</td><td>模型、Prompt、工具、Retriever 与应用编排；提供 <code>create_agent</code> 等高层入口</td><td>搭建绝大多数对话、RAG 与工具型应用</td></tr>
            <tr><td>LangGraph</td><td>有状态图、循环、分支、持久化和人工审批</td><td>流程复杂、需要断点续跑或严格控制时</td></tr>
            <tr><td>LangSmith</td><td>链路追踪、评估、数据集与线上监控</td><td>调试 Agent、比较提示词、上线后看效果</td></tr>
            <tr><td>Integrations</td><td>连接不同模型、数据库、向量库和文档格式</td><td>替换供应商或接入企业已有系统</td></tr>
          </tbody>
        </table>
        <div class="callout warning"><span class="callout-icon">!</span><div class="callout-body"><strong>版本提醒：别照抄 0.x 旧教程</strong><p>如果你看到 <code>LLMChain</code>、<code>initialize_agent</code>、<code>ConversationBufferMemory</code> 这类写法，它们大多属于旧版心智模型。现代 LangChain 1.x 更推荐 <code>ChatPromptTemplate</code>、Runnable、<code>create_agent</code> 与 LangGraph 的持久化状态。具体小版本 API 可能变化，以官方文档为准。</p></div></div>
        <div class="split-panel">
          <div class="bad"><strong>旧思路：</strong><p>把所有逻辑塞进一个巨大的 Prompt，再用字符串拼接控制流程。短期能跑，长期不可维护。</p></div>
          <div class="good"><strong>新思路：</strong><p>把模型、检索、工具和状态拆成明确组件，用可测试的流程连接起来。</p></div>
        </div>
      `
    },
    {
      id: "arch-lab",
      kicker: "03 / 互动实验",
      title: "实验：装配一个 AI 应用",
      html: `
        <p>下面这个“装配台”不调用真实模型，但会实时展示你选择的组件如何改变应用形态。先只保留最基础的模型和提示词，再逐个打开检索、工具、记忆和护栏，观察应用从“聊天机器人”变成什么。</p>
        <div class="lab" data-widget="arch-lab">
          <div class="lab-top">
            <div><div class="lab-kicker">INTERACTIVE · ARCHITECTURE</div><h3>AI 应用装配台</h3><p>点击组件加入或移除。观察右侧请求链路和底部的能力判断。</p></div>
            <span class="lab-hint">无需联网</span>
          </div>
          <div class="lab-body">
            <div class="arch-layout">
              <div class="arch-picker" id="archPicker">
                <button class="arch-option is-on" data-part="prompt" data-lock="true"><span class="arch-option-mark">P</span><span><strong>Prompt 提示词</strong><span>定义角色与任务 · 基础</span></span></button>
                <button class="arch-option is-on" data-part="model" data-lock="true"><span class="arch-option-mark">M</span><span><strong>ChatModel 模型</strong><span>理解与生成 · 基础</span></span></button>
                <button class="arch-option" data-part="retriever"><span class="arch-option-mark">R</span><span><strong>Retriever 检索</strong><span>接入私有知识库</span></span></button>
                <button class="arch-option" data-part="tools"><span class="arch-option-mark">T</span><span><strong>Tools 工具</strong><span>查询或执行动作</span></span></button>
                <button class="arch-option" data-part="memory"><span class="arch-option-mark">S</span><span><strong>Memory 状态</strong><span>记住多轮上下文</span></span></button>
                <button class="arch-option" data-part="guard"><span class="arch-option-mark">G</span><span><strong>Guardrails 护栏</strong><span>权限、审核与兜底</span></span></button>
              </div>
              <div class="arch-preview">
                <div class="arch-request">用户请求 · “我们今年的差旅标准是什么？”</div>
                <div class="arch-flow" id="archFlow"></div>
                <div class="arch-response" id="archResponse">给出一段回答</div>
              </div>
            </div>
            <div class="arch-verdict" id="archVerdict"><span class="arch-verdict-mark">i</span><span><strong>基础对话。</strong>模型只能依靠训练知识和本次提示词回答，无法保证企业内部事实。</span></div>
          </div>
          <div class="lab-footer">小提示：组件不是越多越好。每增加一个组件，都会增加延迟、成本或故障面。</div>
        </div>
      `
    },
    {
      id: "patterns",
      kicker: "04 / 应用形态",
      title: "普通调用、RAG、Agent：怎么选？",
      html: `
        <p>不是所有需求都需要 Agent。越简单的结构越稳定、越便宜、越容易评估。通常按下面的顺序做减法：能用普通调用解决，就别上检索；能用固定检索流程解决，就别让模型自由决策。</p>
        <div class="concept-grid three">
          <div class="concept-card"><span class="concept-card-icon">1</span><strong>普通模型调用</strong><p>翻译、改写、分类、摘要。输入输出明确，靠 Prompt 就能完成。</p></div>
          <div class="concept-card"><span class="concept-card-icon">2</span><strong>RAG 检索增强</strong><p>企业制度、产品文档、客服知识库。需要事实依据与来源引用。</p></div>
          <div class="concept-card"><span class="concept-card-icon">3</span><strong>Tool Agent</strong><p>查订单、改地址、发起退款。需要模型选择一个或多个动作。</p></div>
        </div>
        <table class="compare-table">
          <thead><tr><th>问题特征</th><th>推荐结构</th><th>原因</th></tr></thead>
          <tbody>
            <tr><td>答案只取决于本次输入</td><td>Prompt → Model</td><td>链路短，最容易测试和控成本</td></tr>
            <tr><td>答案取决于公司私有资料</td><td>Retriever → Prompt → Model</td><td>让模型基于检索到的事实回答</td></tr>
            <tr><td>需要执行动作或按结果继续</td><td>Agent / LangGraph</td><td>模型需要观察工具结果并决定下一步</td></tr>
            <tr><td>涉及退款、发布、删除等高风险动作</td><td>Graph + 人工审批</td><td>需要明确状态、权限和中断点</td></tr>
          </tbody>
        </table>
        <h3>本教程怎么带你走</h3>
        <div class="flow-row">
          <div class="flow-step"><b>会调用</b><span>模型 + 消息</span></div>
          <div class="flow-step"><b>会组装</b><span>Prompt + Runnable</span></div>
          <div class="flow-step"><b>会查资料</b><span>RAG 知识库</span></div>
          <div class="flow-step"><b>会做事</b><span>Tools + Agent</span></div>
          <div class="flow-step"><b>能上线</b><span>Graph + 评测</span></div>
        </div>
        <div class="chapter-bridge"><strong>接下来：</strong>先把环境搭好，亲手发出第一条真正经过 LangChain 的模型请求。你会看到“消息”为什么比单纯字符串更适合聊天应用。</div>
      `
    }
  ],
  quiz: [
    {
      q: "下面哪句话最准确地描述 LangChain？",
      options: [
        "一个训练大语言模型的框架",
        "连接模型、数据、工具与流程的应用编排框架",
        "一个只能用于 OpenAI 模型的 SDK",
        "一个向量数据库"
      ],
      answer: 1,
      explain: "LangChain 不训练模型，也不是单一供应商 SDK。它的核心价值是编排模型周边能力，并允许替换集成组件。"
    },
    {
      q: "用户问“我们公司 2026 年的年假政策是什么”，最合适的第一版方案是？",
      options: [
        "直接问模型，因为模型什么都知道",
        "把制度文档放进提示词，每次全量发送",
        "用 RAG 检索制度片段，再让模型带引用回答",
        "训练一个全新的基础大模型"
      ],
      answer: 2,
      explain: "私有且需要准确来源的知识，最适合 RAG。直接问模型会幻觉，全量塞提示词则成本高且容易超出上下文。"
    },
    {
      q: "看到教程使用 initialize_agent，你应该怎么判断？",
      options: [
        "一定是 2026 年最新写法",
        "它可能是 LangChain 0.x 旧教程，应优先查看现代 create_agent 与官方文档",
        "所有 Agent 都必须这样写",
        "只要代码能跑就不用管版本"
      ],
      answer: 1,
      explain: "initialize_agent 属于旧式 Agent 入口。现代教程通常使用 create_agent 或 LangGraph 构建可组合、可观测的 Agent。"
    }
  ],
  bridge: "你已经有了地图。下一章开始动手：创建虚拟环境、配置密钥，并用现代 LangChain 写法完成第一条模型调用。"
});