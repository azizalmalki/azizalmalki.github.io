/* Aziz Almalki — page behaviour.
   Every word of content is already in the HTML (built from data/site.json by
   assets/render.js). This file only adds interaction: lightbox, showreel
   overlay, menu, scroll reveal, language preference and private counters. */
(() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js', 'ready');
  const L = doc.lang === 'en' ? 'en' : 'ar';
  const NS = 'azizalmalki-site';
  const COUNTER = 'https://abacus.jasoncameron.dev';
  const UI = { ar: { like: 'عجبني', liked: 'شكرًا لك', close: 'إغلاق' }, en: { like: 'Like', liked: 'Thank you', close: 'Close' } }[L];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // privacy-friendly counters: no cookies, no personal data; numbers are visible only in the admin panel
  const hit = key => { try { fetch(`${COUNTER}/hit/${NS}/${key}`, { cache: 'no-store', keepalive: true }).catch(() => {}); } catch (e) {} };

  /* ---------- overlay (image or video) ---------- */
  function overlay(node, label) {
    const last = document.activeElement;
    const box = document.createElement('div');
    box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', label || '');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'icon-btn'; btn.setAttribute('aria-label', UI.close);
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    box.append(node, btn);
    const done = () => { if (node.pause) node.pause(); box.remove(); document.removeEventListener('keydown', key, true); doc.style.overflow = ''; if (last && last.focus) last.focus({ preventScroll: true }); };
    const key = e => { if (e.key === 'Escape') { e.preventDefault(); done(); } else if (e.key === 'Tab' && node.tagName === 'IMG') { e.preventDefault(); btn.focus(); } };
    box.addEventListener('click', e => { if (e.target === box || e.target.closest('.icon-btn') || node.tagName === 'IMG') done(); });
    document.addEventListener('keydown', key, true);
    document.body.appendChild(box); doc.style.overflow = 'hidden'; btn.focus();
  }

  document.addEventListener('click', e => {
    const z = e.target.closest('[data-zoom]');
    if (z) { e.preventDefault(); const img = new Image(); img.src = z.getAttribute('href'); img.alt = (z.querySelector('img') || {}).alt || ''; overlay(img, img.alt); return; }
    const v = e.target.closest('[data-video]');
    if (v) {
      e.preventDefault();
      const el = document.createElement('video'); el.src = v.getAttribute('href'); el.controls = true; el.playsInline = true; el.preload = 'metadata';
      overlay(el, v.textContent.trim()); el.play().catch(() => {});
      el.addEventListener('play', () => hit('showreel_play'), { once: true });
    }
    const t = e.target.closest('a[data-track]');
    if (t) hit(t.dataset.track);
  });
  // first play of each video; only one plays at a time
  document.addEventListener('play', e => {
    const v = e.target; if (!(v instanceof HTMLVideoElement)) return;
    $$('video').forEach(o => { if (o !== v) o.pause(); });
    if (v.dataset.track && !v.dataset.hit) { v.dataset.hit = '1'; hit(v.dataset.track); }
  }, true);

  /* ---------- like (count is private) ---------- */
  const like = $('#like');
  if (like) {
    like.hidden = false;
    let liked = false; try { liked = localStorage.getItem('liked') === '1'; } catch (e) {}
    const paint = () => { like.setAttribute('aria-pressed', liked); like.querySelector('span').textContent = liked ? UI.liked : UI.like; };
    paint();
    like.addEventListener('click', () => { if (liked) return; liked = true; try { localStorage.setItem('liked', '1'); } catch (e) {} paint(); hit('likes'); });
  }

  /* ---------- reveal on scroll ---------- */
  const els = $$('.rv, .rv-img');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // a clipped image reports no visible area, so its parent is watched instead
    const owner = new Map();
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { (owner.get(e.target) || []).forEach(x => x.classList.add('in')); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach(el => { const t = el.classList.contains('rv-img') ? el.parentElement : el; if (!owner.has(t)) owner.set(t, []); owner.get(t).push(el); io.observe(t); });
  } else els.forEach(el => el.classList.add('in'));

  /* ---------- header + menu ---------- */
  const bar = $('#top'), menu = $('#menu-btn'), nav = $('#nav');
  const sub = document.body.classList.contains('sub');
  const closeMenu = () => { bar.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); };
  const onScroll = () => bar.classList.toggle('solid', sub || scrollY > 60);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  menu.addEventListener('click', () => { const o = bar.classList.toggle('open'); menu.setAttribute('aria-expanded', o); if (o) { const a = nav.querySelector('a'); if (a) a.focus(); } });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && bar.classList.contains('open')) { closeMenu(); menu.focus(); } });

  // highlight the current section in the menu (home page)
  const links = $$('a[href^="#"]', nav), map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window && links.length) {
    const so = new IntersectionObserver(es => es.forEach(e => {
      const a = map.get(e.target.id); if (!a || !e.isIntersecting) return;
      links.forEach(l => l.removeAttribute('aria-current')); a.setAttribute('aria-current', 'true');
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((a, id) => { const s = document.getElementById(id); if (s) so.observe(s); });
  }

  // language preference
  $$('[data-lang]').forEach(a => a.addEventListener('click', () => { try { localStorage.setItem('lang', a.dataset.lang); } catch (e) {} }));

  // one visit per browser session; one view per work page
  try { if (!sessionStorage.getItem('v')) { sessionStorage.setItem('v', '1'); hit('visits'); } } catch (e) {}
  const w = location.pathname.match(/\/work\/([a-z0-9_-]+)\/?$/);
  if (w) hit('project_' + w[1]);
})();
