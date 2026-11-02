window.COURSE_LESSONS.push({
  id: "rag",
  num: "05",
  tone: 5,
  short: "RAG 知识库",
  navSubtitle: "让答案有据可查",
  title: "给模型装上一座知识库",
  lede: "RAG（Retrieval-Augmented Generation）不是“把文档丢给模型”，而是一条从文档处理、切分、向量化、检索到生成引用的工程链路。这一章会拆开每一段，并用实验让你亲手看到“检索质量如何决定回答质量”。",
  duration: "38 分钟",
  level: "进阶",
  tags: ["RAG", "Embedding", "Vector Store", "Citations"],
  objectives: [
    "画出 RAG 的六段流水线",
    "理解切分、Embedding、向量检索的职责",
    "搭建带来源编号的最小 RAG 链",
    "诊断“答非所问”到底出在检索还是生成"
  ],
  terms: [
    { term: "Embedding", definition: "把文本映射成向量，使语义相近的文本在向量空间中更接近。" },
    { term: "Chunk", definition: "从长文档切出的片段，是检索的最小单位。" },
    { term: "Retriever", definition: "根据问题返回相关文档片段的组件，不一定绑定向量库。" }
  ],
  sections: [
    {
      id: "why-rag",
      kicker: "01 / 为什么",
      title: "模型不知道，文档知道",
      html: `
        <p>模型的知识来自训练数据，它不知道你公司的制度、昨天的订单，也没法保证答案实时。把所有文档塞进 Prompt 又会遇到上下文长度、成本和“中间信息丢失”的问题。RAG 的做法是：<strong>先查，再答</strong>。</p>
        <div class="flow-row">
          <div class="flow-step"><b>Load</b><span>读取 PDF / Markdown</span></div>
          <div class="flow-step"><b>Split</b><span>切成可检索片段</span></div>
          <div class="flow-step"><b>Embed</b><span>文本转向量</span></div>
          <div class="flow-step"><b>Index</b><span>写入向量库</span></div>
          <div class="flow-step"><b>Retrieve</b><span>按问题找片段</span></div>
          <div class="flow-step"><b>Generate</b><span>基于片段回答</span></div>
        </div>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>RAG 的关键不是“向量数据库”</strong><p>向量库只是索引。真正决定效果的是：文档是否干净、切分是否合理、检索是否召回正确内容、Prompt 是否要求引用、答案是否经过评估。</p></div></div>
      `
    },
    {
      id: "rag-lab",
      kicker: "02 / 互动实验",
      title: "实验：检索到哪几段，答案就有多大把握",
      html: `
        <p>下面使用一份简化版企业内部资料。输入问题后，系统会按关键词相关性给片段打分，模拟“召回 → 排序 → 生成”的过程。故意试试“上海住宿”和“年假”这类不同主题，观察命中片段的差异。</p>
        <div class="lab" data-widget="rag-lab">
          <div class="lab-top">
            <div><div class="lab-kicker">INTERACTIVE · RETRIEVAL</div><h3>迷你知识库检索</h3><p>本地关键词打分模拟。真实 RAG 使用 Embedding 或混合检索，但流程相似。</p></div>
            <span class="lab-hint">本地实验</span>
          </div>
          <div class="lab-body">
            <div class="rag-grid">
              <div>
                <div class="rag-query-row"><input id="ragQuery" value="在上海出差，住宿能报销多少？" aria-label="知识库问题"><button class="lab-action primary" id="ragSearch" type="button">检索并回答</button></div>
                <div class="rag-suggestions"><button class="rag-suggestion" type="button" data-query="在上海出差，住宿能报销多少？">上海住宿</button><button class="rag-suggestion" type="button" data-query="VPN 密码忘了怎么办？">VPN</button><button class="rag-suggestion" type="button" data-query="年假可以结转到明年吗？">年假</button><button class="rag-suggestion" type="button" data-query="采购需要几家报价？">采购</button></div>
                <div class="rag-docs" id="ragDocs">
                  <div class="rag-doc" data-doc="stay"><span class="rag-doc-score">01</span><b>《差旅制度》</b> 国内一线城市（北京、上海、广州、深圳）住宿标准为 800 元/晚；其他城市为 500 元/晚。超出部分需部门负责人审批。</div>
                  <div class="rag-doc" data-doc="expense"><span class="rag-doc-score">02</span><b>《报销流程》</b> 差旅结束后 10 个工作日内提交报销申请，附发票、行程单和审批记录；逾期需要财务特批。</div>
                  <div class="rag-doc" data-doc="vpn"><span class="rag-doc-score">03</span><b>《IT 服务指南》</b> VPN 密码每 90 天更换一次。忘记密码可在 IT 门户自助重置；连续失败 5 次会锁定 30 分钟。</div>
                  <div class="rag-doc" data-doc="leave"><span class="rag-doc-score">04</span><b>《假期政策》</b> 入职满一年的员工享有 10 天带薪年假；未休年假可结转至次年 3 月 31 日。</div>
                  <div class="rag-doc" data-doc="procure"><span class="rag-doc-score">05</span><b>《采购制度》</b> 单笔采购超过 5000 元需取得至少 3 家供应商报价，并经采购委员会审批。</div>
                  <div class="rag-doc" data-doc="security"><span class="rag-doc-score">06</span><b>《信息安全规范》</b> 内部资料分为公开、内部、机密三级；机密资料禁止上传到外部公共模型。</div>
                </div>
              </div>
              <div class="rag-output">
                <div class="rag-output-head"><span>Generated answer</span><span>with citations</span></div>
                <div class="rag-answer" id="ragAnswer"><span class="answer-placeholder">点击“检索并回答”，查看基于命中片段的模拟答案。</span></div>
                <div class="rag-metrics"><div class="rag-metric"><span>命中片段</span><strong id="ragHitCount">—</strong></div><div class="rag-metric"><span>最高相关度</span><strong id="ragTopScore">—</strong></div><div class="rag-metric"><span>可信度</span><strong id="ragConfidence">—</strong></div></div>
              </div>
            </div>
          </div>
          <div class="lab-footer">如果召回结果错了，再强的生成模型也只能“基于错误资料认真胡说”。先评估检索，再调 Prompt。</div>
        </div>
      `
    },
    {
      id: "build",
      kicker: "03 / 最小实现",
      title: "从文本文件到带引用的回答",
      html: `
        <p>先做离线索引：加载文档、切分、生成向量并写入内存向量库。生产环境可以把同样的接口换成持久化向量库。下面的示例还需要文档加载器与切分器依赖：</p>
        <pre><code class="language-bash">python -m pip install -U langchain-community langchain-text-splitters langchain-openai</code></pre>
        <pre><code class="language-python">from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore

docs = TextLoader("handbook.txt", encoding="utf-8").load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=80,
    add_start_index=True,
)
chunks = splitter.split_documents(docs)

# Embedding 是另一类模型，需要单独计费
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vector_store = InMemoryVectorStore(embedding=embeddings)
vector_store.add_documents(chunks)

retriever = vector_store.as_retriever(search_kwargs={"k": 4})</code></pre>
        <p>然后构造 RAG 链：把检索结果格式化后放进上下文，保留编号和元数据；模型只允许依据上下文回答。</p>
        <pre><code class="language-python">from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

def format_docs(docs):
    blocks = []
    for i, doc in enumerate(docs, start=1):
        source = doc.metadata.get("source", "unknown")
        blocks.append(f"[{i}] 来源：{source}\\n{doc.page_content}")
    return "\\n\\n".join(blocks)

rag_prompt = ChatPromptTemplate.from_messages([
    ("system", """你是企业知识库助手。
只根据 <context> 中的资料回答；资料不足时明确说“资料中没有足够信息”。
引用时使用 [1]、[2] 这样的编号。
<context>
{context}
</context>"""),
    ("human", "{question}"),
])

rag_chain = (
    {
        "context": retriever | format_docs,
        "question": RunnablePassthrough(),
    }
    | rag_prompt
    | model
    | StrOutputParser()
)

answer = rag_chain.invoke("在上海出差，住宿标准是多少？")
print(answer)</code></pre>
        <div class="callout warning"><span class="callout-icon">!</span><div class="callout-body"><strong>别把“引用编号”当作可点击来源</strong><p>编号只是文本。真正产品化时要把文档 ID、页码、版本和链接放进 metadata，并在前端渲染成可点击的引用卡片。</p></div></div>
      `
    },
    {
      id: "quality",
      kicker: "04 / 质量",
      title: "RAG 答不好，先分诊",
      html: `
        <table class="compare-table">
          <thead><tr><th>症状</th><th>更可能出问题的位置</th><th>优先动作</th></tr></thead>
          <tbody>
            <tr><td>明明有答案却检索不到</td><td>切分、Embedding、召回数量</td><td>看召回日志；尝试混合检索、增大 k、改切分</td></tr>
            <tr><td>检索到了但模型忽略</td><td>上下文顺序、Prompt 约束</td><td>把关键资料放前面；显式要求逐条引用</td></tr>
            <tr><td>答案把旧制度当新制度</td><td>文档版本与 metadata</td><td>加版本、生效日期过滤，删除过期文档</td></tr>
            <tr><td>答案看似正确但没来源</td><td>生成或引用约束</td><td>强制引用、答案校验、无依据则拒答</td></tr>
            <tr><td>成本或延迟高</td><td>切片太多、上下文过长</td><td>重排、压缩上下文、缓存、减少 k</td></tr>
          </tbody>
        </table>
        <h3>进阶方向</h3>
        <div class="concept-grid">
          <div class="concept-card"><span class="concept-card-icon">H</span><strong>混合检索</strong><p>关键词 + 向量，兼顾专有名词与语义相似。</p></div>
          <div class="concept-card"><span class="concept-card-icon">R</span><strong>Rerank 重排</strong><p>先召回较多候选，再用重排模型精确排序。</p></div>
          <div class="concept-card"><span class="concept-card-icon">Q</span><strong>Query Rewrite</strong><p>把口语问题改写为多个检索查询，提高召回率。</p></div>
          <div class="concept-card"><span class="concept-card-icon">P</span><strong>Parent Retrieval</strong><p>用小块检索，返回其所属的大段内容，兼顾精度与上下文。</p></div>
        </div>
        <div class="callout tip"><span class="callout-icon">✦</span><div class="callout-body"><strong>RAG 的评估要拆开</strong><p>分别测检索召回率、答案忠实度、引用正确率和拒答准确率。只看“回答像不像样”无法定位问题。</p></div></div>
        <div class="chapter-bridge"><strong>接下来：</strong>知识库让模型“有资料”，但还不能“做事”。下一章学习工具调用，让模型查订单、发通知，并理解 Agent 的决策循环。</div>
      `
    }
  ],
  quiz: [
    {
      q: "RAG 中，Retriever 的主要职责是什么？",
      options: [
        "训练 Embedding 模型",
        "根据问题返回相关文档片段",
        "把最终答案翻译成中文",
        "保存用户登录状态"
      ],
      answer: 1,
      explain: "Retriever 负责召回。它可以基于向量、关键词或混合检索，但目标都是找到相关上下文。"
    },
    {
      q: "用户说“住宿标准是 800”，但资料里只写了“一线城市 800”，最应该检查什么？",
      options: [
        "模型温度是否等于 0",
        "城市是否属于一线城市，以及资料版本/上下文是否完整",
        "是否安装了前端框架",
        "API Key 是否为最新"
      ],
      answer: 1,
      explain: "这是条件信息缺失和版本问题。RAG 必须保留完整约束，并让答案引用具体段落。"
    },
    {
      q: "下面哪项最能提升 RAG 的可信度？",
      options: [
        "让回答更长",
        "把引用编号、文档来源和版本元数据一起返回",
        "把所有文档都塞进系统提示词",
        "关闭检索日志"
      ],
      answer: 1,
      explain: "可追溯的来源和版本让用户能验证答案，也便于排查错误。"
    }
  ],
  bridge: "现在模型能查资料了。但如果用户说“帮我查订单并改地址”，光有知识还不够。下一章进入工具与 Agent：让模型观察结果、选择动作，并在安全边界内完成任务。"
});