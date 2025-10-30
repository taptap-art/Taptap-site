/* ================================
   TAPTAP — main.js (finale consigliato)
   - Burger menu (toggle + chiudi on click/ESC/outside)
   - Reveal: on load + on scroll
   - Counters: partono in viewport
   - Smooth anchor scroll
================================== */

document.addEventListener('DOMContentLoaded', () => {
  // fa comparire i contenuti anche se JS arriva dopo
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

    // click su una voce
    nav.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          nav.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
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

  // ---------- REVEAL ----------
  const items = Array.from(document.querySelectorAll('.reveal'));

  if (prefersReducedMotion()) {
    // niente animazioni: mostra tutto
    items.forEach(el => el.classList.add('in'));
  } else {
    const isVisible = (el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.88 && r.bottom > 0;
    };

    // elementi già visibili al load
    let loadDelay = 0;
    items.forEach(el => {
      if (isVisible(el)) {
        el.style.setProperty('--reveal-delay', `${loadDelay}ms`);
        el.classList.add('in');
        // eventuali contatori già visibili
        el.querySelectorAll('[data-countto]').forEach(startCounterOnce);
        loadDelay += 100;
      }
    });

    // observer per gli altri
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('in');
          el.querySelectorAll('[data-countto]').forEach(startCounterOnce);
          if (el.dataset.repeat !== 'true') io.unobserve(el);
        } else if (el.dataset.repeat === 'true') {
          el.classList.remove('in');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(el => io.observe(el));

    // contatori fuori dalle .reveal ma già in viewport
    document.querySelectorAll('[data-countto]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        startCounterOnce(el);
      }
    });
  }

  // ---------- SMOOTH SCROLL per link fuori dal menu ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (nav && nav.contains(link)) return; // già gestiti sopra
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
});

/* ---------- Helpers ---------- */
function prefersReducedMotion(){
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------- Counters ---------- */
function startCounter(el) {
  const target = parseFloat(el.dataset.countto);
  const isPercent = el.dataset.format === 'percent';
  const isStar = el.dataset.format === 'star';
  const negative = target < 0;

  // se reduce-motion: metti direttamente il valore finale
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

function formatNumber(value, digits){
  return Number(value).toFixed(digits).replace('.', ',');
}

// ---------- demo dashboard (se c'è) ----------
(function(){
  const frame = document.querySelector('#demo-dashboard .laptop-frame');
  if(!frame) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        frame.classList.add('play');
        io.disconnect();
      }
    });
  },{threshold:0.35});
  io.observe(frame);
})();