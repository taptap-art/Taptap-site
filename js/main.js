// Menu burger toggle
const burger = document.querySelector('.burger');
const nav = document.getElementById('site-menu');
if(burger && nav){
  burger.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
      const counters = e.target.querySelectorAll('.val[data-countto]');
      counters.forEach(startCounter);
    }
  });
}, {root:null, rootMargin:'0px 0px -10% 0px', threshold:.2});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

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

