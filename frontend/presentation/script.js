/* ==========================================================================
   ICORE E&C INSTRUCTOR MATCHING PRESENTATION DECK - SMOOTH TRANSITIONS SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const currentIndexEl = document.getElementById('current-index');
  const totalSlidesEl = document.getElementById('total-slides');
  const progressFill = document.getElementById('slide-progress');
  const btnPrev = document.getElementById('prev-slide');
  const btnNext = document.getElementById('next-slide');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnGrid = document.getElementById('btn-grid');
  const btnPrint = document.getElementById('btn-print');
  const gridModal = document.getElementById('grid-modal');
  const closeModal = document.getElementById('close-modal');
  const modalSlideList = document.getElementById('modal-slide-list');

  let currentSlide = 0;
  const total = slides.length;

  totalSlidesEl.textContent = total;

  // Render Slide List in Modal
  slides.forEach((slide, idx) => {
    const title = slide.getAttribute('data-title') || `슬라이드 ${idx + 1}`;
    const item = document.createElement('div');
    item.className = `grid-item ${idx === 0 ? 'current' : ''}`;
    item.innerHTML = `
      <div class="grid-item-num">SLIDE ${String(idx + 1).padStart(2, '0')}</div>
      <div class="grid-item-title">${title}</div>
    `;
    item.addEventListener('click', () => {
      goToSlide(idx);
      gridModal.classList.remove('open');
    });
    modalSlideList.appendChild(item);
  });

  function updateSlideState() {
    slides.forEach((s, i) => {
      s.classList.remove('active', 'prev-state');
      if (i === currentSlide) {
        s.classList.add('active');
      } else if (i < currentSlide) {
        s.classList.add('prev-state');
      }
    });

    currentIndexEl.textContent = currentSlide + 1;
    const progressPct = ((currentSlide + 1) / total) * 100;
    progressFill.style.width = `${progressPct}%`;

    // Update modal highlight
    const items = modalSlideList.querySelectorAll('.grid-item');
    items.forEach((item, i) => {
      if (i === currentSlide) {
        item.classList.add('current');
      } else {
        item.classList.remove('current');
      }
    });
  }

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= total) index = total - 1;
    currentSlide = index;
    updateSlideState();
  }

  btnPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
  btnNext.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (gridModal.classList.contains('open')) {
      if (e.key === 'Escape') gridModal.classList.remove('open');
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'PageDown') {
      e.preventDefault();
      goToSlide(currentSlide + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      goToSlide(currentSlide - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(total - 1);
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  });

  // Modal handlers
  btnGrid.addEventListener('click', () => gridModal.classList.add('open'));
  closeModal.addEventListener('click', () => gridModal.classList.remove('open'));
  gridModal.addEventListener('click', (e) => {
    if (e.target === gridModal) gridModal.classList.remove('open');
  });

  // Fullscreen Handler
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Fullscreen request error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  btnFullscreen.addEventListener('click', toggleFullscreen);

  // PDF / Print Handler
  btnPrint.addEventListener('click', () => {
    window.print();
  });

  // Dynamic Background Canvas & Constellation Network
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const particles = [];
  const particleCount = 55;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2.8 + 1.2,
      color: Math.random() > 0.5 ? 'rgba(2, 132, 199, ' : 'rgba(147, 51, 234, ',
      alpha: Math.random() * 0.4 + 0.2
    });
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      // Connect nearby particles with glowing lines
      const connectDistance = currentSlide === 0 ? 140 : 80;
      for (let j = i + 1; j < particleCount; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectDistance) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          const lineAlpha = (1 - dist / connectDistance) * (currentSlide === 0 ? 0.25 : 0.1);
          ctx.strokeStyle = `rgba(2, 132, 199, ${lineAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateCanvas);
  }

  animateCanvas();
  updateSlideState();
});
