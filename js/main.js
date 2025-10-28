/* ================================
   TAPTAP — main.js (finale consigliato)
   - Burger menu (toggle + chiudi on click/ESC/outside)
   - Reveal: on load + on scroll (accessibile)
   - Counters: partono in viewport + rispetto reduce-motion
   - Smooth anchor scroll
================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mostra comunque i contenuti anche se JS parte in ritardo
  document.body.classList.add('reveal-ready');

  // ---------- Burger menu ----------
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('site-menu');

  if (burger && nav) {
    // Apri/chiudi
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Chiudi dopo click su una voce + smooth scroll
    nav.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          nav.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          // scroll morbido (rispetta preferenze di movimento)
          target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
          // Aggiorna hash senza saltare
          history.pushState(null, '', id);
        }
      });
    });

    // Chiudi con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    // Chiudi clic esterno
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      const clickInside = nav.contains(e.target) || burger.contains(e.target);
      if (!clickInside) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- Reveal on load + on scroll ----------
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (prefersReducedMotion()) {
    items.forEach(el => el.classList.add('in'));
  } else {
    const isVisible = (el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.88 && r.bottom > 0;
    };

    // Stagger iniziale (già visibili al load)
    let loadDelay = 0;
    items.forEach(el => {
      if (isVisible(el)) {
        el.style.setProperty('--reveal-delay', `${loadDelay}ms`);
        el.classList.add('in');
        // attiva eventuali contatori dentro l'elemento
        el.querySelectorAll('[data-countto]').forEach(startCounterOnce);
        loadDelay += 100; // elegante ma reattivo
      }
    });

    // Observer per il resto (+ ripetizione opzionale)
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

    // Contatori già visibili al load ma fuori da .reveal
    document.querySelectorAll('[data-countto]').forEach(el => {
      if (isVisible(el)) startCounterOnce(el);
    });
  }

  // ---------- Smooth scroll per eventuali anchor fuori dal menu ----------
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    // se è già gestito nel nav sopra, salta
    if (nav && nav.contains(link)) return;
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
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

  // se reduce-motion: imposta subito il valore finale
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
  const dur = 1300; // leggermente più lento

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