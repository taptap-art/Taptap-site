// Menu burger toggle
const burger = document.querySelector('.burger');
const nav = document.getElementById('site-menu');
if(burger && nav){
  burger.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// ===== Reveal on load + on scroll (accessibile) =====
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = Array.from(document.querySelectorAll('.reveal'));

  if (prefersReduced) {
    items.forEach(el => el.classList.add('in'));
    return;
  }

  // Stagger leggero per quelli già visibili al load
  const isVisible = el => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.88 && r.bottom > 0;
  };

  let loadDelay = 0;
  items.forEach(el => {
    if (isVisible(el)) {
      el.style.setProperty('--reveal-delay', `${loadDelay}ms`);
      el.classList.add('in');
      loadDelay += 70; // piccola cascata
    }
  });

  // IntersectionObserver per gli altri
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('in');
        // Se NON vuoi ripetere, smetti di osservare (default)
        if (el.dataset.repeat !== 'true') io.unobserve(el);
      } else {
        // Se vuoi che un elemento si rianimi ogni volta che rientra, usa data-repeat="true"
        if (el.dataset.repeat === 'true') el.classList.remove('in');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  items.forEach(el => io.observe(el));
})();
// Counters
function startCounter(el){
  const target = parseFloat(el.dataset.countto);
  const isPercent = el.dataset.format === 'percent';
  const isStar = el.dataset.format === 'star';
  const negative = target < 0;
  let from = 0;
  let to = Math.abs(target);
  let start = null;
  const dur = 1200;

  function step(ts){
    if(!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const val = from + (to - from) * p;
    const num = (isStar ? val.toFixed(2) : val.toFixed(1)).replace('.', ',');
    if(isPercent){
      el.textContent = (negative ? '−' : '+') + num + '%';
    }else if(isStar){
      el.textContent = (negative ? '−' : '+') + num + '★';
    }else{
      el.textContent = (negative ? '−' : '+') + num;
    }
    if(p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
// Chiude il menu dopo il click su un link
document.querySelectorAll('#site-menu a').forEach(link => {
  link.addEventListener('click', () => {
    const menu = document.querySelector('.nav');
    const burger = document.querySelector('.burger');

    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

