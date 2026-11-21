(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  const views = {
    home: document.getElementById('view-home'),
    register: document.getElementById('view-register'),
    issuing: document.getElementById('view-issuing'),
    member: document.getElementById('view-member'),
  };
  const cardWrapper = document.getElementById('card-tilt-wrapper');
  const card = document.getElementById('digital-membership-card');

  // ---------- Rivelazione a cascata / allo scroll ----------
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    : null;

  const revealTargets = {
    home: '#view-home > :not(.grid), #view-home > .grid > article',
    register: '#view-register > div:first-child, #registration-form > *',
    issuing: '#view-issuing > div',
    member: '#view-member > div:first-child, #view-member > div:nth-child(2) > :not(#card-tilt-wrapper), #view-member > .grid > div, #view-member > div:last-child',
  };

  function reveal(name) {
    if (reduce || !io) return;
    let i = 0;
    document.querySelectorAll(revealTargets[name]).forEach((el) => {
      if (el.classList.contains('hidden')) return;
      el.classList.remove('in');
      el.classList.add('reveal');
      el.style.setProperty('--d', `${Math.min(i++, 9) * 75}ms`);
      io.observe(el);
    });
    document.querySelectorAll(`#view-${name} .h-px.flex-1`).forEach((line, k) => {
      line.classList.remove('in');
      line.classList.add('reveal-line');
      line.style.setProperty('--d', `${300 + k * 120}ms`);
      io.observe(line);
    });
  }

  // ---------- Ingresso 3D della tessera ----------
  function enterCard() {
    if (reduce || !cardWrapper) return;
    cardWrapper.classList.remove('card-enter');
    card.classList.remove('card-float');
    void cardWrapper.offsetWidth;
    cardWrapper.classList.add('card-enter');
    cardWrapper.addEventListener('animationend', function done(e) {
      if (e.target !== cardWrapper) return;
      cardWrapper.removeEventListener('animationend', done);
      cardWrapper.classList.remove('card-enter');
      if (!finePointer) card.classList.add('card-float');
    });
  }

  // ---------- Pioggia di coriandoli d'oro ----------
  function goldBurst() {
    if (reduce) return;
    const c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:55';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const W = (c.width = innerWidth * dpr);
    const H = (c.height = innerHeight * dpr);
    const colors = ['#FBF3D5', '#F3E1A4', '#E5C66B', '#D4AF37', '#B89122', '#A81D2E'];
    const count = innerWidth < 640 ? 70 : 120;
    const parts = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = (7 + Math.random() * 9) * dpr;
      return {
        x: W / 2 + (Math.random() - 0.5) * W * 0.25,
        y: H * 0.42,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: (4 + Math.random() * 6) * dpr,
        h: (7 + Math.random() * 9) * dpr,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
      };
    });
    const start = performance.now();
    const life = 2600;
    (function frame(t) {
      const k = (t - start) / life;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += 0.32 * dpr;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - k * k);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.scale(1, Math.cos(p.r * 2.2));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (k < 1) requestAnimationFrame(frame);
      else c.remove();
    })(start);
  }

  // ---------- Polvere d'oro ambientale ----------
  function goldDust() {
    const canvas = document.getElementById('gold-dust');
    if (!canvas || reduce) return;
    const ctx = canvas.getContext('2d');
    let W, H, motes, running = true;
    const resize = () => {
      W = canvas.width = innerWidth * dpr;
      H = canvas.height = innerHeight * dpr;
      const n = innerWidth < 640 ? 26 : 48;
      motes = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (0.6 + Math.random() * 1.6) * dpr,
        vy: (0.08 + Math.random() * 0.22) * dpr,
        drift: Math.random() * Math.PI * 2,
        tw: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) requestAnimationFrame(tick);
    });
    function tick(t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (const m of motes) {
        m.y -= m.vy;
        m.x += Math.sin(t / 2600 + m.drift) * 0.18 * dpr;
        if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
        const a = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t / 900 + m.tw));
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 225, 164, ${a.toFixed(3)})`;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
        ctx.shadowBlur = 6 * dpr;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- Luce che segue il cursore (desktop) ----------
  function spotlight() {
    const s = document.querySelector('.spotlight');
    if (!s || !finePointer || reduce) return;
    let raf = 0, x = 0, y = 0;
    addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        s.style.setProperty('--mx', `${x}px`);
        s.style.setProperty('--my', `${y}px`);
        raf = 0;
      });
    }, { passive: true });
  }

  // ---------- Osservazione dei cambi vista ----------
  let current = Object.keys(views).find((k) => !views[k].classList.contains('hidden'));

  function onShow(name, previous) {
    if (!reduce) {
      views[name].classList.remove('view-enter');
      void views[name].offsetWidth;
      views[name].classList.add('view-enter');
    }
    reveal(name);
    if (name === 'member') {
      enterCard();
      if (previous === 'issuing') setTimeout(goldBurst, 350);
    }
  }

  const mo = new MutationObserver(() => {
    const visible = Object.keys(views).find((k) => !views[k].classList.contains('hidden'));
    if (visible && visible !== current) {
      const prev = current;
      current = visible;
      onShow(visible, prev);
    }
  });
  Object.values(views).forEach((v) => mo.observe(v, { attributes: true, attributeFilter: ['class'] }));

  goldDust();
  spotlight();
  if (current) reveal(current);
})();
