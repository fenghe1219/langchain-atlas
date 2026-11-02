window.COURSE_LESSONS.push({
  id: "langgraph",
  num: "07",
  tone: 2,
  short: "LangGraph 工作流",
  navSubtitle: "让控制流看得见",
  title: "当 Agent 需要一张流程图",
  lede: "简单的 Agent 循环可以自动跑；但真实业务流程常有分支、重试、人工审批和断点续跑。LangGraph 把这些控制流显式画成状态图：每个节点做什么、什么条件下走哪条边，一目了然。",
  duration: "32 分钟",
  level: "进阶",
  tags: ["StateGraph", "Checkpoint", "Human-in-the-loop", "State"],
  objectives: [
    "理解 State、Node、Edge、Checkpoint 四个概念",
    "用 StateGraph 表达分类与条件分支",
    "用 checkpointer 保存多轮会话和任务进度",
    "在不可逆动作前设置人工审批中断"
  ],
  terms: [
    { term: "State", definition: "在节点之间流动的共享数据，例如消息、分类结果、审批状态。" },
    { term: "Node", definition: "一个执行步骤，接收状态并返回状态更新。" },
    { term: "Checkpoint", definition: "某个 thread 在某一时刻的完整状态快照，可恢复执行。" }
  ],
  sections: [
    {
      id: "why-graph",
      kicker: "01 / 为什么需要图",
      title: "当“下一步”不再固定",
      html: `
        <p>如果你的流程是“检索 → 回答”，一条链就够了。但下面这些需求会让链式结构变得吃力：需要根据分类走不同处理、失败后回到上一步重试、等待人工审批、跨天继续任务、把执行过程可视化。LangGraph 用图来表达这些控制流。</p>
        <div class="concept-grid">
          <div class="concept-card"><span class="concept-card-icon">S</span><strong>State · 状态</strong><p>节点共享的数据。只放真正需要跨步骤传递的信息，不要塞入整个数据库。</p></div>
          <div class="concept-card"><span class="concept-card-icon">N</span><strong>Node · 节点</strong><p>普通 Python 函数或 Agent 步骤。输入 State，返回要更新的字段。</p></div>
          <div class="concept-card"><span class="concept-card-icon">E</span><strong>Edge · 边</strong><p>固定边决定下一步；条件边根据当前 State 选择分支。</p></div>
          <div class="concept-card"><span class="concept-card-icon">C</span><strong>Checkpoint · 检查点</strong><p>按 thread 保存状态，支持多轮对话、恢复和人工中断。</p></div>
        </div>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>心智模型：LangGraph 是“可恢复的状态机”</strong><p>它不负责替你写业务，只负责按图执行、保存状态、在中断点暂停并在恢复时继续。节点内部可以用普通 Python、模型或 Agent。</p></div></div>
      `
    },
    {
      id: "build-graph",
      kicker: "02 / 最小图",
      title: "分类 → 分支 → 回答",
      html: `
        <p>下面构造一个客服分流图：先分类问题，再根据类型决定走普通问答还是人工处理。为了让示例短一些，节点内部只做示意。</p>
        <pre><code class="language-python">from typing import Literal
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END

class SupportState(TypedDict):
    question: str
    category: str
    answer: str

def classify(state: SupportState):
    text = state["question"]
    category = "human" if "退款" in text else "faq"
    return {"category": category}

def answer_faq(state: SupportState):
    return {"answer": "根据知识库，这是常见问题解答……"}

def human_handoff(state: SupportState):
    return {"answer": "已创建人工工单，客服会尽快联系你。"}

def route_after_classify(state: SupportState) -> Literal["faq", "human"]:
    return state["category"]

builder = StateGraph(SupportState)
builder.add_node("classify", classify)
builder.add_node("faq", answer_faq)
builder.add_node("human", human_handoff)

builder.add_edge(START, "classify")
builder.add_conditional_edges(
    "classify",
    route_after_classify,
    {"faq": "faq", "human": "human"},
)
builder.add_edge("faq", END)
builder.add_edge("human", END)

graph = builder.compile()
result = graph.invoke({"question": "我想申请退款"})
print(result)</code></pre>
        <p>注意：节点返回的是<strong>状态更新</strong>，不是整个状态对象。框架会按 State 定义合并更新，并决定下一节点。</p>
      `
    },
    {
      id: "graph-lab",
      kicker: "03 / 互动实验",
      title: "实验：运行一张带审批的状态图",
      html: `
        <p>运行流程，观察状态图中的节点逐个点亮。当流程走到“退款审批”时，图会暂停；只有你点击批准或拒绝，执行才会继续。这正是人工介入在状态机里的位置。</p>
        <div class="lab" data-widget="graph-lab">
          <div class="lab-top">
            <div><div class="lab-kicker">INTERACTIVE · STATEGRAPH</div><h3>带审批的客服分支</h3><p>点击运行，观察节点与中断状态。</p></div>
            <span class="lab-hint">本地模拟</span>
          </div>
          <div class="lab-body">
            <div class="graph-canvas">
              <div class="graph-track" id="graphTrack">
                <div class="graph-node" data-node="receive"><b>START</b><span>接收问题 · 已退款订单</span></div><div class="graph-arrow"></div>
                <div class="graph-node" data-node="classify"><b>NODE · classify</b><span>识别意图：退款申请</span></div><div class="graph-arrow"></div>
                <div class="graph-node" data-node="policy"><b>NODE · policy_check</b><span>检查订单是否可退</span></div><div class="graph-arrow"></div>
                <div class="graph-node" data-node="approval"><b>NODE · approval</b><span>等待人工审批</span></div><div class="graph-arrow"></div>
                <div class="graph-node" data-node="finish"><b>END</b><span>执行结果并回复用户</span></div>
              </div>
            </div>
            <div class="graph-controls"><button class="lab-action primary" id="graphRun" type="button">运行流程</button><button class="lab-action" id="graphApprove" type="button" disabled>批准退款</button><button class="lab-action" id="graphReject" type="button" disabled>拒绝并转人工</button><div class="graph-log" id="graphLog">等待运行…</div></div>
          </div>
          <div class="lab-footer">真实项目中 interrupt 会保存检查点。用户几小时后回来，也能从同一 thread 恢复，而不必重新开始。</div>
        </div>
      `
    },
    {
      id: "persistence",
      kicker: "04 / 状态与恢复",
      title: "Checkpointer：多轮和续跑的地基",
      html: `
        <p>没有 checkpointer，图的每次 <code>invoke</code> 都是一次性执行。编译时挂上 checkpointer 后，同一 <code>thread_id</code> 的每一步状态都能保存。</p>
        <pre><code class="language-python">from langgraph.checkpoint.memory import InMemorySaver

graph = builder.compile(checkpointer=InMemorySaver())

config = {"configurable": {"thread_id": "user-42"}}

graph.invoke({"question": "我想退款"}, config=config)
graph.invoke({"question": "那多久到账？"}, config=config)</code></pre>
        <div class="callout warning"><span class="callout-icon">!</span><div class="callout-body"><strong>InMemorySaver 只适合演示</strong><p>进程重启后内存状态会丢失。生产环境应选择持久化 checkpointer，并设计 thread 清理、数据保留和租户隔离策略。</p></div></div>
        <h3>人工中断</h3>
        <pre><code class="language-python">from langgraph.types import interrupt, Command

def approval_node(state):
    decision = interrupt({
        "action": "refund",
        "order_id": state["order_id"],
        "question": "是否批准这笔退款？",
    })
    if decision == "approve":
        return {"status": "approved"}
    return {"status": "rejected"}

# 第一次运行会停在 interrupt
graph.invoke({"question": "退款"}, config=config)

# 人工审批后，从检查点继续
graph.invoke(Command(resume="approve"), config=config)</code></pre>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>图不是越复杂越好</strong><p>如果一张图只有线性三步，直接写函数更清晰。只有当分支、循环、持久化或审批成为真实需求时，图结构才配得上它的复杂度。</p></div></div>
        <div class="chapter-bridge"><strong>接下来：</strong>功能跑通只是开始。下一章讨论上线前真正让人头疼的事：流式、成本、评估、追踪、安全与降级。</div>
      `
    }
  ],
  quiz: [
    {
      q: "LangGraph 中，条件边的作用是什么？",
      options: [
        "保存模型密钥",
        "根据当前状态选择下一步走向哪个节点",
        "自动训练节点",
        "把图导出成 PDF"
      ],
      answer: 1,
      explain: "条件边接收状态并返回下一个节点名，适合分类分流和循环控制。"
    },
    {
      q: "checkpointer 的 thread_id 主要用来干什么？",
      options: [
        "区分不同会话/任务的状态快照",
        "作为 API Key 使用",
        "指定模型名称",
        "压缩向量"
      ],
      answer: 0,
      explain: "thread_id 标识一条独立的状态线。同一 ID 可以恢复历史，不同 ID 彼此隔离。"
    },
    {
      q: "在退款审批场景中，interrupt 最重要的价值是？",
      options: [
        "让模型回答更快",
        "在不可逆动作前暂停执行并等待人工决策",
        "自动提高模型温度",
        "删除所有日志"
      ],
      answer: 1,
      explain: "人工中断把高风险动作置于明确的人类控制之下，同时检查点保证可以恢复。"
    }
  ],
  bridge: "现在你已经能设计流程。最后一层是工程化：如何证明它可靠、如何控制成本、如何防止数据泄露，以及如何把 demo 变成可维护的产品。"
});