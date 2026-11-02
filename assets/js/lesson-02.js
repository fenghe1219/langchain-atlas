window.COURSE_LESSONS.push({
  id: "models",
  num: "02",
  tone: 2,
  short: "环境与模型",
  navSubtitle: "发出第一条请求",
  title: "先学会和模型说话",
  lede: "这一章不追求功能多，只追求把最小闭环跑通：安装依赖、安全配置密钥、选择模型、发送消息、读取回答。跑通之后，后面的 Prompt、RAG 和 Agent 才有地基。",
  duration: "28 分钟",
  level: "入门",
  tags: ["ChatModel", "Messages", "API Key", "init_chat_model"],
  objectives: [
    "用虚拟环境隔离项目依赖，避免污染系统 Python",
    "安全地把 API Key 放进 .env 而不是源码",
    "理解 System、Human、AI、Tool 四类消息",
    "用 init_chat_model 在供应商之间切换"
  ],
  terms: [
    { term: "ChatModel", definition: "聊天模型接口。输入一组消息，输出新的 AI 消息。" },
    { term: "AIMessage", definition: "模型返回的消息对象，除文本外还可能包含工具调用、token 用量等元数据。" },
    { term: "OpenAI-compatible", definition: "很多模型提供兼容 OpenAI 的接口，因此可复用同一套客户端。" }
  ],
  sections: [
    {
      id: "setup",
      kicker: "01 / 准备环境",
      title: "三件东西：Python、虚拟环境、密钥",
      html: `
        <p>LangChain 1.x 需要较新的 Python。建议使用 <strong>Python 3.10 或更高版本</strong>。先为项目建立独立虚拟环境，这样不同项目的依赖不会互相打架。</p>
        <pre><code class="language-bash"># 在项目目录中执行
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

# 安装本阶段所需依赖
python -m pip install -U langchain langchain-openai langgraph python-dotenv</code></pre>
        <p>如果你习惯 <code>uv</code>，也可以使用 <code>uv add langchain langchain-openai python-dotenv</code>。工具不是重点，能稳定复现环境才是。</p>
        <div class="callout danger"><span class="callout-icon">!</span><div class="callout-body"><strong>密钥绝对不能写进源码</strong><p>不要把 <code>sk-...</code> 直接复制进 Python 文件，也不要提交到 Git。把密钥放进 <code>.env</code>，并把 <code>.env</code> 加入 <code>.gitignore</code>。</p></div></div>
        <pre><code class="language-bash"># .env
OPENAI_API_KEY=sk-your-key-here
# 如果使用 DeepSeek 等其他供应商，可另建变量
DEEPSEEK_API_KEY=your-key-here</code></pre>
        <pre><code class="language-bash"># .gitignore
.venv/
.env
__pycache__/</code></pre>
        <p>如果你暂时没有 API Key，也完全可以继续阅读和操作所有互动实验；代码可以等准备好额度后再跑。很多供应商都提供新用户试用额度，选择时优先确认模型能力、价格、数据合规和可用地区。</p>
      `
    },
    {
      id: "first-call",
      kicker: "02 / 最小闭环",
      title: "第一条经过 LangChain 的请求",
      html: `
        <p>现代写法通常从 <code>init_chat_model</code> 开始。它用统一的聊天模型接口屏蔽不同供应商的初始化差异。下面的 <code>openai:gpt-5-mini</code> 只是示例，你可以替换成自己账号可用的模型名。</p>
        <pre><code class="language-python">from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

load_dotenv()  # 从 .env 读取 OPENAI_API_KEY

model = init_chat_model(
    "openai:gpt-5-mini",
    temperature=0.2,
)

response = model.invoke("用一句话解释什么是 RAG。")
print(response.text)
print(response.usage_metadata)  # token 用量，部分供应商可能为空</code></pre>
        <div class="code-output"><strong>可能的输出：</strong>RAG 是先检索外部资料，再让模型基于这些资料生成回答的技术。<br>输入、输出 token 数量会随供应商和版本返回。</div>
        <h3>换成 OpenAI 兼容接口</h3>
        <p>国内很多模型服务提供 OpenAI 兼容 API。此时可以直接使用 <code>ChatOpenAI</code>，把 <code>base_url</code> 和模型名改成供应商文档给出的值。注意：<strong>协议兼容不等于行为完全一致</strong>，工具调用、结构化输出和流式事件仍可能有差异。</p>
        <pre><code class="language-python">import os
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model="deepseek-chat",                         # 以供应商文档为准
    base_url="https://api.deepseek.com/v1",        # 示例地址
    api_key=os.environ["DEEPSEEK_API_KEY"],
    temperature=0.2,
)</code></pre>
        <div class="callout warning"><span class="callout-icon">!</span><div class="callout-body"><strong>不要同时抄三种初始化方式</strong><p>OpenAI 官方模型优先用 <code>init_chat_model("openai:...")</code>；兼容接口可用 <code>ChatOpenAI</code> + <code>base_url</code>；特定供应商也可能有独立包。选一种，读对应文档。</p></div></div>
      `
    },
    {
      id: "messages",
      kicker: "03 / 消息系统",
      title: "聊天不是一段字符串，而是一组角色消息",
      html: `
        <p>调用聊天模型时，你提交的是一个<strong>消息列表</strong>。每条消息有角色和内容，模型根据整个列表理解上下文。把消息对象化，比用字符串拼接更清晰，也方便后续加入检索资料和工具结果。</p>
        <div class="concept-grid">
          <div class="concept-card"><span class="concept-card-icon">S</span><strong>SystemMessage · 系统</strong><p>最高层规则：你是谁、能做什么、不能做什么。适合放角色与安全边界。</p></div>
          <div class="concept-card"><span class="concept-card-icon">H</span><strong>HumanMessage · 用户</strong><p>用户这一轮说的话、上传的问题或指令。</p></div>
          <div class="concept-card"><span class="concept-card-icon">A</span><strong>AIMessage · 模型</strong><p>模型上一轮的回答，也可能携带 tool_calls。</p></div>
          <div class="concept-card"><span class="concept-card-icon">T</span><strong>ToolMessage · 工具</strong><p>工具执行结果。Agent 会把它放回消息列表继续推理。</p></div>
        </div>
        <pre><code class="language-python">from langchain_core.messages import SystemMessage, HumanMessage

messages = [
    SystemMessage(content="你是企业 IT 支持助手，回答不超过 80 字。"),
    HumanMessage(content="VPN 连不上，应该先检查什么？"),
]

response = model.invoke(messages)
print(response.text)</code></pre>
        <div class="flow-row">
          <div class="flow-step"><b>System</b><span>角色、规则、边界</span></div>
          <div class="flow-step"><b>History</b><span>之前的多轮对话</span></div>
          <div class="flow-step"><b>User</b><span>本轮任务</span></div>
          <div class="flow-step"><b>Model</b><span>生成 AI 消息</span></div>
        </div>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>为什么这里不记历史？</strong><p>ChatModel 本身是无状态的。每次调用都要显式把历史消息传进去。后面我们会用 Agent + checkpointer 或 LangGraph 持久化，自动维护会话状态。</p></div></div>
      `
    },
    {
      id: "troubleshooting",
      kicker: "04 / 排错",
      title: "第一次跑不起来？先查这四类问题",
      html: `
        <table class="compare-table">
          <thead><tr><th>现象</th><th>常见原因</th><th>怎么处理</th></tr></thead>
          <tbody>
            <tr><td>401 / Unauthorized</td><td>Key 缺失、写错或未加载</td><td>确认 <code>load_dotenv()</code> 在创建模型前执行；检查变量名</td></tr>
            <tr><td>404 / model not found</td><td>模型名或 base_url 不匹配</td><td>用供应商文档给出的模型 ID 和完整接口地址</td></tr>
            <tr><td>ModuleNotFoundError</td><td>只装了 langchain，没装对应集成包</td><td>OpenAI 需 <code>langchain-openai</code>；在虚拟环境中重装</td></tr>
            <tr><td>429 / rate limit</td><td>请求过快或额度用尽</td><td>降低并发、增加重试与退避，检查账户额度</td></tr>
          </tbody>
        </table>
        <h3>一个最小的排错顺序</h3>
        <ol>
          <li>确认当前终端确实处于虚拟环境。</li>
          <li>确认环境变量存在，但<strong>不要打印完整密钥</strong>。</li>
          <li>先用一个最短 Prompt 测试模型名和网络。</li>
          <li>再逐项加入 Prompt、检索或工具，定位是哪一层失败。</li>
        </ol>
        <div class="callout info"><span class="callout-icon">i</span><div class="callout-body"><strong>把“模型调用”当成一个普通外部服务</strong><p>它可能超时、限流、返回格式异常。生产代码要设置超时、重试和降级，不要把网络请求当成不会失败的函数。</p></div></div>
      `
    }
  ],
  quiz: [
    {
      q: "为什么推荐把 API Key 放在 .env 文件里？",
      options: [
        "因为 .env 让模型回答更快",
        "因为它便于本地加载，并能通过 .gitignore 避免密钥进入版本库",
        "因为环境变量会自动加密所有内容",
        "因为 LangChain 只支持 .env"
      ],
      answer: 1,
      explain: "环境变量本身不是加密。真正的关键是：密钥不写进源代码、不提交到 Git，并通过部署平台的安全配置注入。"
    },
    {
      q: "ChatModel 默认会记住上一轮对话吗？",
      options: [
        "会，自动保存 30 天",
        "会，只要使用同一个模型对象",
        "不会，历史消息需要应用显式传入或由持久化机制管理",
        "取决于 API Key 的类型"
      ],
      answer: 2,
      explain: "模型调用是无状态的。多轮对话需要把历史消息一起发送，或使用 Agent/Graph 的 checkpointer 管理状态。"
    },
    {
      q: "使用 OpenAI 兼容接口时，最关键的是确认什么？",
      options: [
        "模型名、base_url 和认证方式与供应商文档一致",
        "模型一定支持 Agent 和所有工具调用",
        "temperature 必须设成 1",
        "必须安装所有 LangChain 集成包"
      ],
      answer: 0,
      explain: "兼容接口首先要把地址、模型 ID、密钥对应正确。工具调用、结构化输出等高级能力仍需逐项验证。"
    }
  ],
  bridge: "你已经能让模型回答问题。下一章的难点不是“怎么问”，而是“怎么稳定地、可复用地问”，并让模型返回程序能直接使用的结构化数据。"
});