window.COURSE_LESSONS.push({
  id: "runnables",
  num: "04",
  tone: 4,
  short: "Runnable 与 LCEL",
  navSubtitle: "把步骤接成流水线",
  title: "像搭管道一样组装应用",
  lede: "LangChain 最值得掌握的基础抽象叫 Runnable。Prompt、模型、解析器、检索器都可以成为 Runnable，用竖线连接成流水线。理解它之后，invoke、batch、stream 和并行就会变成同一套心智模型。",
  duration: "27 分钟",
  level: "基础",
  tags: ["Runnable", "LCEL", "Streaming", "Batch"],
  objectives: [
    "读懂 prompt | model | parser 的执行顺序",
    "区分 invoke、batch、stream 的适用场景",
    "用 RunnableParallel 并行处理独立任务",
    "知道何时不该为了链式写法而过度封装"
  ],
  terms: [
    { term: "Runnable", definition: "统一的可执行接口，支持 invoke、batch、stream 与异步版本。" },
    { term: "LCEL", definition: "LangChain Expression Language，用竖线组合 Runnable 的表达方式。" },
    { term: "StrOutputParser", definition: "把 AIMessage 的文本内容取出来，变成普通字符串。" }
  ],
  sections: [
    {
      id: "pipe",
      kicker: "01 / 核心抽象",
      title: "一根竖线，把步骤串起来",
      html: `
        <p><span class="term">Runnable</span> 可以理解成“有统一插头和插座的积木”。不管它内部是模板、模型还是函数，都支持 <code>invoke</code> 执行、<code>batch</code> 批量执行和 <code>stream</code> 流式执行。竖线 <code>|</code> 表示把前一步的输出交给后一步。</p>
        <pre><code class="language-python">from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是{role}，用不超过{limit}字回答。"),
    ("human", "{question}"),
])

parser = StrOutputParser()

chain = prompt | model | parser

answer = chain.invoke({
    "role": "企业 IT 支持助手",
    "limit": 80,
    "question": "如何重置 VPN 密码？",
})

print(answer)      # 这里是字符串，不再是 AIMessage
print(type(answer)) # <class 'str'></code></pre>
        <div class="flow-row">
          <div class="flow-step"><b>Dict 输入</b><span>{question, role, limit}</span></div>
          <div class="flow-step"><b>Prompt</b><span>变量进入消息列表</span></div>
          <div class="flow-step"><b>Model</b><span>返回 AIMessage</span></div>
          <div class="flow-step"><b>Parser</b><span>提取为字符串</span></div>
        </div>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>为什么要加解析器？</strong><p>模型返回的是消息对象，里面还有元数据。业务层经常只想要文本，<code>StrOutputParser</code> 把这一层差异抹平，也让后续函数更容易处理。</p></div></div>
      `
    },
    {
      id: "pipeline-lab",
      kicker: "02 / 互动实验",
      title: "实验：观察每一步的数据变化",
      html: `
        <p>点击运行，看一个问题如何经过校验、提示词、模型和解析四个阶段。实验使用本地模拟，重点不是生成内容，而是建立“数据在流水线里变形”的直觉。</p>
        <div class="lab" data-widget="pipeline-lab">
          <div class="lab-top">
            <div><div class="lab-kicker">INTERACTIVE · RUNNABLE</div><h3>Runnable 流水线</h3><p>输入一个问题，逐段观察输入输出。</p></div>
            <span class="lab-hint">本地模拟</span>
          </div>
          <div class="lab-body">
            <div class="pipeline-board">
              <div class="pipe-input"><input id="pipeQuestion" value="如何申请差旅报销？" aria-label="流水线输入问题"><button class="lab-action primary" id="pipeRun" type="button">运行流水线</button></div>
              <div class="pipe-stages" id="pipeStages">
                <div class="pipe-stage" data-stage="validate"><b>01 · 输入校验</b><span>长度、空值、权限</span><code>dict</code></div>
                <div class="pipe-stage" data-stage="prompt"><b>02 · Prompt</b><span>填入变量与规则</span><code>messages</code></div>
                <div class="pipe-stage" data-stage="model"><b>03 · Model</b><span>生成回答</span><code>AIMessage</code></div>
                <div class="pipe-stage" data-stage="parser"><b>04 · Parser</b><span>提取纯文本</span><code>str</code></div>
              </div>
              <div class="pipe-log" id="pipeLog">等待运行…</div>
            </div>
          </div>
          <div class="lab-footer">真实链里还可能有 Retriever、工具节点、缓存和日志。链越长，越要明确每一步失败时怎么处理。</div>
        </div>
      `
    },
    {
      id: "modes",
      kicker: "03 / 三种运行方式",
      title: "invoke、batch、stream",
      html: `
        <div class="concept-grid three">
          <div class="concept-card"><span class="concept-card-icon">I</span><strong>invoke · 单次</strong><p>输入一个值，等待完整结果。适合后台任务、结构化处理和简单调试。</p></div>
          <div class="concept-card"><span class="concept-card-icon">B</span><strong>batch · 批量</strong><p>一次提交多组输入，框架可并发调度。适合批处理文档、批量分类。</p></div>
          <div class="concept-card"><span class="concept-card-icon">S</span><strong>stream · 流式</strong><p>持续返回片段，前端可以逐字显示。适合聊天和长回答。</p></div>
        </div>
        <pre><code class="language-python"># 批量处理多个问题
questions = [
    "报销需要哪些材料？",
    "出差住宿标准是多少？",
    "如何申请 VPN 权限？",
]
answers = chain.batch([
    {"role": "HR 助手", "limit": 70, "question": q}
    for q in questions
])
print(answers)</code></pre>
        <pre><code class="language-python"># 流式输出，适合聊天界面
for chunk in chain.stream({
    "role": "企业知识库助手",
    "limit": 120,
    "question": "解释一下报销流程。",
}):
    print(chunk, end="", flush=True)</code></pre>
        <div class="callout warning"><span class="callout-icon">!</span><div class="callout-body"><strong>流式不是“更快得到最终答案”</strong><p>它改善的是首字延迟和交互体验，总耗时未必下降。结构化输出、工具调用等场景通常更适合拿到完整结果后再处理。</p></div></div>
      `
    },
    {
      id: "parallel",
      kicker: "04 / 组合与韧性",
      title: "并行、重试与降级",
      html: `
        <p>如果两个任务互不依赖，例如“生成摘要”和“提取关键词”，可以并行执行。RunnableParallel 接收一个任务字典，返回同键的结果。</p>
        <pre><code class="language-python">from langchain_core.runnables import RunnableParallel
from langchain_core.output_parsers import StrOutputParser

summary_chain = summary_prompt | model | StrOutputParser()
keyword_chain = keyword_prompt | model | StrOutputParser()

parallel = RunnableParallel(
    summary=summary_chain,
    keywords=keyword_chain,
)

result = parallel.invoke({"article": article_text})
print(result["summary"])
print(result["keywords"])</code></pre>
        <h3>生产环境要预设失败路径</h3>
        <pre><code class="language-python">resilient_chain = (
    chain
    .with_retry(stop_after_attempt=3)
    .with_fallbacks([backup_chain])
)</code></pre>
        <p>重试适合瞬时网络错误；降级模型适合主模型不可用或成本超限。两者都不能替代幂等设计：如果工具会扣款、发邮件，重试可能造成重复副作用，必须使用幂等键或去重。</p>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>什么时候不要用 LCEL？</strong><p>如果流程只有一两步，或需要大量分支、循环、人工中断，直接写 Python 或使用 LangGraph 往往更清楚。链式语法是工具，不是目标。</p></div></div>
        <div class="chapter-bridge"><strong>接下来：</strong>模型已经会回答，但它不知道你公司的资料。下一章给它装上一座可检索的知识库，并让答案带上来源编号。</div>
      `
    }
  ],
  quiz: [
    {
      q: "在 chain = prompt | model | parser 中，parser 接收到的输入是什么？",
      options: ["用户原始字符串", "PromptTemplate 对象", "模型返回的 AIMessage", "数据库记录"],
      answer: 2,
      explain: "竖线把上一步输出传给下一步。Model 返回 AIMessage，StrOutputParser 再从中提取文本。"
    },
    {
      q: "需要一次分类 500 条用户反馈，最适合优先尝试哪种方式？",
      options: ["逐条 invoke 并且串行等待", "batch 批量提交", "stream 流式输出", "把 500 条全部塞进一个 Prompt"],
      answer: 1,
      explain: "batch 能让框架更有效地调度多个独立输入。仍需控制并发、成本与速率限制。"
    },
    {
      q: "工具会执行真实退款，开启自动重试前最需要做什么？",
      options: [
        "把 temperature 调到 0",
        "确保操作具备幂等性或去重机制",
        "换成流式输出",
        "增加更多系统提示词"
      ],
      answer: 1,
      explain: "网络重试可能重复触发副作用。需要幂等键、唯一请求 ID 或人工确认，避免重复扣款。"
    }
  ],
  bridge: "流水线已经跑通。下一章解决“模型不知道私有资料”的问题：从文档加载、切分、向量化到检索和带引用回答。"
});