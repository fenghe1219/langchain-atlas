(function () {
  'use strict';

  const app = document.getElementById('app');
  const lessons = window.COURSE_LESSONS || [];
  const meta = window.COURSE_META || {};
  const STORAGE_KEY = 'lc-atlas-progress-v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const inline = (value = '') => String(value).replace(/`([^`]+)`/g, '<code>$1</code>');
  const icons = {
    arrow: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
  };

  const defaultState = { completed: [], notes: {}, lastLesson: null };
  let state = loadState();
  let pendingSection = null;
  let sectionObserver = null;
  let searchIndex = [];
  let searchResults = [];
  let searchSelection = 0;
  let noteTimer = null;

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!parsed || typeof parsed !== 'object') return { ...defaultState, completed: [], notes: {} };
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed.filter((id) => lessons.some((lesson) => lesson.id === id)) : [],
        notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
        lastLesson: typeof parsed.lastLesson === 'string' ? parsed.lastLesson : null
      };
    } catch (error) {
      return { ...defaultState, completed: [], notes: {} };
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) {}
  }

  function progress() {
    return lessons.length ? Math.round((state.completed.length / lessons.length) * 100) : 0;
  }

  function continueTarget() {
    const firstIncomplete = lessons.find((lesson) => !state.completed.includes(lesson.id));
    if (state.lastLesson && !state.completed.includes(state.lastLesson)) return state.lastLesson;
    if (firstIncomplete) return firstIncomplete.id;
    return lessons[lessons.length - 1]?.id;
  }

  function getLesson(id) {
    return lessons.find((lesson) => lesson.id === id);
  }

  function toast(message) {
    const node = $('#toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('is-visible');
    clearTimeout(node._timer);
    node._timer = setTimeout(() => node.classList.remove('is-visible'), 2200);
  }

  function updateProgressUI() {
    const pct = progress();
    $('#sidebarProgressText').textContent = pct + '%';
    $('#sidebarProgressBar').style.width = pct + '%';
    const done = state.completed.length;
    const hints = [
      '完成第一章，迈出第一步。',
      '已经上路了，继续把概念串起来。',
      '基础模块已完成一半，保持节奏。',
      '已经接近核心进阶内容。',
      '最后几章会把一切拼起来。',
      '全部完成，去把项目做出来。'
    ];
    $('#sidebarProgressHint').textContent = hints[Math.min(5, Math.floor(done / 2))];
    $$('.nav-lesson').forEach((button) => {
      button.classList.toggle('is-complete', state.completed.includes(button.dataset.lessonId));
    });
  }

  function renderSidebar() {
    const nav = $('#sidebarNav');
    $$('.nav-lesson', nav).forEach((node) => node.remove());
    const fragment = document.createDocumentFragment();
    lessons.forEach((lesson) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nav-lesson';
      button.dataset.route = 'lesson-' + lesson.id;
      button.dataset.lessonId = lesson.id;
      button.innerHTML = '<span class="nav-lesson-num">' + esc(lesson.num) + '</span><span class="nav-lesson-text"><span class="nav-lesson-title">' + esc(lesson.short) + '</span><span class="nav-lesson-meta">' + esc(lesson.duration) + ' · ' + esc(lesson.level) + '</span></span>';
      fragment.appendChild(button);
    });
    nav.appendChild(fragment);
    updateProgressUI();
  }

  function setActiveNav(route) {
    $$('.nav-home, .nav-lesson').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.route === route);
    });
  }

  function setBreadcrumb(parts) {
    $('#breadcrumb').innerHTML = '<span>LangChain Atlas</span><i>/</i><strong>' + parts.map(esc).join(' · ') + '</strong>';
  }

  function renderHome() {
    const pct = progress();
    const target = continueTarget();
    const targetLesson = getLesson(target);
    const startText = pct === 0 ? '从第一章开始' : pct === 100 ? '复习最后一章' : '继续学习';
    app.innerHTML = `
      <section class="home-page page-shell">
        <div class="hero">
          <div class="hero-copy">
            <span class="eyebrow">${esc(meta.eyebrow || 'LANGCHAIN ATLAS')}</span>
            <h1>${meta.title || '从一次 API 调用，到真正可用的 AI 应用'}</h1>
            <p class="hero-sub">${meta.subtitle || ''}</p>
            <div class="hero-actions">
              <button class="button-primary" type="button" data-route="lesson-${esc(target || '')}" data-lesson-id="${esc(target || '')}">${esc(startText)} ${icons.arrow}</button>
              <button class="button-ghost" type="button" data-scroll=".home-roadmap">先看学习地图</button>
            </div>
            <div class="hero-note"><span>✓</span>${esc(meta.note || '实验不消耗 API 额度')}</div>
          </div>
          <div class="hero-visual" aria-hidden="true">
            <div class="orbit-stage">
              <div class="orbit-ring"></div>
              <div class="orbit-core"><span>ORCHESTRATE</span><strong>AI APP</strong><i></i><span>10 CHAPTERS</span></div>
              <div class="orbit-node orbit-model"><b>M</b><span>Model</span></div>
              <div class="orbit-node orbit-rag"><b>R</b><span>RAG</span></div>
              <div class="orbit-node orbit-tools"><b>T</b><span>Tools</span></div>
              <div class="orbit-node orbit-state"><b>S</b><span>State</span></div>
              <div class="orbit-tag"><strong>8</strong> interactive labs</div>
            </div>
          </div>
        </div>
        <div class="hero-stats">${(meta.stats || []).map((stat) => `<div class="hero-stat"><strong>${esc(stat.value)}</strong><span>${esc(stat.label)}</span></div>`).join('')}</div>

        <section class="home-section home-roadmap">
          <div class="section-head">
            <div><span class="eyebrow">LEARNING PATH</span><h2>一张从零到项目的路线图</h2></div>
            <div class="section-head-side"><p>每一章都有可交互的演示、现代代码写法和随堂自测。按顺序走，也可以直接跳到你最需要的主题。</p></div>
          </div>
          <div class="roadmap-grid">
            ${lessons.map((lesson, index) => `
              <button class="module-card ${state.completed.includes(lesson.id) ? 'is-complete' : ''}" type="button" data-tone="${lesson.tone || (index % 5) + 1}" data-route="lesson-${esc(lesson.id)}" data-lesson-id="${esc(lesson.id)}">
                <div class="module-card-top"><span class="module-num">MODULE / ${esc(lesson.num)}</span><span class="module-state">${state.completed.includes(lesson.id) ? '已完成' : lesson.id === target ? '继续' : '未开始'}</span></div>
                <h3>${esc(lesson.short)}<br>${esc(lesson.title)}</h3>
                <p>${esc(lesson.lede)}</p>
                <div class="module-card-foot"><span>${esc(lesson.duration)} · ${esc(lesson.level)}</span><span class="module-arrow">${icons.arrow}</span></div>
              </button>`).join('')}
          </div>
        </section>

        <section class="stack-band">
          <div class="stack-band-head"><div><span class="eyebrow">THE STACK</span><h2>一条完整链路，而不是十个孤立 API</h2><p>本教程的关注点不是“记住所有类名”，而是理解每个组件为什么存在、什么时候应该组合在一起。</p></div><span class="pill teal">LangChain 1.x 风格</span></div>
          <div class="stack-flow">${(meta.stack || []).map((item) => `<div class="stack-item"><b>${esc(item.name)}</b><span>${esc(item.desc)}</span></div>`).join('')}</div>
        </section>

        <section class="home-section">
          <div class="section-head"><div><span class="eyebrow">OUTCOMES</span><h2>学完后，你手里会有什么</h2></div><div class="section-head-side"><p>不是一份“看完了”的清单，而是一套能解释、能改造、能排错的工程直觉。</p></div></div>
          <div class="outcomes">
            <div class="outcome-panel">
              <span class="pill teal">能力清单</span>
              <h3>能独立做出可演示的 AI 应用</h3>
              <p>你会理解每个组件的职责，并知道什么时候该克制复杂度。</p>
              <ul class="outcome-list">${(meta.outcomes || []).map((item) => `<li>${inline(item)}</li>`).join('')}</ul>
            </div>
            <div class="outcome-panel dark">
              <span class="pill amber">最终项目</span>
              <h3>企业知识助手</h3>
              <p>制度问答、订单查询、退款审批、引用来源与可观测性。</p>
              <div class="project-preview"><div class="project-preview-head"><span>PROJECT FLOW</span><span>READY TO BUILD</span></div><div class="project-flow">${(meta.projectFlow || []).map((item, index) => `<span class="${index === 2 ? 'hot' : ''}">${esc(item)}</span>`).join('')}</div></div>
              <ul class="outcome-list"><li>带来源引用的 RAG 知识库</li><li>有权限边界的只读业务工具</li><li>人工审批 + 检查点恢复</li></ul>
            </div>
          </div>
        </section>

        <section class="learning-callout">
          <div><span class="eyebrow">START SMALL</span><h2>${pct === 0 ? '先跑通一个 20 行的例子。' : pct === 100 ? '现在，去写一个真正属于你的版本。' : '别追求一次学完，保持每天一个闭环。'}</h2><p>${targetLesson ? '下一站：' + esc(targetLesson.num) + ' · ' + esc(targetLesson.title) : '从学习地图选择任意章节。'}</p></div>
          <button class="button-primary" type="button" data-route="lesson-${esc(target || '')}" data-lesson-id="${esc(target || '')}">${esc(startText)} ${icons.arrow}</button>
        </section>
      </section>`;
    setBreadcrumb(['学习地图']);
    setActiveNav('home');
    document.title = 'LangChain 互动学习站 · 从 API 到 Agent';
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
    updateProgressUI();
  }
  function renderQuiz(quiz, lesson) {
    if (!quiz || !quiz.length) return '';
    return `<section class="quiz" data-lesson-quiz="${esc(lesson.id)}">
      <div class="quiz-head"><div><span class="eyebrow">CHECK YOURSELF</span><h3>随堂自测 · ${quiz.length} 题</h3></div><span class="quiz-score" data-quiz-score>0 / ${quiz.length}</span></div>
      ${quiz.map((item, index) => `<div class="quiz-question" data-answer="${item.answer}" data-answered="false">
        <div class="quiz-q-top"><span class="quiz-q-num">${String(index + 1).padStart(2, '0')}</span><span class="quiz-q-text">${esc(item.q)}</span></div>
        <div class="quiz-options">${item.options.map((option, optionIndex) => `<button class="quiz-option" type="button" data-option="${optionIndex}"><span class="opt-mark">${String.fromCharCode(65 + optionIndex)}</span><span>${esc(option)}</span></button>`).join('')}</div>
        <div class="quiz-explain"><strong>解析：</strong>${esc(item.explain)}</div>
      </div>`).join('')}
    </section>`;
  }

  function renderLesson(lesson) {
    const index = lessons.findIndex((item) => item.id === lesson.id);
    const prev = lessons[index - 1];
    const next = lessons[index + 1];
    const done = state.completed.includes(lesson.id);
    app.innerHTML = `
      <div class="lesson-page">
        <header class="lesson-hero" data-tone="${lesson.tone || 1}">
          <div class="lesson-hero-copy">
            <div class="lesson-kicker"><span class="chapter-chip">MODULE ${esc(lesson.num)}</span><span class="pill">${esc(lesson.level)}</span><span class="pill">${esc(lesson.duration)}</span></div>
            <h1>${esc(lesson.title)}</h1>
            <p class="lesson-lede">${esc(lesson.lede)}</p>
            <ul class="lesson-objectives">${lesson.objectives.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
          </div>
          <aside class="lesson-sidecard">
            <span class="sidecard-label">THIS CHAPTER</span>
            <div class="sidecard-stats"><div class="sidecard-stat"><strong>${esc(lesson.duration)}</strong><span>建议时长</span></div><div class="sidecard-stat"><strong>${lesson.sections.length}</strong><span>核心小节</span></div><div class="sidecard-stat"><strong>${lesson.quiz.length}</strong><span>自测题</span></div><div class="sidecard-stat"><strong>${done ? '100%' : '0%'}</strong><span>完成状态</span></div></div>
            <div class="sidecard-tags">${lesson.tags.map((tag) => `<span class="pill">${esc(tag)}</span>`).join('')}</div>
            <div class="lesson-hero-progress"><span>阅读进度</span><div class="progress-track"><span id="lessonScrollBar" style="width:${done ? 100 : 0}%"></span></div><span id="lessonScrollText">${done ? '完成' : '0%'}</span></div>
          </aside>
        </header>

        <div class="lesson-layout">
          <article class="lesson-content" id="lessonContent">
            ${lesson.sections.map((section, sectionIndex) => `<section class="lesson-section" id="section-${esc(section.id)}" data-section="${esc(section.id)}" data-section-index="${sectionIndex}"><div class="section-kicker">${esc(section.kicker)}</div><h2>${esc(section.title)}</h2>${section.html}</section>`).join('')}
            ${renderQuiz(lesson.quiz, lesson)}
            <div class="lesson-finish">
              <div><span class="finish-state">CHAPTER ${esc(lesson.num)} / ${String(lessons.length).padStart(2, '0')}</span><h3>${done ? '这一章已经留下标记。' : '这一章学完了吗？'}</h3><p>${esc(lesson.bridge)}</p></div>
              <button class="complete-button ${done ? 'is-done' : ''}" id="completeLesson" type="button" data-lesson-id="${esc(lesson.id)}">${done ? '已完成 ✓' : '标记为完成'}</button>
            </div>
            <nav class="lesson-pager" aria-label="章节翻页">
              ${prev ? `<button class="pager-link" type="button" data-route="lesson-${esc(prev.id)}" data-lesson-id="${esc(prev.id)}">${icons.left}<span><small>上一章 · ${esc(prev.num)}</small><strong>${esc(prev.short)}</strong></span></button>` : '<span class="pager-link is-disabled"><span><small>上一章</small><strong>已经是第一章</strong></span></span>'}
              ${next ? `<button class="pager-link next" type="button" data-route="lesson-${esc(next.id)}" data-lesson-id="${esc(next.id)}"><span><small>下一章 · ${esc(next.num)}</small><strong>${esc(next.short)}</strong></span>${icons.arrow}</button>` : '<span class="pager-link next is-disabled"><span><small>下一章</small><strong>课程结束</strong></span></span>'}
            </nav>
          </article>

          <aside class="lesson-rail">
            <div class="toc-card"><div class="rail-label"><span>ON THIS PAGE</span><span>${lesson.sections.length}</span></div><nav class="toc-list">${lesson.sections.map((section) => `<a class="toc-link" href="#section-${esc(section.id)}" data-toc="${esc(section.id)}">${esc(section.title)}</a>`).join('')}</nav></div>
            <div class="rail-card"><div class="rail-label"><span>KEY TERMS</span><span>${lesson.terms.length}</span></div><div class="term-list">${lesson.terms.map((term) => `<div class="term-row"><strong>${esc(term.term)}</strong><span>${esc(term.definition)}</span></div>`).join('')}</div></div>
            <div class="rail-card note-card"><div class="rail-label"><span>MY NOTES</span><span id="noteStatus">本机</span></div><textarea id="lessonNotes" placeholder="写下你的理解、疑问或想试的改动…" aria-label="本章学习笔记"></textarea></div>
          </aside>
        </div>
      </div>`;
    setBreadcrumb(['Module ' + lesson.num, lesson.short]);
    setActiveNav('lesson-' + lesson.id);
    document.title = lesson.title + ' · LangChain 互动学习站';
    state.lastLesson = lesson.id;
    saveState();
    updateProgressUI();
    afterLessonRender(lesson);
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  }

  function afterLessonRender(lesson) {
    enhanceCodeBlocks();
    bindQuiz(lesson);
    bindToc(lesson);
    bindNotes(lesson);
    if (window.initLabs) window.initLabs();
    if (pendingSection) {
      const target = pendingSection;
      pendingSection = null;
      setTimeout(() => document.getElementById('section-' + target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
    requestAnimationFrame(updateReadingProgress);
  }

  function highlight(code, language) {
    const lang = (language || '').toLowerCase();
    const keyword = 'tok-keyword', string = 'tok-string', comment = 'tok-comment', number = 'tok-number', fn = 'tok-function', decorator = 'tok-decorator';
    let regex;
    if (lang === 'python' || lang === 'py') {
      regex = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(@[\w.]+)|\b(def|class|return|from|import|as|if|else|elif|for|while|in|not|and|or|is|None|True|False|try|except|finally|with|lambda|yield|async|await|raise|pass|break|continue|global|nonlocal)\b|\b(\d+(?:\.\d+)?)\b|(\b(?:print|len|range|dict|list|str|int|float|bool|type|enumerate|zip)\b)/g;
    } else if (lang === 'json') {
      regex = /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g;
    } else if (lang === 'bash' || lang === 'shell') {
      regex = /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(python|pip|source|cd|export|uv|npm|git|node)\b/g;
    } else {
      return esc(code);
    }
    let output = '', last = 0;
    for (const match of code.matchAll(regex)) {
      output += esc(code.slice(last, match.index));
      const value = match[0];
      let klass = '';
      if (match[1]) klass = lang === 'json' ? fn : comment;
      else if (match[2]) klass = string;
      else if (match[3]) klass = lang === 'json' ? keyword : decorator;
      else if (match[4]) klass = lang === 'json' ? keyword : lang === 'bash' ? fn : keyword;
      else if (match[5]) klass = number;
      output += klass ? '<span class="' + klass + '">' + esc(value) + '</span>' : esc(value);
      last = match.index + value.length;
    }
    output += esc(code.slice(last));
    return output;
  }

  function enhanceCodeBlocks() {
    $$('.lesson-content pre').forEach((pre) => {
      if (pre.closest('.code-block')) return;
      const code = pre.querySelector('code');
      if (!code) return;
      const language = Array.from(code.classList).find((name) => name.startsWith('language-'))?.replace('language-', '') || 'text';
      const raw = code.textContent;
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block';
      pre.parentNode.insertBefore(wrapper, pre);
      const head = document.createElement('div');
      head.className = 'code-head';
      head.innerHTML = '<span class="code-lang">' + esc(language) + '</span><div class="code-actions"><button class="copy-code" type="button">复制</button></div>';
      wrapper.appendChild(head);
      wrapper.appendChild(pre);
      code.innerHTML = highlight(raw, language);
      head.querySelector('.copy-code').addEventListener('click', async (event) => {
        const button = event.currentTarget;
        try {
          if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(raw);
          else {
            const area = document.createElement('textarea');
            area.value = raw;
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
          }
          button.textContent = '已复制';
          toast('代码已复制到剪贴板');
          setTimeout(() => { button.textContent = '复制'; }, 1500);
        } catch (error) { toast('浏览器不允许复制，请手动选择'); }
      });
    });
  }
  function bindQuiz(lesson) {
    const quiz = $('[data-lesson-quiz]', app);
    if (!quiz) return;
    $$('.quiz-question', quiz).forEach((question) => {
      $$('.quiz-option', question).forEach((option) => {
        option.addEventListener('click', () => {
          if (question.dataset.answered === 'true') return;
          question.dataset.answered = 'true';
          const correct = Number(question.dataset.answer);
          const selected = Number(option.dataset.option);
          $$('.quiz-option', question).forEach((button) => {
            button.disabled = true;
            const value = Number(button.dataset.option);
            if (value === correct) button.classList.add('is-correct');
            if (value === selected && value !== correct) button.classList.add('is-wrong');
          });
          $('.quiz-explain', question).classList.add('is-visible');
          const answered = $$('.quiz-question', quiz).filter((item) => item.dataset.answered === 'true').length;
          const right = $$('.quiz-question', quiz).filter((item) => item.dataset.answered === 'true' && !item.querySelector('.quiz-option.is-wrong')).length;
          $('[data-quiz-score]', quiz).textContent = right + ' / ' + lesson.quiz.length;
          if (answered === lesson.quiz.length) {
            $('[data-quiz-score]', quiz).textContent = '得分 ' + right + ' / ' + lesson.quiz.length;
            toast(right === lesson.quiz.length ? '全部答对，漂亮。' : '已完成自测，回看解析再走一遍。');
          }
        });
      });
    });
  }

  function bindToc(lesson) {
    if (sectionObserver) sectionObserver.disconnect();
    const sections = $$('.lesson-section', app);
    const links = $$('.toc-link', app);
    if ('IntersectionObserver' in window) {
      sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => link.classList.toggle('is-active', link.dataset.toc === entry.target.dataset.section));
        });
      }, { rootMargin: '-18% 0px -65% 0px', threshold: 0 });
      sections.forEach((section) => sectionObserver.observe(section));
    }
    links.forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('section-' + link.dataset.toc)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  function bindNotes(lesson) {
    const notes = $('#lessonNotes');
    if (!notes) return;
    notes.value = state.notes[lesson.id] || '';
    notes.addEventListener('input', () => {
      state.notes[lesson.id] = notes.value;
      saveState();
      const status = $('#noteStatus');
      if (status) status.textContent = '已保存';
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => { if (status) status.textContent = '本机'; }, 1200);
    });
  }

  function updateReadingProgress() {
    const bar = $('#readingProgressBar');
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + '%';
    const content = $('#lessonContent');
    if (!content) return;
    const scrollBar = $('#lessonScrollBar');
    const scrollText = $('#lessonScrollText');
    if (!scrollBar) return;
    const start = content.getBoundingClientRect().top + window.scrollY;
    const length = Math.max(1, content.offsetHeight - window.innerHeight * .45);
    const value = Math.max(0, Math.min(100, Math.round(((window.scrollY - start + 120) / length) * 100)));
    if (!state.completed.includes(routeLessonId())) {
      scrollBar.style.width = value + '%';
      if (scrollText) scrollText.textContent = value + '%';
    }
  }

  function routeLessonId() {
    const route = location.hash.replace(/^#\/?/, '') || 'home';
    return route.startsWith('lesson-') ? route.slice(7) : null;
  }

  function route() {
    const raw = location.hash.replace(/^#\/?/, '') || 'home';
    if (raw === 'home') { renderHome(); return; }
    if (raw.startsWith('lesson-')) {
      const lesson = getLesson(raw.slice(7));
      if (lesson) { renderLesson(lesson); closeMenu(); return; }
    }
    location.hash = 'home';
  }

  function buildSearchIndex() {
    searchIndex = [];
    const plain = (html) => {
      const box = document.createElement('div');
      box.innerHTML = html || '';
      return box.textContent.replace(/\s+/g, ' ').trim();
    };
    lessons.forEach((lesson) => {
      searchIndex.push({ id: lesson.id, num: lesson.num, title: lesson.short + ' · ' + lesson.title, subtitle: lesson.tags.join(' · '), text: [lesson.title, lesson.lede, ...lesson.tags, ...lesson.objectives].join(' '), section: null });
      lesson.sections.forEach((section) => searchIndex.push({ id: lesson.id, num: lesson.num, title: section.title, subtitle: lesson.short + ' · ' + section.kicker, text: [section.title, section.kicker, plain(section.html), ...lesson.tags].join(' '), section: section.id }));
    });
  }

  function openSearch() {
    const overlay = $('#searchOverlay');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    const input = $('#searchInput');
    input.value = '';
    renderSearch('');
    setTimeout(() => input.focus(), 60);
  }

  function closeSearch() {
    const overlay = $('#searchOverlay');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    $('#searchInput').blur();
  }

  function renderSearch(query) {
    const normalized = query.trim().toLowerCase();
    let items;
    if (!normalized) {
      items = searchIndex.filter((item) => !item.section).slice(0, 8);
      $('#searchMeta').textContent = '输入关键词，或直接选择一个章节。';
    } else {
      items = searchIndex.map((item) => {
        const haystack = (item.title + ' ' + item.subtitle + ' ' + item.text).toLowerCase();
        let score = 0;
        normalized.split(/\s+/).filter(Boolean).forEach((word) => { if (haystack.includes(word)) score += item.title.toLowerCase().includes(word) ? 4 : 1; });
        return { item, score };
      }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 12).map((entry) => entry.item);
      $('#searchMeta').textContent = items.length ? '找到 ' + items.length + ' 个相关结果。' : '没有找到匹配内容，试试“RAG”“Agent”或“结构化输出”。';
    }
    searchResults = items;
    searchSelection = 0;
    const container = $('#searchResults');
    if (!items.length) {
      container.innerHTML = '<div class="search-empty">换一个关键词试试。中文概念、英文类名和章节号都可以搜索。</div>';
      return;
    }
    container.innerHTML = items.map((item, index) => `<button class="search-result ${index === 0 ? 'is-selected' : ''}" type="button" data-search-index="${index}"><span class="search-result-num">${item.section ? '§' : esc(item.num)}</span><span class="search-result-copy"><strong>${esc(item.title)}</strong><span>${esc(item.subtitle)}</span></span></button>`).join('');
    $$('.search-result', container).forEach((button) => button.addEventListener('click', () => openSearchResult(Number(button.dataset.searchIndex))));
  }

  function openSearchResult(index) {
    const item = searchResults[index];
    if (!item) return;
    const sameLesson = routeLessonId() === item.id;
    closeSearch();
    if (item.section) pendingSection = item.section;
    location.hash = 'lesson-' + item.id;
    if (sameLesson && item.section) {
      pendingSection = null;
      setTimeout(() => document.getElementById('section-' + item.section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }

  function moveSearchSelection(direction) {
    if (!searchResults.length) return;
    searchSelection = (searchSelection + direction + searchResults.length) % searchResults.length;
    $$('.search-result').forEach((button, index) => button.classList.toggle('is-selected', index === searchSelection));
    $$('.search-result')[searchSelection]?.scrollIntoView({ block: 'nearest' });
  }

  function closeMenu() {
    document.body.classList.remove('nav-open');
    $('#menuButton')?.setAttribute('aria-expanded', 'false');
  }

  function toggleComplete(lessonId) {
    const isDone = state.completed.includes(lessonId);
    if (isDone) state.completed = state.completed.filter((id) => id !== lessonId);
    else state.completed.push(lessonId);
    state.lastLesson = lessonId;
    saveState();
    const lesson = getLesson(lessonId);
    const button = $('#completeLesson');
    if (button) {
      button.classList.toggle('is-done', !isDone);
      button.textContent = !isDone ? '已完成 ✓' : '标记为完成';
      const stat = $('.sidecard-stat:last-child strong');
      if (stat) stat.textContent = !isDone ? '100%' : '0%';
      const bar = $('#lessonScrollBar'); if (bar) bar.style.width = !isDone ? '100%' : '0%';
      const text = $('#lessonScrollText'); if (text) text.textContent = !isDone ? '完成' : '0%';
      const title = $('.lesson-finish h3');
      if (title) title.textContent = !isDone ? '这一章已经留下标记。' : '这一章学完了吗？';
    }
    updateProgressUI();
    toast(!isDone ? '已标记完成 · ' + lesson.num : '已取消完成标记');
  }

  function resetProgress() {
    if (!window.confirm('确定要清空所有章节进度和学习笔记吗？')) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('lc-atlas-checklist');
    } catch (error) {}
    state = { ...defaultState, completed: [], notes: {} };
    renderSidebar();
    route();
    toast('进度已重置');
  }

  function bindGlobal() {
    document.addEventListener('click', (event) => {
      const routeEl = event.target.closest('[data-route]');
      if (routeEl) {
        event.preventDefault();
        if (routeEl.dataset.route) location.hash = routeEl.dataset.route;
        closeMenu();
        return;
      }
      const scrollEl = event.target.closest('[data-scroll]');
      if (scrollEl) {
        event.preventDefault();
        document.querySelector(scrollEl.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (event.target.closest('#completeLesson')) {
        toggleComplete(event.target.closest('#completeLesson').dataset.lessonId);
        return;
      }
      if (event.target.closest('#menuButton')) {
        const open = document.body.classList.toggle('nav-open');
        $('#menuButton').setAttribute('aria-expanded', String(open));
        return;
      }
      if (event.target.closest('#sidebarBackdrop')) closeMenu();
      if (event.target.closest('#themeToggle')) {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem('lc-atlas-theme', next); } catch (error) {}
        return;
      }
      if (event.target.closest('#resetProgress')) resetProgress();
      if (event.target.closest('#searchTrigger')) openSearch();
      if (event.target.closest('#searchClose')) closeSearch();
      if (event.target.closest('#searchOverlay') === event.target) closeSearch();
      if (event.target.closest('#continueButton')) {
        const target = continueTarget();
        if (target) location.hash = 'lesson-' + target;
      }
    });

    document.addEventListener('input', (event) => {
      if (event.target.id === 'searchInput') renderSearch(event.target.value);
    });

    document.addEventListener('keydown', (event) => {
      const overlayOpen = $('#searchOverlay').classList.contains('is-open');
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        overlayOpen ? closeSearch() : openSearch();
        return;
      }
      if (event.key === 'Escape') {
        if (overlayOpen) closeSearch();
        closeMenu();
        return;
      }
      if (overlayOpen) {
        if (event.key === 'ArrowDown') { event.preventDefault(); moveSearchSelection(1); }
        if (event.key === 'ArrowUp') { event.preventDefault(); moveSearchSelection(-1); }
        if (event.key === 'Enter') { event.preventDefault(); openSearchResult(searchSelection); }
        return;
      }
      if (event.key === '/' && !/input|textarea|select/i.test(document.activeElement?.tagName || '')) {
        event.preventDefault();
        openSearch();
      }
    });

    window.addEventListener('hashchange', route);
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress);
  }

  function boot() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    renderSidebar();
    buildSearchIndex();
    bindGlobal();
    route();
  }

  boot();
})();