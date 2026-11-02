window.COURSE_LESSONS.push({
  id: "agents",
  num: "06",
  tone: 1,
  short: "Tools 与 Agent",
  navSubtitle: "让模型开始做事",
  title: "从“会回答”到“会行动”",
  lede: "工具让模型能查真实数据、执行动作；Agent 则把“决定调用哪个工具、观察结果、再决定下一步”变成一个循环。能力越强，边界越重要。这一章会同时学习 Agent 的威力和它的风险。",
  duration: "34 分钟",
  level: "进阶",
  tags: ["Tool Calling", "create_agent", "Agent Loop", "Safety"],
  objectives: [
    "用 @tool 定义带类型和说明的工具",
    "理解 Agent 的 推理 → 调用 → 观察 循环",
    "用 create_agent 构建带会话状态的客服助手",
    "区分只读工具与有副作用工具的安全策略"
  ],
  terms: [
    { term: "Tool Calling", definition: "模型返回结构化调用请求，由应用执行函数并把结果交还模型。" },
    { term: "Agent Loop", definition: "模型决策、工具执行、结果观察、继续或结束的循环。" },
    { term: "Side Effect", definition: "会改变外部状态的动作，例如扣款、发邮件、删除记录。" }
  ],
  sections: [
    {
      id: "tool-anatomy",
      kicker: "01 / 工具",
      title: "工具是一份给模型看的说明书",
      html: `
        <p>工具不是“把函数注册进去”这么简单。模型需要知道工具叫什么、做什么、参数是什么、什么时候不该用。函数名、类型标注和 docstring 会共同构成模型看到的工具描述，所以它们应该像 API 文档一样写清楚。</p>
        <pre><code class="language-python">from langchain.tools import tool

@tool
def get_order_status(order_id: str) -> str:
    """根据订单号查询物流状态。

    仅在用户明确提供订单号，且询问物流或订单状态时调用。
    不适用于退款、改地址或价格咨询。
    """
    # 示例：真实项目请查询数据库并做鉴权
    orders = {
        "A1024": "已发货，预计 11 月 5 日送达",
        "B2048": "待出库，预计 24 小时内发货",
    }
    return orders.get(order_id.upper(), "未找到该订单，请核对订单号。")</code></pre>
        <div class="concept-grid three">
          <div class="concept-card"><span class="concept-card-icon">N</span><strong>名称</strong><p>动词开头、语义明确，例如 search_handbook、get_order_status。</p></div>
          <div class="concept-card"><span class="concept-card-icon">S</span><strong>Schema</strong><p>参数类型和必填项来自函数签名，越明确越不容易被乱传。</p></div>
          <div class="concept-card"><span class="concept-card-icon">D</span><strong>描述</strong><p>说明适用场景、边界和返回什么。这是模型选择工具的关键依据。</p></div>
        </div>
        <div class="callout warning"><span class="callout-icon">!</span><div class="callout-body"><strong>不要返回一大段未经验证的外部文本</strong><p>如果工具读取网页或第三方消息，内容里可能包含恶意指令。工具应返回结构化、可校验的数据，并明确标记为“数据”而非“指令”。</p></div></div>
      `
    },
    {
      id: "agent-loop",
      kicker: "02 / 决策循环",
      title: "Agent 到底在循环什么？",
      html: `
        <p>普通链是固定路线：A → B → C。Agent 是“看情况走”的循环：模型先判断是否需要工具；需要就返回工具调用，应用执行后把结果作为 ToolMessage 交还；模型再判断下一步，直到给出最终回答。</p>
        <div class="flow-row">
          <div class="flow-step"><b>1. 观察</b><span>读取用户与上下文</span></div>
          <div class="flow-step"><b>2. 决策</b><span>回答还是调用工具</span></div>
          <div class="flow-step"><b>3. 调用</b><span>执行受控工具</span></div>
          <div class="flow-step"><b>4. 观察结果</b><span>ToolMessage 回传</span></div>
          <div class="flow-step"><b>5. 继续 / 结束</b><span>直到满足条件</span></div>
        </div>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>Agent 不是“更聪明的模型”</strong><p>它只是模型驱动的工作流。真正可靠的是工具设计、状态管理、循环上限、权限与人工审核，而不是让 Prompt 多写几句“请仔细思考”。</p></div></div>
      `
    },
    {
      id: "agent-lab",
      kicker: "03 / 互动实验",
      title: "实验：跟踪一次工具调用",
      html: `
        <p>选择任务，点击运行，观察 Agent 的推理、工具调用和结果。退款场景会触发人工审批：这不是演示瑕疵，而是生产系统必须具备的中断点。</p>
        <div class="lab" data-widget="agent-lab">
          <div class="lab-top">
            <div><div class="lab-kicker">INTERACTIVE · AGENT TRACE</div><h3>Agent 决策轨迹</h3><p>本地脚本模拟。真实模型会生成 tool_calls，应用负责执行和回传。</p></div>
            <span class="lab-hint">安全演示</span>
          </div>
          <div class="lab-body">
            <div class="agent-scenarios" id="agentScenarios">
              <button class="agent-scenario is-active" type="button" data-scenario="order"><b>查询订单</b><span>我的订单 A1024 到哪了？</span></button>
              <button class="agent-scenario" type="button" data-scenario="refund"><b>申请退款</b><span>订单 A1024 我要退款</span></button>
              <button class="agent-scenario" type="button" data-scenario="policy"><b>制度问答</b><span>公司差旅住宿标准？</span></button>
            </div>
            <div class="agent-trace" id="agentTrace"><div class="trace-step is-thought"><span class="trace-mark">1</span><div class="trace-copy"><strong>等待运行</strong><p>选择任务后点击下方按钮，观察 Agent 如何一步步完成。</p></div></div></div>
            <div class="agent-actions"><button class="lab-action primary" id="agentRun" type="button">运行 Agent</button><span class="agent-status" id="agentStatus">当前任务：查询订单</span></div>
          </div>
          <div class="lab-footer">真实系统中的工具必须做鉴权、参数校验、超时和审计；高风险动作默认需要人工确认。</div>
        </div>
      `
    },
    {
      id: "create-agent",
      kicker: "04 / 代码实现",
      title: "用 create_agent 组装客服助手",
      html: `
        <p>LangChain 1.x 提供高层入口 <code>create_agent</code>：传入模型、工具和系统提示词，就能得到可运行的 Agent。它底层由 LangGraph 驱动，因此可以接入状态持久化。</p>
        <pre><code class="language-python">from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model=model,
    tools=[get_order_status],
    system_prompt="""你是电商客服助手。
先确认用户提供了订单号，再调用查询工具。
不要猜测物流状态。涉及退款时，说明需要人工审批。""",
    checkpointer=InMemorySaver(),
)

config = {"configurable": {"thread_id": "demo-user-42"}}

result = agent.invoke(
    {"messages": [{"role": "user", "content": "我的订单 A1024 到哪了？"}]},
    config=config,
)

for message in result["messages"]:
    print(type(message).__name__, getattr(message, "text", ""))</code></pre>
        <p>同一个 <code>thread_id</code> 的多次调用会共享会话状态。换一个 ID，就是另一段独立对话。真实项目通常把用户、租户、权限和审计信息放进运行上下文，而不是只靠一个字符串 ID。</p>
        <h3>工具设计清单</h3>
        <ul>
          <li><strong>搜索类：</strong>限制查询范围与返回条数，过滤敏感字段。</li>
          <li><strong>读取类：</strong>参数校验、用户鉴权、超时、空结果处理。</li>
          <li><strong>写入类：</strong>幂等键、二次确认、审计日志、可撤销机制。</li>
          <li><strong>高风险类：</strong>默认禁用或进入人工审批，不交给模型自由决定。</li>
        </ul>
        <div class="callout danger"><span class="callout-icon">!</span><div class="callout-body"><strong>不要把数据库管理员账号交给工具</strong><p>工具应只拥有完成该动作所需的最小权限。让模型生成任意 SQL 并直接执行，是最常见也最危险的设计之一。</p></div></div>
        <div class="chapter-bridge"><strong>接下来：</strong>当流程出现分支、循环、人工审批和断点续跑时，单靠 Agent 默认循环不够清晰。下一章用 LangGraph 把状态和控制流画出来。</div>
      `
    }
  ],
  quiz: [
    {
      q: "在 Agent 循环中，工具执行结果通常以什么形式回到模型？",
      options: ["一个 Python print", "ToolMessage", "一个新的用户注册", "SystemMessage"],
      answer: 1,
      explain: "工具结果作为 ToolMessage 加入消息序列，模型基于它继续推理。"
    },
    {
      q: "哪个工具最适合直接提供给 Agent 自动执行？",
      options: [
        "无限制执行 SQL",
        "查询当前用户自己的订单状态（带鉴权）",
        "删除任意用户账户",
        "向所有客户群发邮件"
      ],
      answer: 1,
      explain: "只读、范围受限、带鉴权的工具风险较低。写操作尤其是不可逆操作应加确认与审计。"
    },
    {
      q: "为什么工具 docstring 很重要？",
      options: [
        "Python 运行时必须读取它",
        "模型根据工具名称、参数和描述决定是否调用以及如何传参",
        "它可以让 API Key 更安全",
        "它会自动生成数据库索引"
      ],
      answer: 1,
      explain: "工具描述是模型选择工具的主要依据。清晰说明适用/不适用场景能显著减少误调用。"
    }
  ],
  bridge: "Agent 的循环已经能完成不少任务。下一章我们把它放进显式的图结构：状态、节点、条件边、检查点和人工中断。"
});