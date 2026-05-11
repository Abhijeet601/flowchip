/* ═══════════════════════════════════════
   PAGE HERO SLIDER — Flowchip Infra
   Shared across About, Services, Process, Projects
═══════════════════════════════════════ */

function initPageHeroSlider(config) {
  const {
    trackId,
    dotsId,
    counterId,
    progressId,
    prevId,
    nextId,
    captionTitleId,
    captionId,
    slides,
    interval = 5000
  } = config;

  if (!slides || !slides.length) return;

  const track     = document.getElementById(trackId);
  const dotsWrap  = document.getElementById(dotsId);
  const counter   = document.getElementById(counterId);
  const progress  = document.getElementById(progressId);
  const prevBtn   = document.getElementById(prevId);
  const nextBtn   = document.getElementById(nextId);
  const capTitle  = document.getElementById(captionTitleId);
  const caption   = document.getElementById(captionId);

  if (!track) return;

  let current = 0;
  let timer   = null;
  let progTimer = null;

  // ── Build slide elements ──────────────────────────────────────
  slides.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'phs-slide' + (i === 0 ? ' is-active' : '');
    div.style.backgroundImage = `url('${s.src}')`;
    track.appendChild(div);
  });

  const slideEls = track.querySelectorAll('.phs-slide');

  // ── Build dots ────────────────────────────────────────────────
  if (dotsWrap) {
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'phs-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  // ── Build counter ─────────────────────────────────────────────
  if (counter) {
    updateCounter();
  }

  // ── Caption ───────────────────────────────────────────────────
  if (capTitle && slides[0].caption) {
    capTitle.textContent = slides[0].caption;
  }
  if (caption) {
    setTimeout(() => caption.classList.add('visible'), 600);
  }

  // ── Arrow buttons ─────────────────────────────────────────────
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // ── Go to slide ───────────────────────────────────────────────
  function goTo(index) {
    if (index === current) return;

    const prev = current;
    current = ((index % slides.length) + slides.length) % slides.length;

    // Transition slides
    slideEls.forEach((el, i) => {
      el.classList.remove('is-active', 'is-out');
      if (i === prev)    el.classList.add('is-out');
      if (i === current) el.classList.add('is-active');
    });

    // Update dots
    if (dotsWrap) {
      const dots = dotsWrap.querySelectorAll('.phs-dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    // Update counter
    if (counter) updateCounter();

    // Update caption
    if (capTitle && slides[current].caption) {
      if (caption) caption.classList.remove('visible');
      setTimeout(() => {
        capTitle.textContent = slides[current].caption;
        if (caption) caption.classList.add('visible');
      }, 400);
    }

    // Restart progress + autoplay
    startProgress();
  }

  // ── Counter display ───────────────────────────────────────────
  function updateCounter() {
    if (!counter) return;
    const cur = String(current + 1).padStart(2, '0');
    const tot = String(slides.length).padStart(2, '0');
    counter.innerHTML =
      `<span class="phs-counter-num active">${cur}</span>` +
      `<span class="phs-counter-sep"></span>` +
      `<span class="phs-counter-num">${tot}</span>`;
  }

  // ── Progress bar ──────────────────────────────────────────────
  function startProgress() {
    clearTimeout(timer);
    clearInterval(progTimer);

    if (!progress) {
      timer = setTimeout(() => goTo(current + 1), interval);
      return;
    }

    // Reset
    progress.style.transition = 'none';
    progress.style.width = '0%';

    // Force reflow
    void progress.offsetWidth;

    // Animate
    progress.style.transition = `width ${interval}ms linear`;
    progress.style.width = '100%';

    // Auto-advance
    timer = setTimeout(() => goTo(current + 1), interval);
  }

  // ── Kick off ──────────────────────────────────────────────────
  startProgress();

  // ── Pause on hover ────────────────────────────────────────────
  const heroEl = track.closest('.page-hero');
  if (heroEl) {
    heroEl.addEventListener('mouseenter', () => {
      clearTimeout(timer);
      clearInterval(progTimer);
    });
    heroEl.addEventListener('mouseleave', () => {
      startProgress();
    });
  }

  // ── Keyboard navigation ───────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (!heroEl) return;
    const rect = heroEl.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });
}
