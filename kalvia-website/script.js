/* Kalvia site interactions. No dependencies. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Arch geometry (the "Kalvia Access" window) ---------- */
  // An arch: straight sides, semicircular top, centred on cx, resting on baseY.
  const archPath = (cx, baseY, w, h) => {
    const r = w / 2, top = baseY - h;
    return `M${cx - r},${baseY} V${top + r} A${r},${r} 0 0 1 ${cx + r},${top + r} V${baseY}`;
  };
  const drawRipple = (svg, { cx, baseY, w0, h0, step, count, stroke }) => {
    if (!svg) return;
    let out = '';
    for (let i = 0; i < count; i++) {
      out += `<path d="${archPath(cx, baseY, w0 + i * step * 2, h0 + i * step)}"${stroke ? ` style="stroke:${stroke}"` : ''} opacity="${(1 - i / (count + 2)).toFixed(2)}"/>`;
    }
    svg.innerHTML = out;
  };
  drawRipple($('#hero-ripple'), { cx: 300, baseY: 600, w0: 300, h0: 360, step: 16, count: 14 });
  drawRipple($('#vision-ripple'), { cx: 300, baseY: 600, w0: 120, h0: 150, step: 13, count: 22 });

  /* ---------- Header, progress, active nav ---------- */
  const header = $('.site-header');
  const progress = $('.progress');
  const heroPhoto = $('.hero-photo');
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('scrolled', y > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (heroPhoto && !reduced && y < innerHeight) heroPhoto.style.setProperty('--py', `${y * 0.12}px`);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = $('.nav-toggle');
  const links = $('#nav-links');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
  });
  links.addEventListener('click', e => {
    if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); links.classList.remove('open'); }
  });

  const sectionIds = ['academy', 'soat', 'about', 'contact'];
  const navObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      $$('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id && !a.dataset.brand));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sectionIds.forEach(id => { const el = document.getElementById(id); if (el) navObs.observe(el); });

  /* ---------- Reveal on scroll ---------- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); } });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => revealObs.observe(el));

  /* ---------- Hero word rotator ---------- */
  const words = $$('.rotator > span');
  if (words.length > 1 && !reduced && matchMedia('(min-width: 921px)').matches) {
    let i = 0;
    setInterval(() => {
      const cur = words[i];
      cur.classList.add('out'); cur.classList.remove('on');
      i = (i + 1) % words.length;
      const next = words[i];
      next.classList.remove('out');
      next.classList.add('on');
      setTimeout(() => cur.classList.remove('out'), 650);
    }, 2400);
  }

  /* ---------- The cycle (before / with Kalvia) ---------- */
  const cycle = $('#cycle');
  const sw = $('.switch');
  const thumb = sw.querySelector('.thumb');
  const swBtns = $$('button', sw);
  const placeThumb = btn => {
    thumb.style.width = btn.offsetWidth + 'px';
    thumb.style.transform = `translateX(${btn.offsetLeft - 6}px)`;
  };
  const setCycle = mode => {
    swBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.cycle === mode));
    placeThumb(swBtns.find(b => b.dataset.cycle === mode));
    sw.classList.toggle('after', mode === 'after');
    cycle.classList.add('flip');
    setTimeout(() => {
      cycle.classList.toggle('after', mode === 'after');
      $$('.cycle-center > span', cycle).forEach(s => { s.hidden = s.classList.contains('v-after') !== (mode === 'after'); });
      cycle.classList.remove('flip');
    }, 220);
  };
  swBtns.forEach(b => b.addEventListener('click', () => setCycle(b.dataset.cycle)));
  addEventListener('load', () => placeThumb(swBtns.find(b => b.getAttribute('aria-pressed') === 'true')));
  addEventListener('resize', () => placeThumb(swBtns.find(b => b.getAttribute('aria-pressed') === 'true')));
  placeThumb(swBtns[0]);

  /* ---------- Chain of prosperity ripple ---------- */
  const stages = [
    { key: 'Students', chain: 0, title: 'Students prosper', text: 'By gaining the skills, knowledge and opportunities needed to build meaningful, sustainable careers.' },
    { key: 'Businesses', chain: 1, title: 'Businesses prosper', text: 'By gaining access to skilled, capable professionals who help them operate better, grow sustainably and thrive.' },
    { key: 'Parents & sponsors', chain: 2, title: 'Families prosper', text: 'Parents and sponsors gain the confidence of seeing their children or beneficiaries become self-sufficient and build more secure futures.' },
    { key: 'Society', chain: 3, title: 'Society prospers', text: 'When small and medium-sized businesses grow, they create jobs, solve everyday problems and strengthen local economies.' }
  ];
  const ringColors = ['#FF5A00', '#FFAE00', '#271CC1', '#C9C6EF'];
  const rsvg = $('#ripple-svg');
  const stage = $('#ripple-stage');
  const cx = 250, baseY = 440;
  const ringGeo = stages.map((_, i) => ({ w: 150 + i * 90, h: 175 + i * 80 }));
  rsvg.innerHTML =
    ringGeo.map((g, i) => `<path class="ring" data-i="${i}" d="${archPath(cx, baseY, g.w, g.h)}" stroke="${ringColors[i]}" opacity=".35"/>`).join('') +
    `<path class="pulse" d="${archPath(cx, baseY, ringGeo[3].w, ringGeo[3].h)}"/>` +
    `<path class="core" d="${archPath(cx, baseY, 80, 95)} Z"/>` +
    `<line x1="20" x2="480" y1="${baseY}" y2="${baseY}" stroke="rgba(255,255,255,.25)" stroke-width="2"/>`;
  const labels = stages.map((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ripple-label';
    b.textContent = s.key;
    b.setAttribute('aria-pressed', 'false');
    b.style.left = (cx / 500 * 100) + '%';
    b.style.top = ((baseY - ringGeo[i].h) / 500 * 100) + '%';
    stage.appendChild(b);
    return b;
  });
  const copy = $('#prosper-copy');
  const chainEls = $$('#chain span');
  let activeStage = -1, autoTimer = null;
  const setStage = (idx, user) => {
    if (idx === activeStage) return;
    activeStage = idx;
    $$('.ring', rsvg).forEach((r, i) => {
      r.classList.toggle('lit', i <= idx);
      r.setAttribute('opacity', i <= idx ? 1 : .35);
    });
    labels.forEach((l, i) => l.setAttribute('aria-pressed', i === idx));
    chainEls.forEach((c, i) => c.classList.toggle('lit', i <= stages[idx].chain));
    const pulse = $('.pulse', rsvg);
    pulse.classList.remove('go'); void pulse.getBBox(); pulse.classList.add('go');
    copy.classList.add('swapping');
    setTimeout(() => {
      copy.innerHTML = `<h3>${stages[idx].title}</h3><p>${stages[idx].text}</p>`;
      copy.classList.remove('swapping');
    }, 250);
    if (user) { clearInterval(autoTimer); autoTimer = null; }
  };
  labels.forEach((l, i) => l.addEventListener('click', () => setStage(i, true)));
  $$('.ring', rsvg).forEach((r, i) => { r.style.cursor = 'pointer'; r.style.pointerEvents = 'stroke'; r.addEventListener('click', () => setStage(i, true)); });
  setStage(0);
  const rippleObs = new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !autoTimer && !reduced && activeStage < 3) {
      autoTimer = setInterval(() => {
        if (activeStage >= stages.length - 1) { clearInterval(autoTimer); return; }
        setStage(activeStage + 1);
      }, 2600);
      rippleObs.disconnect();
    }
  }, { threshold: 0.5 });
  rippleObs.observe(stage);

  /* ---------- Academy / Marketplace tabs and audiences ---------- */
  const audiences = {
    academy: [
      { tab: 'Students', who: 'For students', title: 'Relevance and quality.', text: 'Career-relevant, practical training that helps you become more market-ready, capable and competitive.', points: ['Hands-on workshop training in real trades', 'Customer and business skills, not just technique', 'Credentials recognised wherever opportunity exists'], tags: ['Mastery', 'Quality', 'Growth'] },
      { tab: 'Parents & sponsors', who: 'For parents and sponsors', title: 'Assurance for a stronger future.', text: 'A credible pathway for empowering someone you support with relevant skills that lead to independence, security and opportunity.', points: ['A structured, accountable programme', 'Skills that lead directly to earning', 'Confidence that your support builds self-sufficiency'], tags: ['Assurance', 'Confidence'] },
      { tab: 'Enterprises', who: 'For organisations', title: 'Impact you can measure.', text: 'An impact-led training platform that helps organisations create meaningful social and future impact through skills development and job creation.', points: ['Sponsor cohorts aligned to your workforce or CSR goals', 'Outcomes tied to skills and job creation', 'A partner built for long-term impact'], tags: ['Impact', 'Growth'] }
    ],
    market: [
      { tab: 'Technicians', who: 'For technicians', title: 'Access and structure.', text: 'A structured pool of available jobs and client opportunities, supported by systems for placement, management and tracking.', points: ['Reliable access to jobs and clients', 'Invoicing and job tracking handled for you', 'The SOAT seal to show customers they can trust you'], tags: ['Access', 'Structure'] },
      { tab: 'Customers', who: 'For homes and businesses', title: 'Reliable, skilled professionals.', text: 'Access to technicians positioned around professional mastery, quality and reliability.', points: ['Every technician certified and re-certified yearly', 'Professional conduct, not just a quick fix', 'Clear quality standards behind every job'], tags: ['Mastery', 'Ethics'] },
      { tab: 'Enterprises', who: 'For organisations', title: 'Professionalism in service delivery.', text: 'Kalvia connects organisations with skilled professionals and strengthens professionalism in how services are delivered.', points: ['Vetted technicians for ongoing or project work', 'Structured quality assurance and standards', 'One partner for placement and management'], tags: ['Quality', 'Assurance'] }
    ]
  };
  const renderAudience = (box, list, idx) => {
    const a = list[idx];
    box.querySelector('.aud-body').innerHTML =
      `<span class="who">${a.who}</span><h4>${a.title}</h4><p>${a.text}</p>` +
      `<ul>${a.points.map(p => `<li>${p}</li>`).join('')}</ul>` +
      `<div class="promise-pill">${a.tags.map(t => `<span>${t}</span>`).join('')}</div>`;
    $$('.aud-tab', box).forEach((t, i) => t.setAttribute('aria-selected', i === idx));
  };
  $$('.audience').forEach(box => {
    const list = audiences[box.dataset.audience];
    box.innerHTML = `<div class="aud-tabs" role="tablist">${list.map((a, i) => `<button class="aud-tab" role="tab" type="button" aria-selected="${i === 0}">${a.tab}</button>`).join('')}</div><div class="aud-body panel-swap" role="tabpanel"></div>`;
    renderAudience(box, list, 0);
    $$('.aud-tab', box).forEach((t, i) => t.addEventListener('click', () => {
      const body = box.querySelector('.aud-body');
      body.classList.add('swapping');
      setTimeout(() => { renderAudience(box, list, i); body.classList.remove('swapping'); }, 200);
    }));
  });

  const brandTabs = $$('.brand-tab');
  const selectBrand = key => {
    brandTabs.forEach(t => {
      const on = t.dataset.brand === key;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) $$('.reveal', panel).forEach(r => r.classList.add('in'));
    });
  };
  brandTabs.forEach((t, i) => {
    t.addEventListener('click', () => selectBrand(t.dataset.brand));
    t.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = brandTabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + brandTabs.length) % brandTabs.length];
      n.focus(); selectBrand(n.dataset.brand);
    });
  });
  $$('a[data-brand]').forEach(a => a.addEventListener('click', () => selectBrand(a.dataset.brand)));
  $$('a[href="#academy"]:not([data-brand])').forEach(a => a.addEventListener('click', () => selectBrand('academy')));

  /* ---------- Absorb / Apply / Ascend ---------- */
  const zone = $('#mark-zone');
  const stepNum = $('#step-num');
  const zones = { book: ['52%', '30%', '#FF5A00'], gear: ['14%', '34%', '#FF5A00'], eye: ['0%', '100%', '#FFAE00'] };
  const setZone = (key, n) => {
    const [top, height, color] = zones[key];
    Object.assign(zone.style, { top, height, background: color, opacity: key === 'eye' ? .9 : .85 });
    stepNum.textContent = String(n).padStart(2, '0');
    stepNum.style.color = key === 'eye' ? 'var(--blue-1)' : 'var(--yellow)';
  };
  const steps = $$('.j-step');
  const stepObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      steps.forEach(s => s.classList.toggle('active', s === en.target));
      setZone(en.target.dataset.zone, steps.indexOf(en.target) + 1);
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  steps.forEach(s => stepObs.observe(s));
  setZone('book', 1);

  /* ---------- SOAT ---------- */
  const seal = $('#seal');
  const sealWrap = $('.seal-wrap');
  if (!reduced && matchMedia('(hover: hover)').matches) {
    sealWrap.addEventListener('mousemove', e => {
      const r = sealWrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      seal.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg)`;
    });
    sealWrap.addEventListener('mouseleave', () => { seal.style.transform = ''; });
  }
  const countEls = $$('[data-count]');
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count;
      if (reduced) { el.textContent = end; return; }
      const t0 = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - t0) / 1200);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: .6 });
  countEls.forEach(el => countObs.observe(el));

  // Sample register for the preview only. Replace with a call to Kalvia's live register.
  const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const today = new Date();
  const addMonths = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
  const sampleRegister = {
    'KA17/A': { name: 'Lagbaja Tamedu', trade: 'Electrical installation', initials: 'LT', expires: addMonths(today, 8) },
    'KA09/C': { name: 'Adebisi Adebolu', trade: 'Solar PV installation', initials: 'AA', expires: addMonths(today, -1) }
  };
  const vForm = $('#verify'), vInput = $('#soat-id'), vOut = $('#verify-result');
  const verify = () => {
    const id = vInput.value.trim().toUpperCase().replace(/\s+/g, '');
    vOut.classList.remove('show'); void vOut.offsetWidth;
    if (!id) { vOut.innerHTML = '<div class="verify-msg">Enter the ID printed on the technician\'s Kalvia card.</div>'; vOut.classList.add('show'); return; }
    const t = sampleRegister[id];
    if (!t) {
      vOut.innerHTML = `<div class="verify-msg">We couldn't find <strong>${id.replace(/[<>&"]/g, '')}</strong> in the sample register. Check the ID on their card, or contact us before hiring.</div>`;
    } else {
      const valid = t.expires > today;
      vOut.innerHTML = `<div class="tech-card"><div class="avatar" aria-hidden="true">${t.initials}</div><div><h4>${t.name}</h4><div class="meta">${t.trade} · ID ${id}</div><div class="meta">${valid ? 'Valid until' : 'Expired on'} ${fmt(t.expires)}</div></div><span class="badge ${valid ? 'ok' : 'warn'}">${valid ? 'SOAT valid' : 'Renewal due'}</span></div>`;
    }
    vOut.classList.add('show');
  };
  vForm.addEventListener('submit', e => { e.preventDefault(); verify(); });
  $$('[data-try]').forEach(b => b.addEventListener('click', () => { vInput.value = b.dataset.try; verify(); }));

  /* ---------- Path finder ---------- */
  const personas = {
    student: { kicker: 'Your door: Kalvia Academy', title: 'Build a career, not just a skill.', text: 'Practical training in the trades plus the professional skills clients expect. Graduate career-ready and SOAT-certified.', cta: 'Apply to the Academy', interest: 'Academy' },
    sponsor: { kicker: 'Your door: Kalvia Academy', title: 'Sponsor a future you can see.', text: 'Give someone a credible pathway to independence and security, with a structured programme you can trust.', cta: 'Sponsor a learner', interest: 'Sponsoring' },
    tech: { kicker: 'Your door: Kalvia Marketplace', title: 'Steady work, handled professionally.', text: 'Get access to jobs and clients, with placement, invoicing and tracking built in, and a seal customers recognise.', cta: 'Join the Marketplace', interest: 'Marketplace' },
    org: { kicker: 'Your door: Academy + Marketplace', title: 'Hire certified talent, or fund real impact.', text: 'Hire vetted technicians through the Marketplace, or sponsor Academy cohorts for measurable workforce and social impact.', cta: 'Talk to partnerships', interest: 'Partnership' }
  };
  const fOut = $('#finder-out');
  const setPersona = key => {
    const p = personas[key];
    $$('.persona').forEach(b => b.setAttribute('aria-pressed', b.dataset.persona === key));
    fOut.classList.add('swapping');
    setTimeout(() => {
      fOut.innerHTML = `<div><span class="kicker">${p.kicker}</span><h3>${p.title}</h3><p>${p.text}</p></div><a class="btn btn-blue" href="#contact" data-interest="${p.interest}">${p.cta} <span class="arrow">→</span></a>`;
      fOut.classList.remove('swapping');
    }, 180);
  };
  $$('.persona').forEach(b => b.addEventListener('click', () => setPersona(b.dataset.persona)));
  setPersona('student');

  /* ---------- Values: tap to flip on touch ---------- */
  $$('.value').forEach(v => v.addEventListener('click', () => v.classList.toggle('flipped')));

  /* ---------- Contact form ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-interest]');
    if (!a) return;
    const r = $(`input[name="interest"][value="${a.dataset.interest}"]`);
    if (r) r.checked = true;
  });
  const form = $('#contact-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('.field', form).forEach(f => {
      const input = f.querySelector('input[required], textarea[required]');
      if (!input) return;
      const valid = input.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()) : input.value.trim().length > 1;
      f.classList.toggle('invalid', !valid);
      if (!valid && ok) { input.focus(); ok = false; }
    });
    if (!ok) return;
    const name = form.elements.namedItem('name').value.trim().split(' ')[0].replace(/[<>&"]/g, '');
    // Preview only: wire this to Kalvia's form endpoint or CRM before launch.
    form.innerHTML = `<div class="form-done" role="status"><div class="big accent" style="color:var(--orange)">Thank you, ${name}!</div><h3>Your message is on its way.</h3><p style="color:var(--ink-soft)">We'll reply to you by email. Meanwhile, keep enabling prosperity.</p></div>`;
  });
  $$('input, textarea', form).forEach(i => i.addEventListener('input', () => i.closest('.field').classList.remove('invalid')));

  $('#year').textContent = new Date().getFullYear();
})();

