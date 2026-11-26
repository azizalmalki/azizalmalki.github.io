/* Aziz Almalki — static site renderer.
   site(D, opts) turns data/site.json into every public file of the site:
   the home page, the About page and one page per work, in Arabic and English,
   plus sitemap.xml, llms.txt and the web manifest. It runs in Node (build.js)
   and in the browser (the admin panel rebuilds everything on each publish), so
   all content is plain HTML: readable and indexable without JavaScript.
   Anything unpublished, empty or missing is simply not rendered. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Render = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const FINAL = 'https://azizalmalki.github.io/';

  const UI = {
    ar: {
      skip: 'تخطَّ إلى المحتوى', sections: 'الأقسام', menu: 'القائمة', home: 'الرئيسية', crumbs: 'مسار الصفحة',
      works: 'أعمال مختارة', worksSub: 'أعمال قدّمتها أمام الكاميرا، من التلفزيون إلى المنصات الرقمية.', view: 'تفاصيل العمل',
      allWorks: 'الأعمال', marketing: 'الإعلام والتسويق', career: 'المسيرة المهنية', edu: 'الشهادات والتكوين',
      about: 'نبذة عني', aboutPage: 'عن عزيز المالكي', readAbout: 'النبذة الكاملة', contact: 'لنعمل معًا',
      contactLead: 'للبرامج التلفزيونية والفعاليات والمؤتمرات والحوارات وإنتاج المحتوى، أسرع طريقة للتواصل هي واتساب.',
      offer: 'ماذا أقدّم', offerLead: 'متاح للتعاون مع القنوات التلفزيونية، وشركات تنظيم الفعاليات والإنتاج، والمؤسسات الثقافية والرياضية، ووكالات العلاقات العامة والإعلان، والجهات الحكومية والخاصة.', book: 'للحجز والتعاون',
      collabTitle: 'مجالات التعاون', wa: 'راسلني واتساب', ig: 'إنستغرام', li: 'لينكدإن', yt: 'يوتيوب',
      seeWorks: 'مشاهدة أعمالي', reel: 'الفيديو التعريفي', cv: 'تحميل السيرة الذاتية', talk: 'تواصل معي',
      type: 'النوع', producer: 'الجهة', year: 'السنة', role: 'دوري', tools: 'الأدوات', resp: 'المسؤوليات',
      videos: 'من الحلقات', photos: 'صور من العمل', watch: 'مشاهدة العمل كاملًا', impact: 'الأثر',
      prev: 'العمل السابق', next: 'العمل التالي', onCam: 'أمام الكاميرا', like: 'عجبني', since: 'منذ',
      zoom: 'تكبير الصورة', noVideo: 'متصفحك لا يدعم تشغيل الفيديو.', transcript: 'النص المكتوب للحلقة',
      duration: 'المدة', sources: 'مصادر وروابط', presenter: 'تقديم',
      inBrief: 'باختصار', programmes: 'البرامج والأعمال', expertise: 'مجالات الخبرة', reach: 'التواصل المهني',
      aboutDesc: 'نبذة عن عزيز المالكي، الإعلامي ومقدّم البرامج والفعاليات: مسيرته، والبرامج التي قدّمها، وتقديمه للفعاليات، وعمله في قطر، وتكوينه.',
      evTitle: 'تقديم الفعاليات والمناسبات', evAvail: 'متاح لتقديم', evView: 'تفاصيل الفعالية', evBook: 'احجز مقدّمًا لفعاليتك',
      sep: '، '
    },
    en: {
      skip: 'Skip to content', sections: 'Sections', menu: 'Menu', home: 'Home', crumbs: 'Breadcrumb',
      works: 'Selected Works', worksSub: 'Work I have presented on camera, from television to digital platforms.', view: 'View project',
      allWorks: 'Works', marketing: 'Media & Marketing', career: 'Career Journey', edu: 'Certifications & Education',
      about: 'About Me', aboutPage: 'About Aziz Almalki', readAbout: 'Full biography', contact: "Let's work together",
      contactLead: 'For TV programmes, events, conferences, panels and content production, WhatsApp is the quickest way to reach me.',
      offer: 'What I do', offerLead: 'Available to work with TV channels, event and production companies, cultural and sports organisations, PR and advertising agencies, and government and private organisations.', book: 'Book or collaborate',
      collabTitle: 'Areas of collaboration', wa: 'Message on WhatsApp', ig: 'Instagram', li: 'LinkedIn', yt: 'YouTube',
      seeWorks: 'View my work', reel: 'Watch showreel', cv: 'Download CV', talk: 'Get in touch',
      type: 'Format', producer: 'Produced by', year: 'Year', role: 'My role', tools: 'Tools', resp: 'Responsibilities',
      videos: 'Episodes', photos: 'Stills', watch: 'Watch the full work', impact: 'Impact',
      prev: 'Previous', next: 'Next', onCam: 'On camera', like: 'Like', since: 'Since',
      zoom: 'Enlarge image', noVideo: 'Your browser cannot play this video.', transcript: 'Episode transcript',
      duration: 'Duration', sources: 'Sources and links', presenter: 'Presented by',
      inBrief: 'In brief', programmes: 'Programmes and works', expertise: 'Areas of expertise', reach: 'Professional contact',
      aboutDesc: 'About Aziz Almalki, media professional, TV presenter and event host: career, programmes presented, event hosting, work in Qatar and education.',
      evTitle: 'Event Hosting & Master of Ceremonies', evAvail: 'Available to host', evView: 'View event', evBook: 'Book a host for your event',
      sep: ', '
    }
  };

  const ICON = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.7-2-1-1 .9a5 5 0 0 1-2.7-2.7l.9-1-1-2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg>',
    li: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M10 9v6l5-3z"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.3 3.8 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.4 0 5.6 3.3 4.4 6.7C19.5 15.4 12 20 12 20z"/></svg>'
  };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
  const SIZES = { 'img/aziz': [480, 800, 1200] };
  const hasExt = p => /\.\w{3,4}$/.test(p);
  const clean = o => JSON.parse(JSON.stringify(o, (k, v) => (v === '' || (Array.isArray(v) && !v.length)) ? undefined : v));
  const isoDur = s => { const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(s || ''); return m ? [(+m[1] || 0) * 60 + (+m[2] || 0), +m[3] || 0] : null; };

  function site(D, opts) {
    opts = opts || {};
    const date = opts.date || new Date().toISOString().slice(0, 10);
    const P = D.profile || {}, C = D.contact || {}, M = D.marketing;
    const cats = D.categories || [];
    const all = (D.projects || []).filter(p => p.published && p.title && (p.title.ar || p.title.en))
      .sort((a, b) => (a.order || 99) - (b.order || 99));
    const files = {};
    // share image: the preview has its own copy until the site goes live at the root
    const OGIMG = FINAL + (opts.preview ? 'preview/' : '') + 'img/og-image.jpg?v=' + date.replace(/-/g, '');

    for (const L of ['ar', 'en']) {
      const rtl = L === 'ar', U = UI[L];
      const T = o => (o && typeof o === 'object' ? (o[L] || '') : (o || '')).toString().trim();
      const name = T(P.name), title = T(P.title), intro = T(P.intro);
      const projects = all.filter(p => T(p.title));
      const featured = projects.filter(p => p.featured && p.category !== 'events');
      const LP = rtl ? '' : 'en/', OP = rtl ? 'en/' : '';
      const workPath = p => `work/${slug(p.id)}/`;
      const catOf = id => cats.find(c => c.id === id);
      const mkOn = M && M.published && T(M.role);

      function ctx(path) {
        const depth = (LP + path).split('/').filter(Boolean).length;
        const R = '../'.repeat(depth), H = R + LP;
        const url = p => (!p ? '' : /^(https?:)?\//.test(p) ? p : R + p);
        const pic = (p, alt, sizes, eager) => {
          if (!p) return '';
          const load = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
          if (hasExt(p)) return `<img src="${esc(url(p))}" alt="${esc(alt)}" ${load}>`;
          const ws = SIZES[p] || [480, 900];
          return `<img src="${esc(url(p))}-${ws[ws.length - 1]}.webp" srcset="${esc(ws.map(w => `${url(p)}-${w}.webp ${w}w`).join(', '))}" sizes="${sizes}" alt="${esc(alt)}" ${load}>`;
        };
        const big = p => hasExt(p) ? url(p) : `${url(p)}-${(SIZES[p] || [480, 900]).slice(-1)[0]}.webp`;
        return { R, H, url, pic, big, self: FINAL + LP + path, other: R + OP + path };
      }

      const channels = primary => {
        const out = [];
        if (C.whatsapp) out.push(`<a class="btn ${primary ? 'primary' : 'ghost'}" href="https://wa.me/${esc(String(C.whatsapp).replace(/\D/g, ''))}" target="_blank" rel="noopener" data-track="contact_whatsapp">${ICON.wa}${U.wa}</a>`);
        if (C.email) out.push(`<a class="btn ghost" href="mailto:${esc(C.email)}" data-track="contact_email">${ICON.mail}<span dir="ltr">${esc(C.email)}</span></a>`);
        if (C.instagram) out.push(`<a class="btn ghost" href="https://www.instagram.com/${esc(C.instagram)}/" target="_blank" rel="noopener me" data-track="contact_instagram">${ICON.ig}${U.ig}</a>`);
        if (C.linkedin) out.push(`<a class="btn ghost" href="${esc(C.linkedin)}" target="_blank" rel="noopener me" data-track="contact_linkedin">${ICON.li}${U.li}</a>`);
        if (C.youtube) out.push(`<a class="btn ghost" href="${esc(C.youtube)}" target="_blank" rel="noopener me" data-track="contact_youtube">${ICON.yt}${U.yt}</a>`);
        return out.join('');
      };
      const sameAs = [C.instagram && `https://www.instagram.com/${C.instagram}/`, C.linkedin, C.youtube, ...((C.other || []).filter(x => /^https?:/.test(x || '')))].filter(Boolean);

      /* ---- one stable identity (@id), referenced from every page ---- */
      const ed = (D.education || []).filter(x => T(x.title));
      const person = clean({
        '@type': 'Person', '@id': FINAL + '#person',
        name, alternateName: (P.alternateNames || []).filter(n => n && n !== name),
        jobTitle: rtl ? ['إعلامي', 'مقدّم برامج تلفزيونية', 'مقدّم فعاليات'] : title.split(/\s*·\s*/), description: T(P.summary) || intro,
        image: { '@type': 'ImageObject', '@id': FINAL + '#portrait', url: FINAL + 'img/aziz-sq.jpg', caption: name },
        url: FINAL + LP, mainEntityOfPage: { '@id': FINAL + LP + 'about/#webpage' },
        nationality: T(P.nationality) ? { '@type': 'Country', name: rtl ? 'الجزائر' : 'Algeria' } : undefined,
        workLocation: { '@type': 'Place', name: T(P.location) || (rtl ? 'قطر' : 'Qatar'), address: { '@type': 'PostalAddress', addressCountry: 'QA' } },
        hasOccupation: (rtl ? ['مقدّم برامج تلفزيونية', 'مقدّم فعاليات', 'إعلامي'] : ['TV Presenter', 'Event Host & MC', 'Media Professional']).map(n => ({ '@type': 'Occupation', name: n })),
        knowsAbout: (P.knowsAbout && P.knowsAbout[L]) || [],
        worksFor: mkOn && T(M.org) ? { '@type': 'Organization', name: rtl ? 'مجموعة صحاري' : 'Sahari Group', address: { '@type': 'PostalAddress', addressCountry: 'QA' } } : undefined,
        alumniOf: { '@type': 'CollegeOrUniversity', name: rtl ? 'جامعة وهران 1 أحمد بن بلة' : 'University of Oran 1 Ahmed Ben Bella', address: { '@type': 'PostalAddress', addressCountry: 'DZ' } },
        hasCredential: ed.map(x => ({ '@type': 'EducationalOccupationalCredential', name: T(x.title), credentialCategory: x.credential || undefined,
          recognizedBy: T(x.org) ? { '@type': 'Organization', name: T(x.org) } : undefined, dateCreated: x.year || undefined })),
        email: C.email ? 'mailto:' + C.email : undefined,
        sameAs
      });
      const website = { '@type': 'WebSite', '@id': FINAL + '#website', url: FINAL, name: rtl ? 'عزيز المالكي' : 'Aziz Almalki', inLanguage: ['ar', 'en'], publisher: { '@id': FINAL + '#person' } };
      const crumbs = (id, items) => ({ '@type': 'BreadcrumbList', '@id': id, itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: it[1] })) });

      function workLd(p) {
        const base = FINAL + LP + workPath(p);
        const vids = (p.videos || []).filter(v => v && v.src);
        const tv = p.kind === 'tv';
        if (p.kind === 'event') return clean({
          '@type': 'Event', '@id': base + '#work', name: T(p.title), description: T(p.summary), url: base,
          startDate: p.date || p.year || undefined, eventStatus: 'https://schema.org/EventScheduled',
          location: T(p.venue) ? { '@type': 'Place', name: T(p.venue) } : undefined,
          organizer: T(p.producer) ? { '@type': 'Organization', name: T(p.producer) } : undefined,
          performer: { '@id': FINAL + '#person' },
          image: p.cover ? FINAL + (hasExt(p.cover) ? p.cover : p.cover + '-900.webp') : undefined,
          subjectOf: vids.map((v, k) => ({ '@id': base + '#video-' + (k + 1) }))
        });
        return clean({
          '@type': tv ? 'TVSeries' : 'CreativeWorkSeries', '@id': base + '#work', name: T(p.title),
          alternateName: (p.title && p.title[rtl ? 'en' : 'ar']) || undefined,
          description: T(p.summary), genre: T(p.type), inLanguage: 'ar', url: base,
          startDate: p.year || undefined,
          actor: { '@id': FINAL + '#person' },
          creator: tv ? undefined : { '@id': FINAL + '#person' },
          productionCompany: tv && T(p.producer) ? { '@type': 'Organization', name: T(p.producer) } : undefined,
          image: p.cover ? FINAL + (hasExt(p.cover) ? p.cover : p.cover + '-900.webp') : undefined,
          sameAs: (p.sources || []).map(s => s && s.url).filter(u => /^https?:/.test(u || '')),
          subjectOf: vids.map((v, k) => ({ '@id': base + '#video-' + (k + 1) }))
        });
      }
      function videoLd(p, v, k) {
        const base = FINAL + LP + workPath(p), vt = T(v.title) || T(p.title);
        return clean({
          '@type': 'VideoObject', '@id': base + '#video-' + (k + 1),
          name: `${T(p.title)} — ${vt}`, description: T(v.description) || T(p.summary) || vt,
          thumbnailUrl: v.poster ? FINAL + String(v.poster).replace(/^\//, '') : FINAL + 'img/og-image.jpg',
          contentUrl: FINAL + String(v.src).replace(/^\//, ''),
          uploadDate: v.uploaded || date, duration: v.duration || undefined, inLanguage: 'ar',
          transcript: T(v.transcript) || undefined,
          isPartOf: { '@id': base + '#work' }, actor: { '@id': FINAL + '#person' }
        });
      }

      function shell(c, o) {
        const nav = o.nav.map(([href, t]) => `<a href="${href}">${esc(t)}</a>`).join('');
        const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': o.ld }).replace(/</g, '\\u003c');
        const robots = opts.preview ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
        return `<!doctype html>
<html lang="${L}" dir="${rtl ? 'rtl' : 'ltr'}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.desc)}">
<meta name="robots" content="${robots}">
<meta name="author" content="${esc(name)}">
${o.path === '' && D.verify ? [['google-site-verification', D.verify.google], ['msvalidate.01', D.verify.bing]].filter(x => x[1]).map(x => `<meta name="${x[0]}" content="${esc(x[1])}">\n`).join('') : ''}
<link rel="canonical" href="${c.self}">
<link rel="alternate" hreflang="ar" href="${FINAL}${o.path}">
<link rel="alternate" hreflang="en" href="${FINAL}en/${o.path}">
<link rel="alternate" hreflang="x-default" href="${FINAL}${o.path}">
<meta property="og:type" content="${o.ogType || 'website'}">
<meta property="og:site_name" content="${esc(name)}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${c.self}">
<meta property="og:image" content="${OGIMG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(name + ' — ' + title)}">
<meta property="og:locale" content="${rtl ? 'ar_AR' : 'en_US'}">
<meta property="og:locale:alternate" content="${rtl ? 'en_US' : 'ar_AR'}">
${o.ogType === 'profile' ? `<meta property="profile:first_name" content="${esc(name.split(' ')[0])}">
<meta property="profile:last_name" content="${esc(name.split(' ').slice(-1)[0])}">
` : ''}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(o.title)}">
<meta name="twitter:description" content="${esc(o.desc)}">
<meta name="twitter:image" content="${OGIMG}">
<meta name="theme-color" content="#141414">
<link rel="icon" href="${c.R}favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" href="${c.R}favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="${c.R}apple-touch-icon.png">
<link rel="manifest" href="${c.R}site.webmanifest">
<link rel="preload" href="${c.R}assets/fonts/thmanyah-black.woff" as="font" type="font/woff" crossorigin>
${o.preload || ''}<link rel="stylesheet" href="${c.R}assets/site.css">
<script>document.documentElement.className='js'</script>
${o.redirect || ''}<script type="application/ld+json">${ld}</script>
</head>
<body${o.bodyClass ? ` class="${o.bodyClass}"` : ''}>
<a class="skip" href="#main">${U.skip}</a>
<header class="top" id="top">
  <a class="brand" href="${o.brandHref}">${esc(name)}</a>
  <nav class="nav" id="nav" aria-label="${U.sections}">${nav}</nav>
  <a class="lang" href="${c.other}" hreflang="${rtl ? 'en' : 'ar'}" lang="${rtl ? 'en' : 'ar'}" data-lang="${rtl ? 'en' : 'ar'}">${rtl ? 'EN' : 'عربي'}<span class="sr">${rtl ? ' — English version' : ' — النسخة العربية'}</span></a>
  <button class="menu-btn" id="menu-btn" type="button" aria-label="${U.menu}" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
</header>
<main id="main" tabindex="-1">
${o.body}
</main>
${o.footer === false ? '' : footer(c)}
<script src="${c.R}assets/site.js" defer></script>
</body>
</html>
`;
      }
      function footer(c) {
        return `<footer class="site-foot dark"><div class="wrap">
  <div class="sf-top"><p class="sf-name">${esc(name)}</p><p class="sf-title">${esc(title)}</p></div>
  <div class="channels">${channels(true)}</div>
  <p class="sf-links"><a href="${c.H}">${U.home}</a><a href="${c.H}#works">${U.allWorks}</a><a href="${c.H}about/">${U.aboutPage}</a></p>
  <p class="sf-copy">© ${date.slice(0, 4)} ${esc(name)} · ${esc(T(P.location))}</p>
</div></footer>`;
      }
      const subNav = c => [[c.H, U.home], [c.H + '#works', U.allWorks], [c.H + 'about/', U.aboutPage], [c.H + '#contact', U.talk]];
      const crumbNav = (c, items) => `<nav class="crumbs" aria-label="${U.crumbs}">${items.map(([t, h], i) => i === items.length - 1 ? `<span aria-current="page">${esc(t)}</span>` : `<a href="${h}">${esc(t)}</a><span aria-hidden="true">/</span>`).join('')}</nav>`;

      /* =================== home =================== */
      {
        const c = ctx('');
        let body = '', n = 0;
        const num = () => String(++n).padStart(2, '0');
        const nav = [];
        const card = (p, lead) => {
          const meta = [T(p.type), T(p.producer)].filter(Boolean).join(' · ');
          const frame = p.cover
            ? `<div class="frame rv-img">${c.pic(p.cover, T(p.title), lead ? '(max-width:600px) 100vw, 50vw' : '(max-width:600px) 100vw, (max-width:980px) 50vw, 33vw')}</div>`
            : `<div class="frame type" aria-hidden="true"><span class="tag">${esc(T(p.role) || T(p.type))}</span><span class="big">${esc(T(p.title))}</span><span class="foot-meta"><span class="rule"></span><span class="tag mute">${esc(meta)}</span></span></div>`;
          return `<a class="work rv${lead ? ' lead' : ''}" href="${workPath(p)}">
      ${frame}
      <div class="info"><div><h3>${esc(T(p.title))}</h3><p class="sub">${esc([T(p.role), T(p.type)].filter(Boolean).join(' · '))}</p></div>${p.year ? `<span class="yr">${esc(p.year)}</span>` : ''}</div>
      ${T(p.summary) ? `<p class="work-sum">${esc(T(p.summary))}</p>` : ''}
      <span class="more">${U.view} ${ICON.arrow}</span></a>`;
        };
        if (featured.length) {
          nav.push(['#works', U.works]);
          body += `<section class="sec" id="works" aria-labelledby="h-works"><div class="wrap">
  <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-works">${U.works}</h2><p>${U.worksSub}</p></div>
  <div class="works">${featured.map((p, i) => card(p, i === 0 && featured.length > 2 && !!p.cover)).join('')}</div></div></section>\n`;
        }
        const EV = D.events || {};
        const evItems = projects.filter(p => p.category === 'events');
        if (EV.published !== false && (T(EV.lead) || evItems.length)) {
          const types = ((EV.types && EV.types[L]) || []).filter(Boolean);
          nav.push(['#events', U.evTitle]);
          body += `<section class="sec dark" id="events" aria-labelledby="h-events"><div class="wrap">
  <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-events">${U.evTitle}</h2>${T(EV.lead) ? `<p>${esc(T(EV.lead))}</p>` : ''}</div>
  ${evItems.length ? `<div class="works ev-works">${evItems.map(p => card(p, false)).join('')}</div>` : ''}
  ${types.length ? `<div class="ev-types rv"><p class="sec-num">${U.evAvail}</p><ul>${types.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
  <p class="ev-cta rv"><a class="btn primary" href="#contact">${U.evBook} ${ICON.arrow}</a></p></div></section>\n`;
        }
        const collabH = ((D.collaboration && D.collaboration[L]) || []).filter(Boolean);
        if (collabH.length) {
          nav.push(['#offer', U.offer]);
          body += `<section class="sec" id="offer" aria-labelledby="h-offer"><div class="wrap">
  <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-offer">${U.offer}</h2><p>${U.offerLead}</p></div>
  <ul class="offer rv">${collabH.map((x, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${esc(x)}</li>`).join('')}</ul></div></section>\n`;
        }
        cats.forEach(cat => {
          const items = projects.filter(p => p.category === cat.id && !p.featured && cat.id !== 'events');
          if (!items.length) return;
          const id = 'cat-' + slug(cat.id), h = T(cat.sectionTitle) || T(cat);
          nav.push(['#' + id, h]);
          body += `<section class="sec" id="${id}" aria-labelledby="h-${id}"><div class="wrap">
  <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-${id}">${esc(h)}</h2></div>
  <div class="list rv">${items.map(p => `<a class="item" href="${workPath(p)}"><b>${esc(T(p.title))}</b><span>${esc([T(p.type), T(p.role)].filter(Boolean).join(' · '))}</span><span>${esc(p.year || '')}</span></a>`).join('')}</div></div></section>\n`;
        });
        if (mkOn) {
          nav.push(['#marketing', U.marketing]);
          const areas = (M.areas && M.areas[L]) || [];
          body += `<section class="sec dark" id="marketing" aria-labelledby="h-mk"><div class="wrap">
  <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-mk">${U.marketing}</h2></div>
  <div class="mk"><div class="rv"><p class="role">${esc(T(M.role))}</p><p class="org">${esc(T(M.org))}${M.since ? ` · ${U.since} ${esc(M.since)}` : ''}</p>${T(M.summary) ? `<p class="sum">${esc(T(M.summary))}</p>` : ''}</div>
  ${areas.length ? `<ul class="areas rv">${areas.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}</div></div></section>\n`;
        }
        const tl = (D.timeline || []).filter(x => T(x.title));
        if (tl.length) {
          nav.push(['#career', U.career]);
          body += `<section class="sec" id="career" aria-labelledby="h-career"><div class="wrap">
  <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-career">${U.career}</h2></div>
  <ol class="tl rv">${tl.map(x => `<li><span class="y">${esc(x.year || '')}</span><h3>${esc(T(x.title))}</h3>${T(x.text) ? `<p>${esc(T(x.text))}</p>` : ''}</li>`).join('')}</ol></div></section>\n`;
        }
        if (ed.length) {
          body += `<section class="sec" id="education" aria-labelledby="h-edu"><div class="wrap">
  <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-edu">${U.edu}</h2></div>
  <ul class="edu rv">${ed.map(x => `<li><span class="k">${esc(T(x.kind))}</span><h3>${esc(T(x.title))}</h3><p>${esc([T(x.org), x.year].filter(Boolean).join(' · '))}</p></li>`).join('')}</ul></div></section>\n`;
        }
        const ab = ((D.about && D.about[L]) || []).filter(Boolean);
        if (ab.length) {
          nav.push(['#about', U.about]);
          body += `<section class="sec" id="about" aria-labelledby="h-about"><div class="wrap">
  <div class="sec-head rv"><span class="sec-num">${num()}</span><h2 id="h-about">${U.about}</h2></div>
  <div class="about"><figure class="rv-img">${c.pic(P.aboutImage || 'img/portrait-oud', name, '(max-width:860px) 360px, 30vw')}</figure>
  <div class="story rv">${ab.map(x => `<p>${esc(x)}</p>`).join('')}<p><a class="text-link" href="about/">${U.readAbout} ${ICON.arrow}</a></p></div></div></div></section>\n`;
        }
        nav.push(['#contact', U.talk]);
        body += `<section class="sec dark" id="contact" aria-labelledby="h-contact"><div class="wrap">
  <div class="contact"><div class="rv"><h2 id="h-contact">${U.contact}</h2><p class="lead">${U.contactLead}</p><div class="channels">${channels(true)}</div></div>
  <div class="rv"><p class="sec-num collab-h">${U.book}</p><p class="lead">${U.offerLead}</p></div></div>
  <div class="foot"><span>© ${date.slice(0, 4)} ${esc(name)}</span><span>${esc(T(P.location))}</span><a href="about/">${U.aboutPage}</a>
  <button type="button" class="like" id="like" aria-pressed="false" hidden>${ICON.heart}<span>${U.like}</span></button></div></div></section>`;

        const ctas = [];
        if (featured.length) ctas.push(`<a class="btn primary" href="#works">${U.seeWorks}</a>`);
        if (P.showreel && P.showreel.published && P.showreel.video) ctas.push(`<a class="btn ghost" href="${esc(c.url(P.showreel.video))}" data-video data-track="showreel_open">${ICON.play}${U.reel}</a>`);
        if (P.cv && P.cv.published && P.cv.file) ctas.push(`<a class="btn ghost" href="${esc(c.url(P.cv.file))}" download data-track="cv_download">${ICON.dl}${U.cv}</a>`);
        ctas.push(`<a class="btn ghost" href="#contact">${U.talk}</a>`);
        const portrait = P.portrait || 'img/aziz', ws = SIZES[portrait] || [480, 900];
        const pset = ws.map(w => `${c.R}${portrait}-${w}.webp ${w}w`).join(', '), pbig = `${c.R}${portrait}-${ws[ws.length - 1]}.webp`;
        const otherTitle = P.title && P.title[rtl ? 'en' : 'ar'];
        const hero = `<section class="hero" id="hero" aria-labelledby="hero-name">
  <div class="hero-media"><img src="${pbig}" srcset="${pset}" sizes="(max-width:860px) 100vw, 50vw" width="1200" height="1500" alt="${esc(name)}" fetchpriority="high"></div>
  <div class="hero-copy">
    <p class="eyebrow">${esc(title)}</p>
    <h1 id="hero-name">${T(P.displayName) && T(P.displayName) !== name ? `<span aria-hidden="true">${esc(T(P.displayName))}</span> <span class="sr">${esc(name)}</span>` : esc(name)}</h1>
    ${otherTitle ? `<p class="alt" lang="${rtl ? 'en' : 'ar'}">${esc(otherTitle)}</p>` : ''}
    ${intro ? `<p class="intro">${esc(intro)}</p>` : ''}
    <p class="meta">${T(P.location) ? `<span>${esc(T(P.location))}</span>` : ''}${T(P.since) ? `<span>${esc(T(P.since))}</span>` : ''}</p>
    <div class="ctas">${ctas.join('')}</div>
  </div>
</section>`;
        const url = FINAL + LP;
        const keep = ['#works', '#events', '#about', '#contact'];
        nav.splice(0, nav.length, ...nav.filter(x => keep.includes(x[0])));
        files[LP + 'index.html'] = shell(c, {
          path: '', title: `${name} | ${title}`, desc: `${name}${rtl ? '، ' : ', '}${title}. ${intro}`, ogType: 'profile', nav, brandHref: '#hero', footer: false,
          preload: `<link rel="preload" as="image" href="${pbig}" imagesrcset="${pset}" imagesizes="(max-width:860px) 100vw, 50vw">\n`,
          redirect: rtl ? "<script>try{if(localStorage.getItem('lang')==='en'&&!/[?&]ar\\b/.test(location.search)&&!document.referrer.includes(location.host))location.replace('en/'+location.hash)}catch(e){}</script>\n" : '',
          body: hero + '\n' + body,
          ld: [website, person,
            { '@type': 'ProfilePage', '@id': url + '#webpage', url, name: `${name} | ${title}`, inLanguage: L, isPartOf: { '@id': FINAL + '#website' },
              mainEntity: { '@id': FINAL + '#person' }, primaryImageOfPage: { '@id': FINAL + '#portrait' }, dateModified: date },
            clean({ '@type': 'ItemList', '@id': url + '#works', name: U.works, itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: FINAL + LP + workPath(p), name: T(p.title) })) })]
        });
      }

      /* =================== About page =================== */
      {
        const c = ctx('about/'), url = FINAL + LP + 'about/';
        const sum = T(P.summary);
        const ab = ((D.about && D.about[L]) || []).filter(Boolean);
        const tl = (D.timeline || []).filter(x => T(x.title));
        const ka = ((P.knowsAbout && P.knowsAbout[L]) || []).filter(Boolean);
        const collab = ((D.collaboration && D.collaboration[L]) || []).filter(Boolean);
        let b = `<article class="page">
<header class="page-head dark"><div class="wrap">
  ${crumbNav(c, [[U.home, c.H], [U.aboutPage]])}
  <div class="ph-grid"><div><p class="eyebrow">${esc(title)}</p><h1>${U.aboutPage}</h1>${intro ? `<p class="lede">${esc(intro)}</p>` : ''}</div>
  <figure class="ph-img">${c.pic(P.aboutImage || 'img/portrait-oud', name, '(max-width:860px) 60vw, 360px', true)}</figure></div>
</div></header>
<div class="wrap page-body">`;
        if (sum) b += `<section aria-labelledby="a-brief"><h2 id="a-brief">${U.inBrief}</h2><p class="brief">${esc(sum)}</p></section>`;
        if (ab.length) b += `<section aria-labelledby="a-story"><h2 id="a-story">${U.about}</h2>${ab.map(x => `<p>${esc(x)}</p>`).join('')}</section>`;
        if (projects.length) b += `<section aria-labelledby="a-prog"><h2 id="a-prog">${U.programmes}</h2><ul class="plist">${projects.map(p => `<li><a href="../${workPath(p)}">${esc(T(p.title))}</a><span class="pmeta">${esc([T(p.type), T(p.producer), p.year].filter(Boolean).join(' · '))}${T(p.role) ? ` — ${esc(T(p.role))}` : ''}</span>${T(p.summary) ? `<p>${esc(T(p.summary))}</p>` : ''}</li>`).join('')}</ul></section>`;
        if (mkOn) b += `<section aria-labelledby="a-mk"><h2 id="a-mk">${U.marketing}</h2><p><b>${esc(T(M.role))}</b> — ${esc(T(M.org))}${M.since ? ` · ${U.since} ${esc(M.since)}` : ''}</p>${T(M.summary) ? `<p>${esc(T(M.summary))}</p>` : ''}${((M.areas && M.areas[L]) || []).length ? `<ul class="tags">${M.areas[L].map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}</section>`;
        if (tl.length) b += `<section aria-labelledby="a-tl"><h2 id="a-tl">${U.career}</h2><ol class="tl">${tl.map(x => `<li><span class="y">${esc(x.year || '')}</span><h3>${esc(T(x.title))}</h3>${T(x.text) ? `<p>${esc(T(x.text))}</p>` : ''}</li>`).join('')}</ol></section>`;
        if (ed.length) b += `<section aria-labelledby="a-edu"><h2 id="a-edu">${U.edu}</h2><ul class="edu">${ed.map(x => `<li><span class="k">${esc(T(x.kind))}</span><h3>${esc(T(x.title))}</h3><p>${esc([T(x.org), x.year].filter(Boolean).join(' · '))}</p></li>`).join('')}</ul></section>`;
        if (ka.length) b += `<section aria-labelledby="a-ka"><h2 id="a-ka">${U.expertise}</h2><ul class="tags">${ka.map(k => `<li>${esc(k)}</li>`).join('')}</ul></section>`;
        b += `<section aria-labelledby="a-reach"><h2 id="a-reach">${U.reach}</h2><p>${U.contactLead}</p>${collab.length ? `<h3 class="sub-h">${U.collabTitle}</h3><p class="note">${U.offerLead}</p><ul class="tags">${collab.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}<div class="channels on-light">${channels(true)}</div></section>`;
        b += `</div></article>`;
        files[LP + 'about/index.html'] = shell(c, {
          path: 'about/', title: `${U.aboutPage} | ${title}`, desc: U.aboutDesc, ogType: 'profile', nav: subNav(c), brandHref: c.H, bodyClass: 'sub',
          body: b,
          ld: [website, person,
            { '@type': 'AboutPage', '@id': url + '#webpage', url, name: U.aboutPage, inLanguage: L, isPartOf: { '@id': FINAL + '#website' },
              mainEntity: { '@id': FINAL + '#person' }, about: { '@id': FINAL + '#person' }, dateModified: date, breadcrumb: { '@id': url + '#crumbs' } },
            crumbs(url + '#crumbs', [[U.home, FINAL + LP], [U.aboutPage, url]])]
        });
      }

      /* =================== one page per work =================== */
      projects.forEach((p, i) => {
        const path = workPath(p), c = ctx(path), url = FINAL + LP + path;
        const cat = catOf(p.category);
        const facts = [[U.type, T(p.type)], [U.producer, T(p.producer)], [U.year, p.year], [U.role, T(p.role)], [U.tools, (p.tools || []).filter(Boolean).join(U.sep)]].filter(f => f[1]);
        const resp = ((p.responsibilities && p.responsibilities[L]) || []).filter(Boolean);
        const vids = (p.videos || []).filter(v => v && v.src);
        const gal = (p.gallery || []).filter(Boolean);
        const srcs = (p.sources || []).filter(s => s && /^https?:/.test(s.url || ''));
        const prev = projects[(i - 1 + projects.length) % projects.length], next = projects[(i + 1) % projects.length];
        const dur = v => { const d = isoDur(v.duration); return d ? `${d[0]}:${String(d[1]).padStart(2, '0')}` : ''; };
        let b = `<article class="page">
<header class="page-head dark"><div class="wrap">
  ${crumbNav(c, [[U.home, c.H], [U.allWorks, c.H + '#works'], [T(p.title)]])}
  <div class="ph-grid${p.cover ? '' : ' solo'}"><div>
    <p class="eyebrow">${esc(cat ? T(cat) : '')}${p.onCamera ? ` · ${U.onCam}` : ''}</p>
    <h1>${esc(T(p.title))}</h1>
    ${T(p.summary) ? `<p class="lede">${esc(T(p.summary))}</p>` : ''}
    <p class="byline">${U.presenter}: <a href="${c.H}about/">${esc(name)}</a></p>
  </div>${p.cover ? `<figure class="ph-img">${c.pic(p.cover, T(p.title), '(max-width:860px) 80vw, 420px', true)}</figure>` : ''}</div>
  ${facts.length ? `<dl class="facts">${facts.map(f => `<div><dt>${f[0]}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>` : ''}
</div></header>
<div class="wrap page-body">`;
        if (resp.length) b += `<section aria-labelledby="w-resp"><h2 id="w-resp">${U.resp}</h2><ul class="resp">${resp.map(r => `<li>${esc(r)}</li>`).join('')}</ul></section>`;
        if (T(p.impact)) b += `<section aria-labelledby="w-imp"><h2 id="w-imp">${U.impact}</h2><p>${esc(T(p.impact))}</p></section>`;
        if (vids.length) b += `<section aria-labelledby="w-vid"><h2 id="w-vid">${U.videos}</h2><div class="vids">${vids.map((v, k) => `<figure id="video-${k + 1}"><div class="v${v.orientation === 'horizontal' ? ' h' : ''}"><video controls playsinline preload="none"${v.poster ? ` poster="${esc(c.url(v.poster))}"` : ''} data-track="video_${esc(p.id)}_${k}"${T(v.title) ? ` aria-label="${esc(T(v.title))}"` : ''}><source src="${esc(c.url(v.src))}" type="video/mp4">${U.noVideo}</video></div>
          <figcaption>${T(v.title) ? `<b>${esc(T(v.title))}</b>` : ''}${dur(v) ? `<span class="vmeta">${U.duration} <span dir="ltr">${dur(v)}</span></span>` : ''}${T(v.description) ? `<span class="vdesc">${esc(T(v.description))}</span>` : ''}</figcaption>
          ${T(v.transcript) ? `<details class="transcript"><summary>${U.transcript}</summary><div>${T(v.transcript).split(/\n+/).map(l => `<p>${esc(l)}</p>`).join('')}</div></details>` : ''}</figure>`).join('')}</div></section>`;
        if (gal.length) b += `<section aria-labelledby="w-gal"><h2 id="w-gal">${U.photos}</h2><div class="gal">${gal.map(g => `<a href="${esc(c.big(g))}" data-zoom aria-label="${esc(U.zoom + ' — ' + T(p.title))}">${c.pic(g, T(p.title), '(max-width:600px) 50vw, 260px')}</a>`).join('')}</div></section>`;
        if (p.link || srcs.length) b += `<section aria-labelledby="w-src"><h2 id="w-src">${U.sources}</h2><ul class="srcs">${p.link ? `<li><a href="${esc(p.link)}" target="_blank" rel="noopener">${U.watch}</a></li>` : ''}${srcs.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(T(s.label) || s.url)}</a></li>`).join('')}</ul></section>`;
        b += `<aside class="presenter" aria-label="${esc(name)}">${c.pic(P.portrait || 'img/aziz', name, '96px')}<div><b>${esc(name)}</b><span>${esc(title)}</span><a class="text-link" href="${c.H}about/">${U.readAbout} ${ICON.arrow}</a></div></aside>`;
        if (projects.length > 1) b += `<nav class="case-nav" aria-label="${U.allWorks}"><a href="${c.H}${workPath(prev)}" rel="prev"><small>${U.prev}</small>${esc(T(prev.title))}</a><a href="${c.H}${workPath(next)}" rel="next"><small>${U.next}</small>${esc(T(next.title))}</a></nav>`;
        b += `</div></article>`;
        const desc = [T(p.summary), [T(p.role), T(p.type), T(p.producer), p.year].filter(Boolean).join(' · ')].filter(Boolean).join(' ');
        files[LP + path + 'index.html'] = shell(c, {
          path, title: `${T(p.title)} | ${name}`, desc: desc.slice(0, 300), ogType: 'video.tv_show', nav: subNav(c), brandHref: c.H, bodyClass: 'sub',
          body: b,
          ld: [website, person, workLd(p), ...vids.map((v, k) => videoLd(p, v, k)),
            { '@type': 'WebPage', '@id': url + '#webpage', url, name: T(p.title), inLanguage: L, isPartOf: { '@id': FINAL + '#website' },
              mainEntity: { '@id': url + '#work' }, about: { '@id': FINAL + '#person' }, dateModified: date, breadcrumb: { '@id': url + '#crumbs' } },
            crumbs(url + '#crumbs', [[U.home, FINAL + LP], [U.allWorks, FINAL + LP + '#works'], [T(p.title), url]])]
        });
      });
    }

    /* =================== sitemap, llms.txt, manifest =================== */
    const pages = ['', 'about/', ...all.map(p => `work/${slug(p.id)}/`)];
    files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(pg => ['', 'en/'].map(lp => `  <url><loc>${FINAL}${lp}${pg}</loc><lastmod>${date}</lastmod>
    <xhtml:link rel="alternate" hreflang="ar" href="${FINAL}${pg}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${FINAL}en/${pg}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${FINAL}${pg}"/></url>`).join('\n')).join('\n')}
</urlset>
`;
    const E = o => (o && o.en) || '', A = o => (o && o.ar) || '';
    files['llms.txt'] = `# ${E(P.name)} (${A(P.name)})

> ${E(P.summary) || E(P.intro)}

Official personal website of ${E(P.name)}. Every page exists in Arabic (default) and English. The facts on this site are maintained by ${E(P.name)} himself.

## Profile
- [About ${E(P.name)}](${FINAL}en/about/): biography, programmes, career, education and contact
- [عن ${A(P.name)}](${FINAL}about/): النبذة باللغة العربية
- [Home](${FINAL}en/) · [الرئيسية](${FINAL})

## Works
${all.map(p => `- [${E(p.title) || A(p.title)} (${A(p.title)})](${FINAL}en/work/${slug(p.id)}/): ${[E(p.type), E(p.role), p.year].filter(Boolean).join(', ')}`).join('\n')}

## Contact
${[C.email && `- Email: ${C.email}`, C.instagram && `- Instagram: https://www.instagram.com/${C.instagram}/`, C.linkedin && `- LinkedIn: ${C.linkedin}`, C.youtube && `- YouTube: ${C.youtube}`].filter(Boolean).join('\n')}
`;
    files['site.webmanifest'] = JSON.stringify({
      name: A(P.name) + ' — ' + E(P.name), short_name: A(P.name),
      icons: [{ src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }],
      theme_color: '#141414', background_color: '#141414', display: 'browser', lang: 'ar', dir: 'rtl'
    }, null, 1);
    return files;
  }

  return { site, UI, FINAL, slug };
}));
