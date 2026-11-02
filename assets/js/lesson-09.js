window.COURSE_LESSONS.push({
  id: "project",
  num: "09",
  tone: 4,
  short: "企业实战项目",
  navSubtitle: "把积木拼成产品",
  title: "做一个企业知识助手",
  lede: "项目不是把教程代码复制到一起，而是做出清晰的边界：什么交给模型、什么必须由代码控制、什么必须让人确认。这一章用“制度问答 + 订单查询 + 退款审批”把 RAG、Agent 与 LangGraph 串起来。",
  duration: "55 分钟",
  level: "项目",
  tags: ["Capstone", "RAG", "Agent", "FastAPI"],
  objectives: [
    "设计一个可落地的企业 AI 应用架构",
    "把 RAG 和只读工具接入 create_agent",
    "把高风险退款动作放进人工审批流程",
    "用验收标准而不是“能跑”判断项目完成"
  ],
  terms: [
    { term: "Capstone", definition: "综合项目，用来验证你能否把多个知识点组合成完整系统。" },
    { term: "Thread", definition: "一条独立会话或任务的状态线，用 thread_id 标识。" },
    { term: "Acceptance Criteria", definition: "验收标准，用可观察的行为判断功能是否真正完成。" }
  ],
  sections: [
    {
      id: "scenario",
      kicker: "01 / 场景",
      title: "一个真实但不过度复杂的业务",
      html: `
        <p>假设你在一家 300 人的公司做内部 AI 助手。员工可以问制度、查自己的订单、发起退款。系统必须做到：答案有来源、工具只读时有权限、退款必须人工审批、每一步可追踪。</p>
        <div class="concept-grid three">
          <div class="concept-card"><span class="concept-card-icon">1</span><strong>制度问答</strong><p>从 HR / IT / 财务文档检索，回答必须带引用；资料不足要拒答。</p></div>
          <div class="concept-card"><span class="concept-card-icon">2</span><strong>订单查询</strong><p>只允许查询当前用户自己的订单；工具参数有订单号。</p></div>
          <div class="concept-card"><span class="concept-card-icon">3</span><strong>退款申请</strong><p>创建待审批请求，不直接扣款；人工批准后才执行。</p></div>
        </div>
        <h3>推荐架构</h3>
        <div class="flow-row">
          <div class="flow-step"><b>Web / IM</b><span>用户界面与登录</span></div>
          <div class="flow-step"><b>API 层</b><span>鉴权、限流、审计</span></div>
          <div class="flow-step"><b>Agent</b><span>工具选择与对话</span></div>
          <div class="flow-step"><b>RAG + Tools</b><span>知识库与业务系统</span></div>
          <div class="flow-step"><b>Approval</b><span>高风险动作中断</span></div>
        </div>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>先做只读版本</strong><p>第一版只允许查询与解释，不允许修改真实业务状态。等评估、权限和审计跑通后，再逐步开放写操作。</p></div></div>
      `
    },
    {
      id: "structure",
      kicker: "02 / 结构",
      title: "项目目录建议",
      html: `
        <pre><code class="language-text">enterprise-assistant/
├─ .env
├─ .gitignore
├─ pyproject.toml
├─ data/
│  └─ handbook.md
├─ app/
│  ├─ __init__.py
│  ├─ config.py          # 模型、环境变量
│  ├─ rag.py             # 加载、切分、检索
│  ├─ tools.py           # 只读业务工具
│  ├─ agent.py           # create_agent
│  ├─ graph.py           # 退款审批图（可选）
│  └─ cli.py             # 本地演示入口
└─ tests/
   ├─ test_prompts.py
   ├─ test_tools.py
   └─ test_acceptance.py</code></pre>
        <p>把 Prompt、模型、工具、图分开，是为了让每一块都能独立测试。一个 500 行的 <code>main.py</code> 看起来很快，但几乎无法定位“是检索错了、模型错了，还是工具权限错了”。</p>
        <div class="callout info"><span class="callout-icon">i</span><div class="callout-body"><strong>Prompt 也要版本化</strong><p>可以把 Prompt 放到单独模块或模板文件，记录版本号。线上 trace 要能对应到当时的 Prompt 版本，否则评估结果无法复现。</p></div></div>
      `
    },
    {
      id: "code",
      kicker: "03 / 核心代码",
      title: "只读助手：RAG + 工具 + 会话",
      html: `
        <p>下面是一个精简版入口。它把制度检索和订单查询做成工具，交给 Agent 选择；退款不直接开放成自动工具，而是在后续用审批图处理。</p>
        <pre><code class="language-python">from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver

from app.rag import retriever, format_docs
from app.tools import get_order_status_for_user

load_dotenv()
model = init_chat_model("openai:gpt-5-mini", temperature=0.1)

@tool
def search_handbook(query: str) -> str:
    """检索公司制度、HR、IT 与财务知识库。回答制度问题时优先调用。"""
    docs = retriever.invoke(query)
    if not docs:
        return "未检索到相关资料。"
    return format_docs(docs)

@tool
def get_my_order_status(order_id: str) -> str:
    """查询当前登录用户自己的订单状态，不用于退款、改地址或价格咨询。"""
    # 真实实现必须从运行上下文拿到 user_id 并校验归属
    return get_order_status_for_user(order_id)

agent = create_agent(
    model=model,
    tools=[search_handbook, get_my_order_status],
    system_prompt="""你是公司内部助手。
1. 制度问题先检索知识库，只依据检索结果回答。
2. 资料不足时明确说“资料中没有足够信息”，不要编造。
3. 引用资料编号，例如 [1]。
4. 订单工具只能查询当前用户自己的订单。
5. 退款、删除、发布等高风险请求，说明需要人工审批，不要声称已经执行。""",
    checkpointer=InMemorySaver(),
)</code></pre>
        <pre><code class="language-python">config = {"configurable": {"thread_id": "employee-42-demo"}}

def chat_once(user_text: str) -> str:
    result = agent.invoke(
        {"messages": [{"role": "user", "content": user_text}]},
        config=config,
    )
    return result["messages"][-1].text

print(chat_once("在上海出差住宿能报销多少？"))
print(chat_once("我的订单 A1024 到哪了？"))</code></pre>
        <div class="callout warning"><span class="callout-icon">!</span><div class="callout-body"><strong>示例中的用户身份是简化的</strong><p>生产环境不能把 user_id 写在全局变量里。应从认证后的请求上下文注入，并在工具内部校验订单归属、租户和权限。</p></div></div>
      `
    },
    {
      id: "approval",
      kicker: "04 / 审批",
      title: "把退款交给可控流程",
      html: `
        <p>退款不是“让模型调用一个 refund 函数”就完了。正确流程是：创建退款申请 → 校验订单与金额 → 中断等待人工审批 → 批准后执行 → 记录审计。LangGraph 的 checkpointer 让审批可以跨请求、跨小时继续。</p>
        <pre><code class="language-python">from langgraph.types import interrupt, Command

def request_refund(state):
    # 只创建申请，不直接退款
    return {
        "refund_request": {
            "order_id": state["order_id"],
            "amount": state["amount"],
            "status": "pending",
        }
    }

def approval_gate(state):
    decision = interrupt({
        "type": "refund_approval",
        "order_id": state["order_id"],
        "amount": state["amount"],
    })
    if decision == "approve":
        return {"approval": "approved"}
    return {"approval": "rejected"}

def execute_refund(state):
    if state["approval"] != "approved":
        return {"result": "已取消，未执行退款"}
    # 调用支付系统；必须使用幂等键
    return {"result": "退款已提交，预计 3-5 个工作日到账"}</code></pre>
        <p>这里的关键不是 API 名称，而是职责分离：<strong>模型可以提出申请，但不能独自完成不可逆动作。</strong>审批人、权限、金额阈值和审计日志都属于业务系统。</p>
        <div class="callout danger"><span class="callout-icon">!</span><div class="callout-body"><strong>示例金额与订单必须由可信系统校验</strong><p>不要让模型自己填写退款金额。金额和归属应来自数据库，模型只负责理解用户意图与选择流程。</p></div></div>
      `
    },
    {
      id: "acceptance",
      kicker: "05 / 验收",
      title: "怎样算真正完成？",
      html: `
        <p>“能跑一次”不算完成。下面这些验收标准能帮你把项目从玩具变成可维护作品。</p>
        <table class="compare-table">
          <thead><tr><th>验收项</th><th>可观察行为</th></tr></thead>
          <tbody>
            <tr><td>制度问答</td><td>10 个固定问题中，正确引用来源且不编造；资料不足时明确拒答</td></tr>
            <tr><td>权限隔离</td><td>用户 A 无法查询用户 B 的订单；越权请求被审计并拒绝</td></tr>
            <tr><td>工具调用</td><td>缺少订单号时先追问；不把物流状态猜成答案</td></tr>
            <tr><td>退款审批</td><td>申请后暂停，未批准前不会调用支付系统；批准后才执行</td></tr>
            <tr><td>可观测性</td><td>每个请求可看到 trace、耗时、token、检索来源与工具参数</td></tr>
            <tr><td>异常处理</td><td>模型超时、检索为空、工具报错时有明确提示与降级</td></tr>
            <tr><td>回归测试</td><td>修改 Prompt 或模型后，自动跑固定评估集并比较结果</td></tr>
          </tbody>
        </table>
        <h3>推荐扩展顺序</h3>
        <ol>
          <li>把内存向量库换成持久化向量库，并加入文档版本与权限过滤。</li>
          <li>增加混合检索与重排，记录召回率。</li>
          <li>把 CLI 换成 FastAPI，增加登录、限流、审计和流式响应。</li>
          <li>接入 LangSmith，建立评估集与回归流程。</li>
          <li>再加入 LangGraph 审批、通知和任务恢复。</li>
        </ol>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>作品集怎么写</strong><p>不要只写“使用 LangChain 做了客服”。写清楚问题、架构、关键取舍、评估结果、失败案例和安全设计。能解释为什么这样做，比堆技术名词更有说服力。</p></div></div>
        <div class="chapter-bridge"><strong>最后：</strong>用一张 30 天学习路线、术语卡片和自测题，把知识变成你自己的。</div>
      `
    }
  ],
  quiz: [
    {
      q: "为什么第一版企业助手应优先做只读能力？",
      options: [
        "因为只读更酷",
        "因为它能先验证检索、权限、评估与可观测性，再逐步开放高风险写操作",
        "因为模型不能调用任何工具",
        "因为写操作不需要日志"
      ],
      answer: 1,
      explain: "先控制风险面，验证基础能力，再逐步扩大权限，是更稳妥的工程路径。"
    },
    {
      q: "退款金额应该由谁决定？",
      options: [
        "模型根据用户描述自由填写",
        "从可信业务系统读取并由代码校验",
        "由前端传给模型即可",
        "随机生成"
      ],
      answer: 1,
      explain: "金额、订单归属和可退状态属于可信业务数据，不能让模型凭空生成或篡改。"
    },
    {
      q: "验收“引用可靠”最合适的检查是？",
      options: [
        "回答长度是否超过 100 字",
        "答案中的引用能否对应到真实文档 ID、版本和段落",
        "模型是否使用了感叹号",
        "是否每次都能联网"
      ],
      answer: 1,
      explain: "引用必须可追溯、可验证，而不是只在文本里写一个数字。"
    }
  ],
  bridge: "项目已经成型。最后一章给你一条持续学习路线、术语速查和一套综合自测，帮助你把这次学习变成长期能力。"
});