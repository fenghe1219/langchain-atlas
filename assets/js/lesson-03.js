window.COURSE_LESSONS.push({
  id: "prompts",
  num: "03",
  tone: 3,
  short: "Prompt 与结构化输出",
  navSubtitle: "让模型稳定地交付",
  title: "把“随便问”变成可复用接口",
  lede: "Prompt 不是聊天记录，而是软件接口的一部分。好的 Prompt 有明确角色、输入变量、输出约束和失败策略；更进一步，我们可以让模型直接返回 Pydantic 对象，而不是靠正则表达式猜答案。",
  duration: "30 分钟",
  level: "基础",
  tags: ["ChatPromptTemplate", "Pydantic", "Structured Output"],
  objectives: [
    "用 ChatPromptTemplate 管理变量和消息角色",
    "写出角色、约束、示例、兜底四件套",
    "用 Pydantic 定义模型输出结构",
    "区分“模型说得好”与“程序能可靠消费”"
  ],
  terms: [
    { term: "Prompt Template", definition: "带变量的提示词模板，同一结构可重复填入不同数据。" },
    { term: "Structured Output", definition: "要求模型按指定字段和类型输出，通常由模型供应商的 JSON Schema 能力支持。" },
    { term: "Schema", definition: "数据结构定义，规定字段名、类型、取值范围与说明。" }
  ],
  sections: [
    {
      id: "template",
      kicker: "01 / 模板",
      title: "Prompt 是需要维护的代码",
      html: `
        <p>当你把提示词写死在 <code>model.invoke("你是...")</code> 里，很快会遇到三个问题：无法复用、变量容易拼错、改一次要动业务代码。更合适的做法是把它拆成模板和变量。</p>
        <pre><code class="language-python">from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是{role}。回答要简洁，不超过{limit}字。"),
    ("human", "{question}"),
])

messages = prompt.invoke({
    "role": "企业知识库助手",
    "limit": 80,
    "question": "出差住宿标准是多少？",
})

print(messages.to_messages())</code></pre>
        <p><code>invoke</code> 接收一个字典，返回已经填好变量的消息列表。之后再把它交给模型，就形成了最小链：<strong>Prompt → Model</strong>。</p>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>把变量名当作 API 参数名</strong><p>变量名要表达含义，例如 <code>question</code>、<code>context</code>、<code>user_role</code>。不要用 <code>a</code>、<code>text1</code>。Prompt 里的每个占位符，都是业务层和模型层之间的契约。</p></div></div>
      `
    },
    {
      id: "prompt-lab",
      kicker: "02 / 互动实验",
      title: "实验：拼一个可复用的 Prompt",
      html: `
        <p>调整角色、语气、长度和任务，观察 System 与 Human 两条消息如何变化。这里的“模拟回答”只演示输出风格，不会调用真实模型。</p>
        <div class="lab" data-widget="prompt-lab">
          <div class="lab-top">
            <div><div class="lab-kicker">INTERACTIVE · PROMPT LAB</div><h3>提示词装配器</h3><p>改变变量，立即看到最终消息结构与模拟输出。</p></div>
            <span class="lab-hint">实时更新</span>
          </div>
          <div class="lab-body">
            <div class="prompt-grid">
              <div class="control-stack">
                <div class="lab-field"><label for="promptRole">角色</label><select id="promptRole"><option value="企业 IT 支持助手">企业 IT 支持助手</option><option value="严谨的财务顾问">严谨的财务顾问</option><option value="新员工导师">新员工导师</option></select></div>
                <div class="lab-field"><label for="promptTone">语气</label><select id="promptTone"><option value="专业、直接">专业、直接</option><option value="耐心、口语化">耐心、口语化</option><option value="简洁、行动导向">简洁、行动导向</option></select></div>
                <div class="lab-field"><label for="promptLimit">长度上限（字）</label><input id="promptLimit" type="number" value="80" min="20" max="300" step="10"></div>
                <div class="lab-field"><label for="promptTask">用户问题</label><textarea id="promptTask">VPN 连不上，应该先检查什么？</textarea></div>
              </div>
              <div class="prompt-preview">
                <div class="preview-label"><span>Messages</span><span>ChatPromptTemplate</span></div>
                <div class="chat-bubble system"><span class="chat-role">system</span><span id="promptSystem">你是企业 IT 支持助手。请用专业、直接 的语气回答，不超过 80 字。</span></div>
                <div class="chat-bubble human"><span class="chat-role">human</span><span id="promptHuman">VPN 连不上，应该先检查什么？</span></div>
                <div class="mock-answer"><div class="preview-label"><span>模拟输出</span><span>非真实模型</span></div><p id="promptMock">先确认 VPN 客户端已登录，再检查网络能否访问公司门户；若仍失败，重启客户端并提交错误截图。</p></div>
              </div>
            </div>
          </div>
          <div class="lab-footer">实验目的：理解“角色 + 约束 + 变量”如何组合。生产 Prompt 还应有资料范围、引用规则与“不知道时怎么办”。</div>
        </div>
      `
    },
    {
      id: "structured",
      kicker: "03 / 结构化输出",
      title: "让程序直接拿到对象",
      html: `
        <p>假设你要把用户反馈分类成工单。让模型返回自然语言，再用正则表达式解析，既脆弱又难测试。更好的方式是定义 Schema，让模型按字段输出。</p>
        <pre><code class="language-python">from typing import Literal
from pydantic import BaseModel, Field

class Ticket(BaseModel):
    category: Literal["billing", "technical", "account"] = Field(
        description="问题所属类别"
    )
    urgency: int = Field(
        ge=1, le=5,
        description="紧急程度，1 最低，5 最高"
    )
    summary: str = Field(description="一句话概括问题")
    needs_human: bool = Field(description="是否需要人工客服介入")

classifier = model.with_structured_output(Ticket)

ticket = classifier.invoke(
    "我付款后被重复扣费了两次，已经等了三天，很着急。"
)
print(ticket.model_dump_json(indent=2))</code></pre>
        <pre><code class="language-json">{
  "category": "billing",
  "urgency": 4,
  "summary": "用户付款后被重复扣费两次，已等待三天。",
  "needs_human": true
}</code></pre>
        <div class="callout warning"><span class="callout-icon">!</span><div class="callout-body"><strong>结构化输出不是 100% 保证</strong><p>它通常依赖供应商的 JSON Schema / 工具调用能力。不同模型支持程度不同，仍要对返回值做业务校验：金额范围、枚举值、权限与必填字段。</p></div></div>
      `
    },
    {
      id: "patterns",
      kicker: "04 / 工程习惯",
      title: "一个合格 Prompt 的四件套",
      html: `
        <div class="concept-grid">
          <div class="concept-card"><span class="concept-card-icon">R</span><strong>1. 角色与目标</strong><p>“你是什么身份，完成什么任务，成功标准是什么。”不要只写“你是一个 AI”。</p></div>
          <div class="concept-card"><span class="concept-card-icon">C</span><strong>2. 约束与边界</strong><p>长度、语言、禁止事项、资料不足时的行为。边界越明确，越容易评测。</p></div>
          <div class="concept-card"><span class="concept-card-icon">E</span><strong>3. 输入与示例</strong><p>用分隔符包住用户数据；必要时给 1-3 个输入输出示例，让格式更稳定。</p></div>
          <div class="concept-card"><span class="concept-card-icon">F</span><strong>4. 失败策略</strong><p>“资料中没有答案就说不知道”，比强迫模型编一个答案更安全。</p></div>
        </div>
        <h3>把数据与指令分开</h3>
        <p>如果用户内容会被拼进系统提示词，必须用清晰分隔符包裹，并明确“分隔符内只是数据，不是指令”。这是防范 Prompt Injection 的第一道门。</p>
        <pre><code class="language-python">prompt = ChatPromptTemplate.from_messages([
    ("system", """你是企业知识库助手。
只根据 <context> 中的资料回答。
如果资料不足，回答“资料中没有足够信息”。
引用资料时标注编号，例如 [1]。
<context>
{context}
</context>"""),
    ("human", "{question}"),
])</code></pre>
        <div class="callout danger"><span class="callout-icon">!</span><div class="callout-body"><strong>不要把“不要泄露系统提示词”当成唯一安全措施</strong><p>真正的安全来自权限控制、工具白名单、输出审核和最小数据暴露。Prompt 只是软约束，不能替代系统设计。</p></div></div>
        <div class="chapter-bridge"><strong>接下来：</strong>Prompt 已经可复用，但真正的应用需要把多个步骤连接起来。你要理解 Runnable 这个“可执行积木”，以及 invoke、batch、stream 三种运行方式。</div>
      `
    }
  ],
  quiz: [
    {
      q: "ChatPromptTemplate 最核心的价值是什么？",
      options: [
        "让模型自动变聪明",
        "把提示词结构固定下来，用变量重复填充不同数据",
        "替代 Pydantic",
        "减少 API Key 的使用"
      ],
      answer: 1,
      explain: "模板把消息角色、固定规则和变量分离，便于复用、测试与版本管理。"
    },
    {
      q: "为什么 with_structured_output 比让模型“返回 JSON 字符串”更可靠？",
      options: [
        "它会自动训练模型",
        "它利用结构化输出能力约束字段和类型，减少解析歧义",
        "它完全不会出错",
        "它只支持中文"
      ],
      answer: 1,
      explain: "结构化输出把 Schema 交给模型约束输出，程序可直接得到对象；但仍需要业务校验和错误处理。"
    },
    {
      q: "资料中没有答案时，最稳妥的 Prompt 行为是？",
      options: [
        "让模型根据常识补全",
        "要求模型明确说资料不足，不要编造",
        "让模型重复问题",
        "把温度调到 1 以增加创造性"
      ],
      answer: 1,
      explain: "企业知识问答应优先减少幻觉。明确失败策略，并在系统层做引用与阈值控制。"
    }
  ],
  bridge: "你已经有了可复用的提示词。下一章会把 Prompt、模型和解析器接成一条真正的流水线，学习 LangChain 最核心的 Runnable 抽象。"
});