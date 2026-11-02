(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function initArchLab() {
    const picker = $('#archPicker');
    if (!picker) return;
    const parts = new Set(['prompt', 'model']);
    const flow = $('#archFlow');
    const response = $('#archResponse');
    const verdict = $('#archVerdict');
    const labels = {
      prompt: ['P', 'Prompt 组装', '填入角色与约束'],
      retriever: ['R', 'Retriever 检索', '召回制度片段'],
      memory: ['S', 'Memory 状态', '载入历史上下文'],
      model: ['M', 'ChatModel 生成', '基于上下文回答'],
      tools: ['T', 'Tools 执行', '按需查询业务系统'],
      guard: ['G', 'Guardrails 审核', '权限与输出检查']
    };
    const order = ['prompt', 'retriever', 'memory', 'model', 'tools', 'guard'];

    function draw() {
      flow.innerHTML = order.filter((key) => parts.has(key)).map((key) => `<div class="arch-node ${key === 'tools' ? 'is-tool' : key === 'memory' ? 'is-memory' : key === 'guard' ? 'is-guard' : ''}"><b>${labels[key][0]}</b><span>${labels[key][1]}</span></div>`).join('<div class="arch-arrow"></div>');
      let answer = '给出一段基于训练知识的回答';
      if (parts.has('retriever')) answer = '基于制度资料回答，并标注 [1] 来源';
      if (parts.has('tools')) answer = '执行查询后，再组织最终回复';
      if (parts.has('guard')) answer = '通过安全与权限检查后回复';
      if (parts.has('memory')) answer = '结合历史上下文的回复';
      response.textContent = answer;
      let title = '基础对话。';
      let text = '模型只能依靠训练知识和本次提示词回答，无法保证企业内部事实。';
      if (parts.has('retriever') && parts.has('tools')) {
        title = 'RAG + Agent 混合应用。';
        text = '模型能先检索资料，也能按需调用业务工具。此时必须关注工具权限、循环上限与回答引用。';
      } else if (parts.has('retriever')) {
        title = 'RAG 知识库问答。';
        text = '回答可以基于私有资料，但检索质量、切分和来源版本会直接决定答案质量。';
      } else if (parts.has('tools')) {
        title = '工具型 Agent。';
        text = '模型可以行动，但没有私有知识来源。适合查询和操作，不适合纯制度问答。';
      }
      if (parts.has('memory')) text += ' 状态组件让多轮对话和任务恢复成为可能。';
      if (parts.has('guard')) text += ' 护栏用于限制输入、输出与工具边界，但不能替代最小权限设计。';
      if (!parts.has('retriever') && !parts.has('tools') && !parts.has('memory') && !parts.has('guard')) text = '结构最短、成本最低，也最容易评估。适合翻译、改写和固定格式生成。';
      verdict.innerHTML = `<span class="arch-verdict-mark">i</span><span><strong>${title}</strong>${text}</span>`;
    }

    picker.addEventListener('click', (event) => {
      const button = event.target.closest('.arch-option');
      if (!button || button.dataset.lock === 'true') return;
      const part = button.dataset.part;
      if (parts.has(part)) parts.delete(part); else parts.add(part);
      button.classList.toggle('is-on', parts.has(part));
      draw();
    });
    draw();
  }

  function initPromptLab() {
    const role = $('#promptRole');
    if (!role) return;
    const tone = $('#promptTone');
    const limit = $('#promptLimit');
    const task = $('#promptTask');
    const system = $('#promptSystem');
    const human = $('#promptHuman');
    const mock = $('#promptMock');
    const answers = [
      ['VPN', '先确认 VPN 客户端已登录，并检查网络能否访问公司门户；如果仍然失败，重启客户端并提交错误截图。'],
      ['住宿|差旅|出差', '一线城市住宿标准为 800 元/晚，其他城市为 500 元/晚；超出部分需要部门负责人审批。'],
      ['报销|发票', '差旅结束后 10 个工作日内提交申请，附发票、行程单和审批记录；逾期需要财务特批。'],
      ['年假|休假', '入职满一年享有 10 天带薪年假；未休完的部分可以结转到次年 3 月 31 日。'],
      ['采购|报价', '单笔采购超过 5000 元时，需要至少 3 家供应商报价并经过采购委员会审批。']
    ];

    function update() {
      const roleValue = role.value;
      const toneValue = tone.value;
      const limitValue = Math.max(20, Number(limit.value) || 80);
      const taskValue = task.value.trim() || '（请输入一个问题）';
      system.textContent = `你是${roleValue}。请用${toneValue}的语气回答，不超过 ${limitValue} 字。资料不足时要明确说明，不要编造。`;
      human.textContent = taskValue;
      const found = answers.find(([pattern]) => new RegExp(pattern, 'i').test(taskValue));
      mock.textContent = found ? found[1] : '我会先确认问题中的关键信息，再给出可执行的步骤；如果资料不足，会明确提示需要补充什么。';
    }
    [role, tone, limit, task].forEach((node) => {
      node.addEventListener('input', update);
      node.addEventListener('change', update);
    });
    update();
  }

  function initPipelineLab() {
    const button = $('#pipeRun');
    if (!button) return;
    const input = $('#pipeQuestion');
    const stages = $$('.pipe-stage');
    const log = $('#pipeLog');
    let runId = 0;

    function reset() {
      stages.forEach((stage) => stage.classList.remove('is-active', 'is-done'));
    }

    button.addEventListener('click', () => {
      const value = input.value.trim();
      reset();
      const currentRun = ++runId;
      if (!value) {
        log.innerHTML = '<strong>校验失败：</strong>输入不能为空。';
        return;
      }
      button.disabled = true;
      const messages = [
        `01 输入校验 ✓ 收到 ${value.length} 个字符`,
        '02 Prompt ✓ 已生成 2 条消息：system + human',
        '03 Model ✓ 返回 AIMessage（含文本与元数据）',
        '04 Parser ✓ 提取纯文本，类型为 str'
      ];
      const delays = [0, 480, 980, 1480];
      stages.forEach((stage, index) => {
        setTimeout(() => {
          if (currentRun !== runId) return;
          stages.forEach((node, nodeIndex) => {
            node.classList.toggle('is-active', nodeIndex === index);
            if (nodeIndex < index) { node.classList.remove('is-active'); node.classList.add('is-done'); }
          });
          log.innerHTML = messages.slice(0, index + 1).join('<br>');
          if (index === stages.length - 1) {
            setTimeout(() => {
              if (currentRun !== runId) return;
              stage.classList.remove('is-active');
              stage.classList.add('is-done');
              log.innerHTML += '<br><strong>链执行完成</strong> · 最终输出是普通字符串，可直接返回给前端。';
              button.disabled = false;
            }, 420);
          }
        }, delays[index]);
      });
    });
  }

  function initRagLab() {
    const queryInput = $('#ragQuery');
    if (!queryInput) return;
    const documents = $$('#ragDocs .rag-doc');
    const corpus = {
      stay: { keywords: ['上海', '北京', '广州', '深圳', '住宿', '酒店', '差旅', '出差', '标准', '一线', '报销', '城市'], answer: '在上海、北京、广州或深圳出差，住宿标准为 800 元/晚；其他城市为 500 元/晚。超出部分需要部门负责人审批。', ordinal: 1 },
      expense: { keywords: ['报销', '发票', '行程单', '材料', '流程', '提交', '逾期', '差旅', '工作'], answer: '差旅结束后 10 个工作日内提交报销申请，附发票、行程单和审批记录；逾期需要财务特批。', ordinal: 2 },
      vpn: { keywords: ['vpn', '密码', '忘记', '登录', '网络', 'it', '重置', '锁定', '客户端'], answer: 'VPN 密码每 90 天更换一次。忘记密码可在 IT 门户自助重置；连续失败 5 次会锁定 30 分钟。', ordinal: 3 },
      leave: { keywords: ['年假', '休假', '结转', '假期', '员工', '入职', '明年'], answer: '入职满一年的员工享有 10 天带薪年假；未休年假可结转至次年 3 月 31 日。', ordinal: 4 },
      procure: { keywords: ['采购', '报价', '供应商', '审批', '委员会', '5000', '单笔'], answer: '单笔采购超过 5000 元需取得至少 3 家供应商报价，并经采购委员会审批。', ordinal: 5 },
      security: { keywords: ['安全', '机密', '内部', '资料', '外部', '模型', '上传', '信息'], answer: '内部资料分为公开、内部、机密三级；机密资料禁止上传到外部公共模型。', ordinal: 6 }
    };

    function run() {
      const query = queryInput.value.trim() || '在上海出差，住宿能报销多少？';
      const normalized = query.toLowerCase();
      const ranked = documents.map((doc) => {
        const item = corpus[doc.dataset.doc];
        let score = 0;
        item.keywords.forEach((keyword) => { if (normalized.includes(keyword.toLowerCase())) score += keyword.length > 2 ? 2 : 1; });
        if (normalized.includes(doc.dataset.doc)) score += 2;
        return { doc, item, score };
      }).sort((a, b) => b.score - a.score);
      const hits = ranked.filter((entry) => entry.score > 0).slice(0, 3);
      documents.forEach((doc) => doc.classList.remove('is-hit'));
      hits.forEach((entry) => entry.doc.classList.add('is-hit'));
      const answer = $('#ragAnswer');
      const top = ranked[0];
      if (!top || top.score < 2) {
        answer.innerHTML = '<span class="answer-placeholder">资料中没有足够信息回答这个问题。系统应明确拒答，而不是让模型自由发挥。</span>';
        $('#ragHitCount').textContent = '0';
        $('#ragTopScore').textContent = '—';
        $('#ragConfidence').textContent = '低';
        return;
      }
      answer.innerHTML = `${esc(top.item.answer)} <span class="citation">[${top.item.ordinal}]</span>`;
      $('#ragHitCount').textContent = String(hits.length);
      $('#ragTopScore').textContent = Math.min(99, 56 + top.score * 5) + '%';
      $('#ragConfidence').textContent = top.score >= 4 ? '高' : '中';
    }

    $('#ragSearch').addEventListener('click', run);
    queryInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') run(); });
    $$('.rag-suggestion').forEach((button) => button.addEventListener('click', () => {
      queryInput.value = button.dataset.query;
      run();
    }));
    run();
  }

  function initAgentLab() {
    const trace = $('#agentTrace');
    if (!trace) return;
    const scenarios = $$('.agent-scenario');
    const runButton = $('#agentRun');
    const status = $('#agentStatus');
    let current = 'order';
    let runId = 0;

    const scenarioData = {
      order: {
        label: '查询订单',
        steps: [
          { type: 'thought', title: '识别意图', body: '用户询问订单 A1024 的物流状态，需要调用只读查询工具。' },
          { type: 'tool', title: '调用 get_order_status', body: '工具参数经过 schema 校验。', code: 'order_id = "A1024"' },
          { type: 'result', title: '观察工具结果', body: '已发货，预计 11 月 5 日送达。' },
          { type: 'final', title: '组织最终回答', body: '你的订单 A1024 已发货，预计 11 月 5 日送达。' }
        ]
      },
      refund: {
        label: '申请退款',
        steps: [
          { type: 'thought', title: '识别为高风险动作', body: '退款有副作用，不能由模型直接执行。' },
          { type: 'tool', title: '准备 request_refund', body: '只创建退款申请，金额与归属由业务系统校验。', code: 'order_id = "A1024"' },
          { type: 'stop', title: '中断等待人工审批', body: '检查点已保存。Agent 在获得批准前不能继续执行退款。' }
        ]
      },
      policy: {
        label: '制度问答',
        steps: [
          { type: 'thought', title: '识别为制度问题', body: '先调用知识库检索，而不是直接依赖模型记忆。' },
          { type: 'tool', title: '调用 search_handbook', body: '检索差旅与住宿相关片段。', code: 'query = "差旅 住宿 标准"' },
          { type: 'result', title: '观察检索结果', body: '命中《差旅制度》[1]：一线城市 800 元/晚。' },
          { type: 'final', title: '带引用回答', body: '根据《差旅制度》[1]，上海属于一线城市，住宿标准为 800 元/晚。' }
        ]
      }
    };

    function render(steps, approval = false) {
      trace.innerHTML = steps.map((step, index) => `<div class="trace-step is-${step.type}"><span class="trace-mark">${index + 1}</span><div class="trace-copy"><strong>${esc(step.title)}</strong><p>${esc(step.body)}</p>${step.code ? `<code>${esc(step.code)}</code>` : ''}</div></div>`).join('') + (approval ? '<div class="approval-box" id="agentApproval"><span>等待人工审批：是否批准 A1024 退款？</span><button type="button" data-approve="yes">批准</button><button type="button" data-approve="no">拒绝</button></div>' : '');
      if (approval) {
        $$('#agentApproval button').forEach((button) => button.addEventListener('click', () => {
          const approved = button.dataset.approve === 'yes';
          render(approved ? [
            { type: 'result', title: '人工审批通过', body: '审批结果作为 Command(resume) 回传，从检查点继续。' },
            { type: 'final', title: '执行结果', body: '退款申请已创建，预计 3-5 个工作日到账（示例）。' }
          ] : [
            { type: 'stop', title: '人工拒绝退款', body: '系统不会调用支付接口，流程转人工客服复核。' },
            { type: 'final', title: '回复用户', body: '你的退款申请未通过自动审批，已转交人工客服处理。' }
          ]);
          status.textContent = approved ? '审批通过 · 流程恢复' : '审批拒绝 · 转人工';
        }));
      }
    }

    scenarios.forEach((button) => button.addEventListener('click', () => {
      scenarios.forEach((node) => node.classList.toggle('is-active', node === button));
      current = button.dataset.scenario;
      runId++;
      status.textContent = '当前任务：' + scenarioData[current].label;
      render([{ type: 'thought', title: '等待运行', body: '点击“运行 Agent”观察决策轨迹。' }]);
    }));

    runButton.addEventListener('click', () => {
      const data = scenarioData[current];
      const currentRun = ++runId;
      status.textContent = '正在运行：' + data.label;
      runButton.disabled = true;
      setTimeout(() => {
        if (currentRun !== runId) return;
        render(data.steps, current === 'refund');
        runButton.disabled = false;
        status.textContent = current === 'refund' ? '已暂停 · 等待人工审批' : '流程完成';
      }, 520);
    });
  }

  function initGraphLab() {
    const runButton = $('#graphRun');
    if (!runButton) return;
    const nodes = $$('.graph-node');
    const approve = $('#graphApprove');
    const reject = $('#graphReject');
    const log = $('#graphLog');
    let runId = 0;
    let waiting = false;

    function clear() {
      nodes.forEach((node) => node.classList.remove('is-active', 'is-interrupt'));
      approve.disabled = true;
      reject.disabled = true;
      waiting = false;
    }

    function activate(id, interrupt = false) {
      const node = nodes.find((item) => item.dataset.node === id);
      nodes.forEach((item) => item.classList.remove('is-active', 'is-interrupt'));
      if (node) {
        node.classList.add(interrupt ? 'is-interrupt' : 'is-active');
        if (interrupt) node.classList.add('is-active');
      }
    }

    runButton.addEventListener('click', () => {
      clear();
      const currentRun = ++runId;
      log.textContent = 'START · 收到退款请求，加载 thread state…';
      const sequence = [
        ['receive', '接收请求 · 状态写入 graph'],
        ['classify', 'classify · 识别意图：退款'],
        ['policy', 'policy_check · 订单符合可退条件']
      ];
      sequence.forEach(([id, message], index) => {
        setTimeout(() => {
          if (currentRun !== runId) return;
          activate(id);
          log.textContent = message;
          if (index === sequence.length - 1) {
            setTimeout(() => {
              if (currentRun !== runId) return;
              waiting = true;
              activate('approval', true);
              approve.disabled = false;
              reject.disabled = false;
              log.textContent = 'INTERRUPT · 等待人工审批，checkpoint 已保存。选择批准或拒绝以恢复执行。';
            }, 500);
          }
        }, index * 520);
      });
    });

    function finish(approved) {
      if (!waiting) return;
      waiting = false;
      const currentRun = ++runId;
      approve.disabled = true;
      reject.disabled = true;
      activate('approval');
      log.textContent = approved ? 'Command(resume="approve") · 恢复执行…' : 'Command(resume="reject") · 转人工…';
      setTimeout(() => {
        if (currentRun !== runId) return;
        activate('finish');
        log.textContent = approved ? 'END · 退款已提交，审计日志已记录。' : 'END · 未执行退款，已创建人工工单。';
      }, 600);
    }

    approve.addEventListener('click', () => finish(true));
    reject.addEventListener('click', () => finish(false));
  }

  function initChecklist() {
    const list = $('#prodChecklist');
    if (!list) return;
    const checks = $$('input[data-check]', list);
    const bar = $('#checkBar');
    const text = $('#checkText');
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('lc-atlas-checklist') || '{}') || {}; } catch (error) {}

    function update(store) {
      const done = checks.filter((check) => check.checked).length;
      if (bar) bar.style.width = Math.round((done / checks.length) * 100) + '%';
      if (text) text.textContent = done + ' / ' + checks.length;
      if (store) {
        const payload = {};
        checks.forEach((check) => { payload[check.dataset.check] = check.checked; });
        try { localStorage.setItem('lc-atlas-checklist', JSON.stringify(payload)); } catch (error) {}
      }
    }

    checks.forEach((check) => {
      check.checked = Boolean(saved[check.dataset.check]);
      check.addEventListener('change', () => update(true));
    });
    update(false);
  }

  function initFlashcards() {
    const cards = $$('.flashcard');
    if (!cards.length) return;
    cards.forEach((card) => card.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      const hint = card.querySelector('span');
      if (hint) hint.textContent = flipped ? '再次点击收起' : '点击揭晓';
      card.setAttribute('aria-pressed', String(flipped));
    }));
  }

  window.initLabs = function () {
    initArchLab();
    initPromptLab();
    initPipelineLab();
    initRagLab();
    initAgentLab();
    initGraphLab();
    initChecklist();
    initFlashcards();
  };
})();