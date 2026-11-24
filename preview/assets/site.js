/* Aziz Almalki — site renderer.
   All content comes from data/site.json. Anything unpublished, empty or
   missing is simply not rendered, so visitors never see a placeholder. */
(() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.remove('no-js');
  const L = doc.lang === 'en' ? 'en' : 'ar';
  const ROOT = document.body.dataset.root || '';
  const NS = 'azizalmalki-site';
  const COUNTER = 'https://abacus.jasoncameron.dev';

  const UI = {
    ar: { works: 'أعمال مختارة', worksSub: 'مختارات من البرامج التي قدّمتها.', view: 'تفاصيل العمل', marketing: 'الإعلام والتسويق', career: 'المسيرة المهنية', edu: 'الشهادات والتكوين', about: 'نبذة عني', contact: 'لنعمل معًا', contactLead: 'متاح لتقديم البرامج والفعاليات، والتقارير والمقابلات، وإنتاج المحتوى. أسرع طريقة للتواصل هي واتساب.', collabTitle: 'مجالات التعاون', wa: 'راسلني واتساب', email: 'البريد الإلكتروني', ig: 'إنستغرام', li: 'لينكدإن', seeWorks: 'مشاهدة أعمالي', reel: 'الفيديو التعريفي', cv: 'تحميل السيرة الذاتية', talk: 'تواصل معي', type: 'النوع', producer: 'الجهة', year: 'السنة', role: 'دوري', tools: 'الأدوات', resp: 'المسؤوليات', videos: 'الفيديوهات', photos: 'الصور', watch: 'مشاهدة العمل كاملًا', impact: 'الأثر', close: 'إغلاق', prev: 'العمل السابق', next: 'العمل التالي', play: 'تشغيل', onCam: 'أمام الكاميرا', like: 'عجبني', liked: 'شكرًا لك', since: 'منذ', menu: 'القائمة', zoom: 'تكبير الصورة', rights: 'جميع الحقوق محفوظة' },
    en: { works: 'Selected Works', worksSub: 'A selection of programmes I have presented.', view: 'View project', marketing: 'Media & Marketing', career: 'Career Journey', edu: 'Certifications & Education', about: 'About Me', contact: "Let's work together", contactLead: 'Available for TV and event presenting, reports and interviews, and content production. WhatsApp is the quickest way to reach me.', collabTitle: 'Areas of collaboration', wa: 'Message on WhatsApp', email: 'Email', ig: 'Instagram', li: 'LinkedIn', seeWorks: 'View my work', reel: 'Watch showreel', cv: 'Download CV', talk: 'Get in touch', type: 'Type', producer: 'Produced by', year: 'Year', role: 'My role', tools: 'Tools', resp: 'Responsibilities', videos: 'Videos', photos: 'Photos', watch: 'Watch the full work', impact: 'Impact', close: 'Close', prev: 'Previous project', next: 'Next project', play: 'Play', onCam: 'On camera', like: 'Like', liked: 'Thank you', since: 'Since', menu: 'Menu', zoom: 'Enlarge image', rights: 'All rights reserved' }
  }[L];

  const $ = (s, r = document) => r.querySelector(s);
  const T = o => (o && typeof o === 'object' ? (o[L] || '') : (o || '')).toString().trim();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const url = p => (!p ? '' : /^(https?:)?\//.test(p) ? p : ROOT + p);
  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.7-2-1-1 .9a5 5 0 0 1-2.7-2.7l.9-1-1-2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg>',
    li: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.3 3.8 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.4 0 5.6 3.3 4.4 6.7C19.5 15.4 12 20 12 20z"/></svg>'
  };

  // images: "img/name" -> responsive webp set; anything with an extension is used as-is
  const SIZES = { 'img/aziz': [480, 800, 1200] };
  function pic(path, alt, sizes, cls, eager) {
    if (!path) return '';
    const load = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
    if (/\.\w{3,4}$/.test(path)) return `<img src="${esc(url(path))}" alt="${esc(alt)}" ${load}${cls ? ` class="${cls}"` : ''}>`;
    const ws = SIZES[path] || [480, 900];
    const set = ws.map(w => `${url(path)}-${w}.webp ${w}w`).join(', ');
    return `<img src="${esc(url(path))}-${ws[ws.length - 1]}.webp" srcset="${esc(set)}" sizes="${sizes}" alt="${esc(alt)}" ${load}${cls ? ` class="${cls}"` : ''}>`;
  }
  const bigSrc = p => /\.\w{3,4}$/.test(p) ? url(p) : `${url(p)}-${(SIZES[p] || [480, 900]).slice(-1)[0]}.webp`;

  // privacy-friendly counters (no cookies, no personal data)
  const hit = key => { try { fetch(`${COUNTER}/hit/${NS}/${key}`, { cache: 'no-store', keepalive: true }).catch(() => {}); } catch (e) {} };

  let D, projects = [], current = -1;

  fetch(`${ROOT}data/site.json`, { cache: 'no-cache' }).then(r => r.json()).then(d => { D = d; render(); }).catch(() => {});

  function render() {
    const P = D.profile, C = D.contact || {};
    projects = (D.projects || []).filter(p => p.published && T(p.title)).sort((a, b) => (a.order || 99) - (b.order || 99));
    const cats = D.categories || [];
    const catName = id => T((cats.find(c => c.id === id) || {}));

    /* hero (static markup is the fallback; data refines it) */
    if (T(P.intro)) $('#hero-intro').textContent = T(P.intro);
    const ctas = [];
    if (projects.length) ctas.push(`<a class="btn primary" href="#works">${UI.seeWorks}</a>`);
    if (P.showreel && P.showreel.published && P.showreel.video) ctas.push(`<button class="btn ghost" type="button" id="reel-btn">${ICON.play.replace('<svg', '<svg fill="currentColor"')}${UI.reel}</button>`);
    if (P.cv && P.cv.published && P.cv.file) ctas.push(`<a class="btn ghost" href="${esc(url(P.cv.file))}" download data-track="cv_download">${ICON.dl}${UI.cv}</a>`);
    ctas.push(`<a class="btn ghost" href="#contact">${UI.talk}</a>`);
    $('#hero-ctas').innerHTML = ctas.join('');

    const main = $('#content');
    let html = '', n = 0;
    const num = () => String(++n).padStart(2, '0');
    const nav = [];

    /* selected works */
    const featured = projects.filter(p => p.featured);
    if (featured.length) {
      nav.push(['works', UI.works]);
      html += `<section class="sec" id="works" aria-labelledby="h-works"><div class="wrap">
        <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-works">${UI.works}</h2><p>${UI.worksSub}</p></div>
        <div class="works">${featured.map((p, i) => workCard(p, i === 0 && featured.length > 2)).join('')}</div></div></section>`;
    }

    /* category sections: only items not already featured; hidden when empty */
    cats.forEach(c => {
      const items = projects.filter(p => p.category === c.id && !p.featured);
      if (!items.length) return;
      const id = 'cat-' + c.id;
      nav.push([id, T(c.sectionTitle) || T(c)]);
      html += `<section class="sec" id="${id}" aria-labelledby="h-${id}"><div class="wrap">
        <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-${id}">${esc(T(c.sectionTitle) || T(c))}</h2></div>
        <div class="list rv">${items.map(p => `<button type="button" class="item" data-open="${esc(p.id)}"><b>${esc(T(p.title))}</b><span>${esc([T(p.type), T(p.role)].filter(Boolean).join(' · '))}</span><span>${esc(p.year || '')}</span></button>`).join('')}</div></div></section>`;
    });

    /* media & marketing */
    const M = D.marketing;
    if (M && M.published && T(M.role)) {
      nav.push(['marketing', UI.marketing]);
      const areas = (M.areas && M.areas[L]) || [];
      html += `<section class="sec dark" id="marketing" aria-labelledby="h-mk"><div class="wrap">
        <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-mk">${UI.marketing}</h2></div>
        <div class="mk"><div class="rv"><p class="role">${esc(T(M.role))}</p><p class="org">${esc(T(M.org))}${M.since ? ` · ${UI.since} ${esc(M.since)}` : ''}</p>${T(M.summary) ? `<p class="sum">${esc(T(M.summary))}</p>` : ''}</div>
        ${areas.length ? `<ul class="areas rv">${areas.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}</div></div></section>`;
    }

    /* career */
    const tl = (D.timeline || []).filter(x => T(x.title));
    if (tl.length) {
      nav.push(['career', UI.career]);
      html += `<section class="sec" id="career" aria-labelledby="h-career"><div class="wrap">
        <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-career">${UI.career}</h2></div>
        <ol class="tl rv">${tl.map(x => `<li><span class="y">${esc(x.year || '')}</span><h3>${esc(T(x.title))}</h3>${T(x.text) ? `<p>${esc(T(x.text))}</p>` : ''}</li>`).join('')}</ol></div></section>`;
    }

    /* education */
    const ed = (D.education || []).filter(x => T(x.title));
    if (ed.length) {
      html += `<section class="sec" id="education" aria-labelledby="h-edu"><div class="wrap">
        <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-edu">${UI.edu}</h2></div>
        <ul class="edu rv">${ed.map(x => `<li><span class="k">${esc(T(x.kind))}</span><h3>${esc(T(x.title))}</h3><p>${esc([T(x.org), x.year].filter(Boolean).join(' · '))}</p></li>`).join('')}</ul></div></section>`;
    }

    /* about */
    const ab = (D.about && D.about[L]) || [];
    if (ab.length) {
      nav.push(['about', UI.about]);
      html += `<section class="sec" id="about" aria-labelledby="h-about"><div class="wrap">
        <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-about">${UI.about}</h2></div>
        <div class="about"><figure class="rv-img">${pic('img/portrait-oud', T(P.name), '(max-width:860px) 360px, 30vw')}</figure>
        <div class="story rv">${ab.map(p => `<p>${esc(p)}</p>`).join('')}</div></div></div></section>`;
    }

    /* contact */
    nav.push(['contact', UI.talk]);
    const ch = [];
    if (C.whatsapp) ch.push(`<a class="btn primary" href="https://wa.me/${esc(C.whatsapp)}" target="_blank" rel="noopener" data-track="contact_whatsapp">${ICON.wa}${UI.wa}</a>`);
    if (C.email) ch.push(`<a class="btn ghost" href="mailto:${esc(C.email)}" data-track="contact_email">${ICON.mail}<span dir="ltr">${esc(C.email)}</span></a>`);
    if (C.instagram) ch.push(`<a class="btn ghost" href="https://instagram.com/${esc(C.instagram)}" target="_blank" rel="noopener" data-track="contact_instagram">${ICON.ig}${UI.ig}</a>`);
    if (C.linkedin) ch.push(`<a class="btn ghost" href="${esc(C.linkedin)}" target="_blank" rel="noopener" data-track="contact_linkedin">${ICON.li}${UI.li}</a>`);
    const collab = (D.collaboration && D.collaboration[L]) || [];
    html += `<section class="sec dark" id="contact" aria-labelledby="h-contact"><div class="wrap">
      <div class="contact"><div class="rv"><h2 id="h-contact">${UI.contact}</h2><p class="lead">${UI.contactLead}</p><div class="channels">${ch.join('')}</div></div>
      ${collab.length ? `<div class="rv"><p class="sec-num" style="padding:0 0 10px">${UI.collabTitle}</p><ul class="collab">${collab.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}</div>
      <div class="foot"><span>© ${new Date().getFullYear()} ${esc(T(P.name))}</span><span>${esc(T(P.location))}</span>
      <button type="button" class="like" id="like" aria-pressed="false">${ICON.heart}<span>${UI.like}</span></button></div></div></section>`;

    main.innerHTML = html;
    $('#nav').innerHTML = nav.map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join('');
    wire();
    openFromHash();
  }

  function workCard(p, lead) {
    const meta = [T(p.type), T(p.producer)].filter(Boolean).join(' · ');
    const frame = p.cover
      ? `<div class="frame rv-img">${pic(p.cover, T(p.title), lead ? '(max-width:600px) 100vw, 50vw' : '(max-width:600px) 100vw, (max-width:980px) 50vw, 33vw')}</div>`
      : `<div class="frame type"><span class="tag">${esc(T(p.role) || T(p.type))}</span><span class="big">${esc(T(p.title))}</span><span><span class="rule" style="display:block"></span><span class="tag" style="display:block;margin-top:12px;color:#A39D93">${esc(meta)}</span></span></div>`;
    return `<button type="button" class="work rv${lead ? ' lead' : ''}" data-open="${esc(p.id)}" aria-label="${esc(T(p.title) + ' — ' + UI.view)}">
      ${frame}
      <div class="info"><div><h3>${esc(T(p.title))}</h3><p class="sub">${esc([T(p.role), T(p.type)].filter(Boolean).join(' · '))}</p></div>${p.year ? `<span class="yr">${esc(p.year)}</span>` : ''}</div>
      <span class="more">${UI.view} ${ICON.arrow}</span></button>`;
  }

  /* ---------- case study ---------- */
  const dlg = $('#case');
  function openCase(id, push = true) {
    const i = projects.findIndex(p => p.id === id);
    if (i < 0) return;
    current = i;
    const p = projects[i];
    const cat = (D.categories || []).find(c => c.id === p.category);
    const facts = [[UI.type, T(p.type)], [UI.producer, T(p.producer)], [UI.year, p.year], [UI.role, T(p.role)], [UI.tools, (p.tools || []).join('، ')]].filter(f => f[1]);
    const resp = (p.responsibilities && p.responsibilities[L]) || [];
    const vids = (p.videos || []).filter(v => v.src);
    const gal = (p.gallery || []).filter(Boolean);
    $('#case-body').innerHTML = `
      <div class="case-in">
        ${p.onCamera ? `<span class="badge">${UI.onCam}</span>` : ''}
        <h2 id="case-title" style="margin-top:12px">${esc(T(p.title))}</h2>
        ${T(p.summary) ? `<p class="lede">${esc(T(p.summary))}</p>` : ''}
        ${facts.length ? `<dl class="facts">${facts.map(f => `<div><dt>${f[0]}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>` : ''}
        ${resp.length ? `<h3>${UI.resp}</h3><ul class="resp">${resp.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
        ${T(p.impact) ? `<h3>${UI.impact}</h3><p>${esc(T(p.impact))}</p>` : ''}
        ${vids.length ? `<h3>${UI.videos}</h3><div class="vids">${vids.map((v, k) => `<figure><div class="v${v.orientation === 'horizontal' ? ' h' : ''}">
            <button type="button" class="play" data-vid="${k}" aria-label="${esc(UI.play + ' — ' + (T(v.title) || T(p.title)))}">${v.poster ? `<img src="${esc(url(v.poster))}" alt="" loading="lazy">` : ''}<span>${ICON.play}</span></button>
          </div>${T(v.title) ? `<figcaption>${esc(T(v.title))}</figcaption>` : ''}</figure>`).join('')}</div>` : ''}
        ${gal.length ? `<h3>${UI.photos}</h3><div class="gal">${gal.map(g => `<button type="button" data-zoom="${esc(bigSrc(g))}" aria-label="${UI.zoom}">${pic(g, T(p.title), '(max-width:600px) 50vw, 220px')}</button>`).join('')}</div>` : ''}
        ${p.link ? `<p style="margin-top:30px"><a class="btn primary" href="${esc(p.link)}" target="_blank" rel="noopener">${UI.watch} ${ICON.arrow}</a></p>` : ''}
        ${projects.length > 1 ? `<nav class="case-nav" aria-label="${UI.works}"><button type="button" data-step="-1">${UI.prev}</button><button type="button" data-step="1">${UI.next}</button></nav>` : ''}
      </div>`;
    $('#case-cat').textContent = cat ? T(cat) : '';
    dlg.querySelectorAll('.play').forEach(b => b.addEventListener('click', () => {
      const v = vids[+b.dataset.vid];
      const el = document.createElement('video');
      el.src = url(v.src); el.controls = true; el.playsInline = true; el.preload = 'auto';
      if (v.poster) el.poster = url(v.poster);
      el.setAttribute('aria-label', T(v.title) || T(p.title));
      b.replaceWith(el); el.play().catch(() => {});
      hit('video_' + p.id + '_' + b.dataset.vid);
    }));
    dlg.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => {
      const j = (current + +b.dataset.step + projects.length) % projects.length;
      openCase(projects[j].id); dlg.scrollTop = 0;
    }));
    dlg.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => zoom(b.dataset.zoom)));
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    if (push) history.replaceState(null, '', '#work/' + p.id);
    hit('project_' + p.id);
  }
  function closeCase() {
    dlg.querySelectorAll('video').forEach(v => v.pause());
    if (dlg.open) dlg.close();
  }
  dlg.addEventListener('close', () => { if (location.hash.startsWith('#work/')) history.replaceState(null, '', location.pathname + location.search); });
  $('#case-close').addEventListener('click', closeCase);
  dlg.addEventListener('click', e => { if (e.target === dlg) closeCase(); });
  function openFromHash() { const m = location.hash.match(/^#work\/(.+)$/); if (m) openCase(decodeURIComponent(m[1]), false); }
  addEventListener('hashchange', openFromHash);

  function zoom(src) {
    const box = document.createElement('div');
    box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    box.innerHTML = `<img src="${esc(src)}" alt=""><button type="button" class="icon-btn" aria-label="${UI.close}">${ICON.close}</button>`;
    const done = () => { box.remove(); document.removeEventListener('keydown', key, true); };
    const key = e => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); done(); } };
    box.addEventListener('click', done);
    document.addEventListener('keydown', key, true);
    dlg.appendChild(box); box.querySelector('button').focus();
  }

  /* ---------- page behaviour ---------- */
  function wire() {
    document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openCase(b.dataset.open)));
    document.querySelectorAll('[data-track]').forEach(a => a.addEventListener('click', () => hit(a.dataset.track)));
    const reel = $('#reel-btn');
    if (reel) reel.addEventListener('click', () => {
      const s = D.profile.showreel;
      $('#case-body').innerHTML = `<div class="case-in"><h2 id="case-title">${UI.reel}</h2><div style="margin-top:24px;background:#000"><video src="${esc(url(s.video))}" ${s.poster ? `poster="${esc(url(s.poster))}"` : ''} controls playsinline preload="none" style="width:100%;max-height:75vh"></video></div></div>`;
      $('#case-cat').textContent = '';
      dlg.showModal(); hit('showreel_open');
      const v = dlg.querySelector('video'); v.addEventListener('play', () => hit('showreel_play'), { once: true });
    });

    // like (count is private: visible only in the admin panel)
    const like = $('#like');
    let liked = false; try { liked = localStorage.getItem('liked') === '1'; } catch (e) {}
    const paint = () => { like.setAttribute('aria-pressed', liked); like.querySelector('span').textContent = liked ? UI.liked : UI.like; };
    paint();
    like.addEventListener('click', () => { if (liked) return; liked = true; try { localStorage.setItem('liked', '1'); } catch (e) {} paint(); hit('likes'); });

    // reveal on scroll
    const els = document.querySelectorAll('.rv, .rv-img');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
      els.forEach(el => io.observe(el));
    } else els.forEach(el => el.classList.add('in'));
  }

  // header + menu
  const top = $('#top'), menu = $('#menu-btn');
  const onScroll = () => top.classList.toggle('solid', scrollY > 60);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  menu.addEventListener('click', () => { const o = top.classList.toggle('open'); menu.setAttribute('aria-expanded', o); });
  $('#nav').addEventListener('click', e => { if (e.target.closest('a')) { top.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && top.classList.contains('open')) { top.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.focus(); } });

  // language preference
  document.querySelectorAll('[data-lang]').forEach(a => a.addEventListener('click', () => { try { localStorage.setItem('lang', a.dataset.lang); } catch (e) {} }));

  // one visit per browser session
  try { if (!sessionStorage.getItem('v')) { sessionStorage.setItem('v', '1'); hit('visits'); } } catch (e) {}
})();
