'use strict';
(() => {
  const data = window.PORTFOLIO;
  if (!data) return;
  const $ = selector => document.querySelector(selector);
  const byId = id => data.evidence.find(item => item.id === id);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Escapes HTML and glues number groups ("2 131 112", "406,3 тис.") with no-break spaces so figures never wrap.
  const esc = value => String(value)
    .replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]))
    .replace(/(\d) (?=\d|тис\.|млн|с[\s.,]|с$)/g, '$1&nbsp;');
  const fill = (selector, html) => { const el = $(selector); if (el) el.innerHTML = html; };
  // Edit version only (window.PORTFOLIO_EDIT): data-edit="path.in.content" marks a text the client can change.
  const EDIT = !!window.PORTFOLIO_EDIT;
  const E = key => EDIT ? ` data-edit="${key}"` : '';
  const text = (selector, value, key) => { const el = $(selector); if (!el) return; el.textContent = value; if (key && EDIT) el.dataset.edit = key; };

  // Animated metric: counts from 0 to n, ends on the exact display text from the screenshot.
  const fmt = (n, dec) => n.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const counter = metric => `<span class="count" data-n="${metric.n}" data-dec="${metric.dec}" data-suffix="${esc(metric.suffix)}" data-final="${esc(metric.display)}">${esc(metric.display)}</span>`;
  const runCount = el => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const n = Number(el.dataset.n), dec = Number(el.dataset.dec), suffix = el.dataset.suffix, final = el.dataset.final;
    if (reduceMotion) { el.textContent = final; return; }
    const t0 = performance.now(), dur = 1100;
    const step = now => {
      const p = Math.min(1, Math.max(0, (now - t0) / dur)), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = p < 1 ? fmt(n * eased, dec) + suffix : final;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const shotLink = (id, inner, cls = 'shot') => `<a class="${cls}" href="${esc(byId(id).path)}" data-evidence="${id}" title="Відкрити скриншот ${id}">${inner}</a>`;
  const srcTag = id => shotLink(id, `скрин ${id} ↗`, 'src');

  // 1. Intro
  const {profile} = data;
  const [hello, ...rest] = profile.greeting.split('. ');
  const lead = rest.join('. ').split(': ')[0] + ':';
  // Title with a lime highlight; the kaomoji part never breaks inside itself.
  const title = profile.helloTitle || hello + '.';
  const tm = title.match(/^(.*?)\s*(\(.*)$/);
  fill('#hello', `<span class="hello-mark"${E('profile.helloTitle')}>${tm ? `${esc(tm[1])} <span class="kaomoji">${esc(tm[2])}</span>` : esc(title)}</span>`);
  text('#portrait-name', profile.latin, 'profile.latin');
  if (profile.photo) { $('#portrait').src = profile.photo.src; $('#portrait').alt = profile.photo.alt; }
  text('#hero-lead', lead, 'profile.greeting:lead');
  fill('#networks', profile.networks.map((n, i) => `<li${E(`profile.networks.${i}`)}>${esc(n)}</li>`).join(''));
  $('#hero-contact').href = data.contact.instagram;
  $('#hero-contact').target = '_blank';
  $('#hero-contact').rel = 'noopener';
  const extLink = (l, key) => l.evidence
    ? shotLink(l.evidence, `<span${E(key + '.label')}>${esc(l.label)}</span> ↗`, 'ext')
    : `<a class="ext" href="${esc(l.href)}" target="_blank" rel="noopener"><span${E(key + '.label')}>${esc(l.label)}</span> ↗</a>${l.note ? `<span class="ext-note"${E(key + '.note')}>${esc(l.note)}</span>` : ''}`;

  // Experience (integrated CV, first person)
  const ex = data.experience, cur = ex.current;
  fill('#exp-current', `
    <div class="feature-head">
      <span class="years years-lime"${E('experience.current.years')}>${esc(cur.years)}</span>
      <div><h3${E('experience.current.org')}>${esc(cur.org)}</h3><p class="role"${E('experience.current.role')}>${esc(cur.role)}</p></div>
    </div>
    <div class="feature-body">
      <ul class="tasks">${cur.tasks.map((t, i) => `<li><span${E(`experience.current.tasks.${i}.text`)}>${esc(t.text)}</span>${t.links ? `<ul class="ext-list">${t.links.map((l, j) => `<li>${extLink(l, `experience.current.tasks.${i}.links.${j}`)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ul>
      <div class="feature-side">
        <div><h4 class="mini-title"${E('experience.current.liveTitle')}>${esc(cur.liveTitle || 'Прямі трансляції')}</h4><ul class="chips">${cur.live.map((c, i) => `<li${E(`experience.current.live.${i}`)}>${esc(c)}</li>`).join('')}</ul></div>
        <div><h4 class="mini-title"${E('page.artistsTitle')}>Формати з артистами</h4><ul class="chips">${cur.artists.map((c, i) => `<li${E(`experience.current.artists.${i}`)}>${esc(c)}</li>`).join('')}</ul></div>
        <div><h4 class="mini-title"${E('page.audiencesTitle')}>Аудиторії</h4><ul class="chips">${cur.audiences.map((c, i) => `<li${E(`experience.current.audiences.${i}`)}>${esc(c)}</li>`).join('')}</ul></div>
      </div>
    </div>
    ${cur.design ? `
    <div class="design">
      <div class="design-head">
        <h4 class="mini-title"${E('experience.current.design.title')}>${esc(cur.design.title)}</h4>
        <p${E('experience.current.design.text')}>${esc(cur.design.text)}</p>
        <p>${cur.design.links.map((l, j) => extLink(l, `experience.current.design.links.${j}`)).join(' ')}</p>
      </div>
      <h4 class="mini-title"${E('experience.current.design.coversTitle')}>${esc(cur.design.coversTitle)}</h4>
      <ul class="covers">${cur.design.covers.map((c, i) => `<li><a class="cover" href="${esc(c.src)}" data-cover="${i}" aria-label="Обкладинка ${esc(c.title)} — збільшити"><img loading="lazy" src="${esc(c.src)}" width="960" height="540" alt="Обкладинка для YouTube: ${esc(c.title)}"></a></li>`).join('')}</ul>
    </div>` : ''}`);
  fill('#exp-previous', ex.previous.map((p, i) => `
    <article class="card exp-card">
      <span class="years"${E(`experience.previous.${i}.years`)}>${esc(p.years)}</span>
      <h3${E(`experience.previous.${i}.org`)}>${esc(p.org)}</h3>
      <p class="kind"${E(`experience.previous.${i}.kind`)}>${esc(p.kind)}</p>
      <p${E(`experience.previous.${i}.role`)}>${esc(p.role)}</p>
      ${p.stat ? `<div class="exp-stat"><p${E(`experience.previous.${i}.stat.text`)}>${esc(p.stat.text)}</p>${p.stat.note ? `<p class="fine"${E(`experience.previous.${i}.stat.note`)}>${esc(p.stat.note)}</p>` : ''}<p>${p.stat.sources.map(srcTag).join(' ')}</p></div>` : ''}
    </article>`).join(''));
  fill('#education', ex.education.map((e, i) => `<li><span class="years"${E(`experience.education.${i}.years`)}>${esc(e.years)}</span><span${E(`experience.education.${i}.text`)}>${esc(e.text)}</span></li>`).join(''));
  fill('#skills', ex.skills.map((s, i) => `<li${E(`experience.skills.${i}`)}>${esc(s)}</li>`).join(''));
  text('#earlier', ex.earlier, 'experience.earlier');

  // 2. Audience before / after
  text('#audience-caveat', data.audience.caveat, 'audience.caveat');
  fill('#audience-pairs', data.audience.pairs.map(p => {
    const w = Math.round(p.before.n / p.after.n * 100);
    return `
    <article class="card pair">
      <div class="pair-head"><h3>${esc(p.platform)}</h3><span${E(`audience.pairs.${data.audience.pairs.indexOf(p)}.unit`)}>${esc(p.unit)}</span></div>
      <div class="pair-row">
        <span class="pair-label">До</span>
        <div class="bar"><span class="bar-fill bar-before" style="--w:${w}%"></span></div>
        ${shotLink(p.before.source, counter(p.before), 'pair-num')}
      </div>
      <div class="pair-row">
        <span class="pair-label pair-label-after">Після</span>
        <div class="bar"><span class="bar-fill bar-after" style="--w:100%"></span></div>
        ${shotLink(p.after.source, counter(p.after), 'pair-num pair-num-after')}
      </div>
      <p class="pair-src">${srcTag(p.before.source)} ${srcTag(p.after.source)}</p>
    </article>`;
  }).join(''));

  // 3. Video case: platform tabs, each tab shows its own number (no totals across platforms)
  const vc = data.videoCase;
  text('#video-case-title', vc.title, 'videoCase.title');
  text('#video-intro', vc.intro, 'videoCase.intro');
  text('#video-match', vc.match, 'videoCase.match');
  const tabs = $('#case-tabs'), panel = $('#case-panel');
  let active = 0;
  tabs.innerHTML = vc.items.map((v, i) => `<button type="button" role="tab" id="case-tab-${i}" aria-controls="case-panel"><span class="tab-platform">${esc(v.platform)} · ${esc(v.format)}</span><span class="tab-value">${esc(v.metric.display)}</span><span class="tab-label">${esc(v.valueLabel)}</span></button>`).join('');
  const showCase = (i, focus = false) => {
    active = i;
    const v = vc.items[i];
    tabs.querySelectorAll('button').forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
    panel.setAttribute('aria-labelledby', `case-tab-${i}`);
    panel.innerHTML = `
      <div class="case-main">
        <p class="case-platform">${esc(v.platform)} · ${esc(v.format)}</p>
        <p class="case-big">${shotLink(v.source, counter(v.metric), 'case-num')}<span>${esc(v.valueLabel)}</span></p>
        <ul class="stat-tiles">${v.stats.map((s, k) => `<li><strong>${esc(s.v)}</strong><span${E(`videoCase.items.${i}.stats.${k}.l`)}>${esc(s.l)}</span></li>`).join('')}</ul>
        ${v.note || EDIT ? `<p class="note"${E(`videoCase.items.${i}.note`)}>${esc(v.note || '')}</p>` : ''}
        <p class="case-links">${srcTag(v.source)}${v.link ? `<a class="src src-dark" href="${esc(v.link.href)}" target="_blank" rel="noopener">${esc(v.link.label)} ↗</a>` : ''}</p>
      </div>
      ${shotLink(v.source, `<img src="${esc(byId(v.source).path)}" alt="Статистика: ${esc(byId(v.source).title)}">`, 'phone')}`;
    panel.querySelectorAll('.count').forEach(runCount);
    if (focus) tabs.children[i].focus();
  };
  tabs.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => showCase(i)));
  tabs.addEventListener('keydown', e => {
    const n = vc.items.length;
    const next = {ArrowRight: (active + 1) % n, ArrowDown: (active + 1) % n, ArrowLeft: (active - 1 + n) % n, ArrowUp: (active - 1 + n) % n, Home: 0, End: n - 1}[e.key];
    if (next === undefined) return;
    e.preventDefault();
    showCase(next, true);
  });
  showCase(0);

  // Contact: Instagram + email. The address is also plain selectable text with a copy button,
  // because mailto: links do not open everywhere (e.g. inside an embedded viewer).
  const c = data.contact;
  fill('#contact-content', `
    <a class="btn btn-lime" href="${esc(c.instagram)}" target="_blank" rel="noopener">${esc(c.label)} ${esc(c.handle)} ↗</a>
    ${c.email ? `<div class="mail"><a class="mail-addr" href="mailto:${esc(c.email)}">${esc(c.email)}</a><button type="button" class="mail-copy">Скопіювати</button></div>` : ''}`);
  const copyBtn = $('.mail-copy');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    const done = () => { copyBtn.textContent = 'Скопійовано'; setTimeout(() => { copyBtn.textContent = 'Скопіювати'; }, 1800); };
    const select = () => { const r = document.createRange(); r.selectNodeContents($('.mail-addr')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copyBtn.textContent = 'Виділено — Ctrl+C'; };
    try { navigator.clipboard.writeText(c.email).then(done, select); } catch { select(); }
  });

  // Animate metrics and bars once they are on screen.
  const animated = document.querySelectorAll('.count, .bar-fill');
  if ('IntersectionObserver' in window && !reduceMotion) {
    document.body.classList.add('js-anim');
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.classList.contains('count')) runCount(el); else el.classList.add('in');
      io.unobserve(el);
    }), {threshold: .3});
    animated.forEach(el => {
      if (el.classList.contains('count')) { if (el.dataset.done) return; el.textContent = fmt(0, Number(el.dataset.dec)) + el.dataset.suffix; }
      io.observe(el);
    });
  }

  // Screenshot viewer (modal). Escape closes natively; focus returns to the opener.
  const dialog = $('#evidence-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  let opener = null;
  const openView = (a, {kind, title, src, alt, description, original}) => {
    opener = a;
    text('#dialog-kind', kind);
    text('#dialog-title', title);
    const img = $('#dialog-image');
    img.src = src;
    img.alt = alt;
    text('#dialog-description', description);
    $('#dialog-original').href = encodeURI(original);
    dialog.showModal();
  };
  document.addEventListener('click', event => {
    const cover = event.target.closest('[data-cover]');
    if (cover) {
      const c = cur.design.covers[Number(cover.dataset.cover)];
      if (!c) return;
      event.preventDefault();
      openView(cover, {kind: 'Обкладинка для YouTube', title: c.title, src: c.src, alt: `Обкладинка: ${c.title}`, description: 'Моя робота як дизайнерки для YouTube-каналу Євробачення Україна.', original: c.original});
      return;
    }
    const a = event.target.closest('[data-evidence]');
    if (!a) return;
    const e = byId(a.dataset.evidence);
    if (!e) return;
    event.preventDefault();
    openView(a, {kind: 'Скриншот', title: `${e.id} · ${e.title}`, src: e.path, alt: e.title, description: e.description, original: e.path});
  });
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus({preventScroll: true}); });
})();
