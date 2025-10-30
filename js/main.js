/* ================================
   TAPTAP — main.js
   - Burger menu (toggle + chiudi on click/ESC/outside)
   - Reveal: on load + on scroll (per .reveal)
   - Counters: partono quando entrano
   - Smooth anchor scroll
   - Dashboard demo
================================== */

document.addEventListener('DOMContentLoaded', () => {
  // sblocca subito gli elementi (così non rimangono visibili se JS tarda)
  document.body.classList.add('reveal-ready');

  // ---------- BURGER ----------
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('site-menu');

  if (burger && nav) {
    // apri/chiudi
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // click su una voce del menu
    nav.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          // chiudi menu
          nav.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          // scrolla
          target.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start'
          });
          history.pushState(null, '', id);
        }
      });
    });

    // chiudi con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    // chiudi clic esterno
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      const clickInside = nav.contains(e.target) || burger.contains(e.target);
      if (!clickInside) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- REVEAL (slide-up) ----------
  const items = Array.from(document.querySelectorAll('.reveal'));

  if (prefersReducedMotion()) {
    // se l'utente non vuole animazioni → mostra tutto
    items.forEach(el => el.classList.add('in'));
    // avvia eventuali contatori subito
    document.querySelectorAll('[data-countto]').forEach(startCounterOnce);
  } else {
    // observer che accende le sezioni quando entrano
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          // fai apparire (classe in → la usa il CSS nuovo)
          el.classList.add('in');

          // se dentro ci sono contatori, partono ora
          el.querySelectorAll('[data-countto]').forEach(startCounterOnce);

          // se non deve ripetersi, dopo la prima volta smetti di osservarlo
          if (el.dataset.repeat !== 'true') {
            io.unobserve(el);
          }
        } else if (el.dataset.repeat === 'true') {
          // caso raro: se vuoi che sparisca quando esce
          el.classList.remove('in');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    });

    // attacca l'observer a tutte le .reveal
    items.forEach(el => io.observe(el));

    // contatori già visibili ma non dentro .reveal
    document.querySelectorAll('[data-countto]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        startCounterOnce(el);
      }
    });
  }

  // ---------- SMOOTH SCROLL per link fuori dal menu ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    // quelli nel nav li abbiamo già gestiti sopra
    if (nav && nav.contains(link)) return;
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start'
        });
        history.pushState(null, '', id);
      }
    });
  });

  // ---------- DEMO DASHBOARD (se c'è) ----------
  const frame = document.querySelector('#demo-dashboard .laptop-frame');
  if (frame) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          frame.classList.add('play');
          io2.disconnect();
        }
      });
    }, { threshold: 0.35 });
    io2.observe(frame);
  }
});

/* ---------- Helpers ---------- */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------- Counters ---------- */
function startCounter(el) {
  const target = parseFloat(el.dataset.countto);
  const isPercent = el.dataset.format === 'percent';
  const isStar = el.dataset.format === 'star';
  const negative = target < 0;

  // niente animazione se reduce-motion
  if (prefersReducedMotion()) {
    const final = formatNumber(Math.abs(target), isStar ? 2 : 1);
    if (isPercent) el.textContent = (negative ? '−' : '+') + final + '%';
    else if (isStar) el.textContent = (negative ? '−' : '+') + final + '★';
    else el.textContent = (negative ? '−' : '+') + final;
    return;
  }

  let from = 0;
  const to = Math.abs(target);
  let start = null;
  const dur = 1300;

  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const val = from + (to - from) * p;
    const num = formatNumber(val, isStar ? 2 : 1);

    if (isPercent) el.textContent = (negative ? '−' : '+') + num + '%';
    else if (isStar) el.textContent = (negative ? '−' : '+') + num + '★';
    else el.textContent = (negative ? '−' : '+') + num;

    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function startCounterOnce(el) {
  if (el.dataset._counted === '1') return;
  el.dataset._counted = '1';
  startCounter(el);
}

function formatNumber(value, digits) {
  return Number(value).toFixed(digits).replace('.', ',');
}