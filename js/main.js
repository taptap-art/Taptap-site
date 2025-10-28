/* ================================
   TAPTAP — main.js (aggiornato)
   - Burger menu (toggle + chiudi on click/ESC/outside)
   - Reveal: on load + on scroll (accessibile)
   - Counters: partono quando entrano in viewport
================================== */

// ---------- Burger menu ----------
const burger = document.querySelector(".burger");
const nav = document.getElementById("site-menu");

if (burger && nav) {
  // Apri/chiudi
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  }, { passive: true });

  // Chiudi dopo click su una voce
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }, { passive: true });
  });

  // Chiudi con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  // Chiudi clic esterno
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("open")) return;
    const clickInside = nav.contains(e.target) || burger.contains(e.target);
    if (!clickInside) {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });
}

// ---------- Reveal on load + on scroll ----------
(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = Array.from(document.querySelectorAll(".reveal"));

  if (prefersReduced) { items.forEach(el => el.classList.add("in")); return; }

  // Helper visibilità
  const isVisible = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.88 && r.bottom > 0;
  };

  // Stagger iniziale (elementi già visibili al load)
  let loadDelay = 0;
  items.forEach(el => {
    if (isVisible(el)) {
      el.style.setProperty("--reveal-delay", `${loadDelay}ms`);
      el.classList.add("in");
      loadDelay += 70; // piccola cascata
    }
  });

  // Observer per il resto + ripetizione opzionale
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add("in");
        // trigger contatori se presenti dentro l'elemento
        el.querySelectorAll("[data-countto]").forEach(startCounterOnce);
        if (el.dataset.repeat !== "true") io.unobserve(el);
      } else if (el.dataset.repeat === "true") {
        el.classList.remove("in");
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  items.forEach(el => io.observe(el));
})();

// ---------- Counters ----------
function startCounter(el) {
  const target = parseFloat(el.dataset.countto);
  const isPercent = el.dataset.format === "percent";
  const isStar = el.dataset.format === "star";
  const negative = target < 0;

  let from = 0;
  const to = Math.abs(target);
  let start = null;
  const dur = 1200;

  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const val = from + (to - from) * p;
    const num = (isStar ? val.toFixed(2) : val.toFixed(1)).replace(".", ",");

    if (isPercent) {
      el.textContent = (negative ? "−" : "+") + num + "%";
    } else if (isStar) {
      el.textContent = (negative ? "−" : "+") + num + "★";
    } else {
      el.textContent = (negative ? "−" : "+") + num;
    }
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// avvia il contatore una sola volta
function startCounterOnce(el) {
  if (el.dataset._counted === "1") return;
  el.dataset._counted = "1";
  startCounter(el);
}