/**
 * SPM 2026 PHYSICS MODULE - MASTER CINEMATIC WEB ENGINE
 * Autonomous Pipeline: 60FPS Keyframe-4 Video Scrubbing + GSAP ScrollTrigger + Liquid Glass Indicator + 3D Flipbook
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. DATA CONFIGURATION & STATE
  // ==========================================================================
  const bookData = {
    pelajar: {
      title: "Student Version (Topical Question Module)",
      totalPages: 10,
      pages: [
        { src: "assets/pages/pelajar/page_1.jpg", alt: "Student Version Page 1 (Cover Page)" },
        { src: "assets/pages/pelajar/page_2.jpg", alt: "Student Version Page 2 (Marks Distribution & Guide)" },
        { src: "assets/pages/pelajar/page_3.jpg", alt: "Student Version Page 3 (Chapter 1 Measurement)" },
        { src: "assets/pages/pelajar/page_4.jpg", alt: "Student Version Page 4 (Chapter 2 Force & Motion I)" },
        { src: "assets/pages/pelajar/page_5.jpg", alt: "Student Version Page 5 (Structured Questions SPM Trial)" },
        { src: "assets/pages/pelajar/page_6.jpg", alt: "Student Version Page 6 (Section B Questions)" },
        { src: "assets/pages/pelajar/page_7.jpg", alt: "Student Version Page 7 (Section C Questions)" },
        { src: "assets/pages/pelajar/page_8.jpg", alt: "Student Version Page 8 (Chapter 3 Gravitation)" },
        { src: "assets/pages/pelajar/page_9.jpg", alt: "Student Version Page 9 (Chapter 4 Heat)" },
        { src: "assets/pages/pelajar/page_10.jpg", alt: "Student Version Page 10 (Chapter 5 Waves)" }
      ]
    },
    guru: {
      title: "Teacher Version (Analytical Scheme & A+ Tips)",
      totalPages: 10,
      pages: [
        { src: "assets/pages/guru/page_1.jpg", alt: "Teacher Version Page 1 (Cover Page)" },
        { src: "assets/pages/guru/page_2.jpg", alt: "Teacher Version Page 2 (Marking Rubrics & Scheme)" },
        { src: "assets/pages/guru/page_3.jpg", alt: "Teacher Version Page 3 (Answer Scheme Chapter 1)" },
        { src: "assets/pages/guru/page_4.jpg", alt: "Teacher Version Page 4 (Answer Scheme Chapter 2)" },
        { src: "assets/pages/guru/page_5.jpg", alt: "Teacher Version Page 5 (Step-by-Step Mark Breakdown)" },
        { src: "assets/pages/guru/page_6.jpg", alt: "Teacher Version Page 6 (Compulsory Keywords & Formulas)" },
        { src: "assets/pages/guru/page_7.jpg", alt: "Teacher Version Page 7 (Section C Scheme & Max Mark Tips)" },
        { src: "assets/pages/guru/page_8.jpg", alt: "Teacher Version Page 8 (Answer Scheme Chapter 3 Gravitation)" },
        { src: "assets/pages/guru/page_9.jpg", alt: "Teacher Version Page 9 (Answer Scheme Chapter 4 Heat)" },
        { src: "assets/pages/guru/page_10.jpg", alt: "Teacher Version Page 10 (Answer Scheme Chapter 5 Waves)" }
      ]
    }
  };

  let currentMode = 'pelajar';
  let currentPageIndex = 0;
  let isFlipping = false;
  let soundEnabled = true;

  // Video & Nav State
  const heroVideo = document.getElementById('heroVideo');
  const scrollContainer = document.getElementById('scrollContainer');
  const globalNav = document.getElementById('globalNav');
  const scrollIndicator = document.getElementById('scrollIndicator');

  // Flipbook DOM
  const bookContainer = document.getElementById('landscapeBook');
  const baseLayer = document.getElementById('baseLayer');
  const pageIndicator = document.getElementById('pageIndicator');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const soundBtn = document.getElementById('soundBtn');
  const flipbookCard = document.getElementById('flipbookCard');
  const accordionItems = document.querySelectorAll('.accordion-item');

  // ==========================================================================
  // 2. WEB AUDIO SYNTHESIZER (CRISP PAPER FLIP)
  // ==========================================================================
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playPaperSound() {
    if (!soundEnabled) return;
    try {
      initAudioContext();
      const bufferSize = audioCtx.sampleRate * 0.08;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2400;
      filter.Q.value = 2.2;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) {}
  }

  // ==========================================================================
  // ==========================================================================
  // 3. APPLE PROMOTION 120HZ / 60FPS HARDWARE CANVAS SCROLL & MORPHING ENGINE
  // ==========================================================================
  const canvas = document.getElementById('cinematicCanvas');
  const ctx = canvas ? canvas.getContext('2d', { alpha: false, desynchronized: true }) : null;
  const frameCount = 120;
  const frameImages = [];
  let isFramesLoaded = false;
  let targetFrameProgress = 0;
  let currentRenderProgress = 0;
  let lastRenderedProgress = -1;

  function setCanvasResolution() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = (rect.width || window.innerWidth) * dpr;
    canvas.height = (rect.height || window.innerHeight) * dpr;
    drawMorphFrame(currentRenderProgress);
  }

  /**
   * Continuous Sub-Frame Morphing Engine:
   * Uses fractional Hermite SmoothStep interpolation between adjacent video keyframes
   * completely eliminating discrete frame stepping and stutter during scroll.
   */
  function drawMorphFrame(progress) {
    if (!ctx || !canvas) return;
    const clamped = Math.min(Math.max(progress, 0), 1);
    const rawIndex = clamped * (frameCount - 1);
    const indexA = Math.floor(rawIndex);
    const indexB = Math.min(indexA + 1, frameCount - 1);
    const t = rawIndex - indexA; // fractional sub-frame distance (0.0 to 1.0)

    // Hermite SmoothStep curve: S(t) = 3t^2 - 2t^3
    const morphFactor = t * t * (3 - 2 * t);

    let imgA = frameImages[indexA];
    let imgB = frameImages[indexB];

    // Safe fallback if target frame is still streaming into cache
    if (!imgA || !imgA.complete) {
      for (let offset = 1; offset < frameCount; offset++) {
        if (frameImages[indexA - offset] && frameImages[indexA - offset].complete) {
          imgA = frameImages[indexA - offset];
          break;
        }
        if (frameImages[indexA + offset] && frameImages[indexA + offset].complete) {
          imgA = frameImages[indexA + offset];
          break;
        }
      }
    }
    if (!imgA || !imgA.complete) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = imgA.naturalWidth || 1280;
    const ih = imgA.naturalHeight || 720;
    const hRatio = cw / iw;
    const vRatio = ch / ih;
    const ratio = Math.max(hRatio, vRatio);
    const renderW = iw * ratio;
    const renderH = ih * ratio;
    const shiftX = (cw - renderW) / 2;
    const shiftY = (ch - renderH) / 2;

    // Draw primary base frame at full opacity
    ctx.globalAlpha = 1.0;
    ctx.drawImage(imgA, 0, 0, iw, ih, shiftX, shiftY, renderW, renderH);

    // Continuous sub-frame morphing cross-dissolve
    if (morphFactor > 0.002 && indexB !== indexA && imgB && imgB.complete) {
      ctx.globalAlpha = morphFactor;
      ctx.drawImage(imgB, 0, 0, iw, ih, shiftX, shiftY, renderW, renderH);
      ctx.globalAlpha = 1.0;
    }
  }

  // Preload all frames asynchronously for zero-latency 120Hz scrubbing
  let loadedCount = 0;
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    const pad = String(i).padStart(3, '0');
    img.src = `assets/media/frames/frame_${pad}.webp`;
    img.onload = () => {
      loadedCount++;
      if (loadedCount === 1) {
        setCanvasResolution();
        drawMorphFrame(0);
      }
      if (loadedCount >= 10 && !isFramesLoaded) {
        isFramesLoaded = true;
        initScrollTrigger();
      }
    };
    frameImages.push(img);
  }

  // 120Hz ProMotion LERP Render Loop with Sub-Frame Morphing
  function promotionRenderLoop() {
    const diff = targetFrameProgress - currentRenderProgress;
    if (Math.abs(diff) > 0.00002) {
      // Fluid continuous LERP damping (0.18 per frame)
      currentRenderProgress += diff * 0.18;
      drawMorphFrame(currentRenderProgress);
      lastRenderedProgress = currentRenderProgress;
    } else if (Math.abs(lastRenderedProgress - targetFrameProgress) > 0.00001) {
      currentRenderProgress = targetFrameProgress;
      drawMorphFrame(currentRenderProgress);
      lastRenderedProgress = currentRenderProgress;
    }
    requestAnimationFrame(promotionRenderLoop);
  }
  requestAnimationFrame(promotionRenderLoop);

  window.addEventListener('resize', setCanvasResolution, { passive: true });

  function initScrollTrigger() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

    const timelineConfig = {
      scrollTrigger: {
        trigger: ".cinematic-scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.05,
        onUpdate: (self) => {
          targetFrameProgress = self.progress;
          // Fade out scroll indicator when scrolling past 12%
          if (scrollIndicator) {
            scrollIndicator.style.opacity = self.progress > 0.12 ? '0' : '1';
            scrollIndicator.style.pointerEvents = self.progress > 0.12 ? 'none' : 'auto';
          }
        }
      }
    };

    gsap.timeline(timelineConfig);

    // Chapter Content Fade & Parallax Animations (Center-Left Frosted Glass Cards)
    gsap.fromTo("#ch1 .apple-editorial-card", 
      { opacity: 1, y: 0 }, 
      { opacity: 0, y: -50, scrollTrigger: { trigger: "#ch1", start: "top top", end: "bottom top", scrub: 1 } }
    );

    gsap.fromTo("#ch2 .apple-editorial-card", 
      { opacity: 0, y: 70, scale: 0.96 }, 
      { opacity: 1, y: 0, scale: 1, scrollTrigger: { trigger: "#ch2", start: "top 70%", end: "center center", scrub: 1 } }
    );

    gsap.fromTo("#ch3 .apple-editorial-card", 
      { opacity: 0, y: 70 }, 
      { opacity: 1, y: 0, scrollTrigger: { trigger: "#ch3", start: "top 70%", end: "center center", scrub: 1 } }
    );

    gsap.fromTo("#ch4 .apple-editorial-card", 
      { opacity: 0, y: 70 }, 
      { opacity: 1, y: 0, scrollTrigger: { trigger: "#ch4", start: "top 70%", end: "center center", scrub: 1 } }
    );

    // Navbar light mode switch on flipbook section
    ScrollTrigger.create({
      trigger: "#flipbookSection",
      start: "top 80px",
      onEnter: () => globalNav && globalNav.classList.add('scrolled-light'),
      onLeaveBack: () => globalNav && globalNav.classList.remove('scrolled-light')
    });
  }

  // Smooth scroll handler for Liquid Glass Scroll button
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('flipbookSection');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ==========================================================================
  // 4. INTERACTIVE 3D A4 LANDSCAPE FLIPBOOK ENGINE
  // ==========================================================================
  function getActivePages() {
    return bookData[currentMode].pages;
  }

  function updateIndicator() {
    const total = getActivePages().length;
    if (pageIndicator) pageIndicator.textContent = `Page ${currentPageIndex + 1} / ${total}`;
    if (prevBtn) prevBtn.style.opacity = currentPageIndex === 0 ? '0.4' : '1';
    if (nextBtn) nextBtn.style.opacity = currentPageIndex >= total - 1 ? '0.4' : '1';
  }

  function renderCurrentPage() {
    const pages = getActivePages();
    if (!baseLayer) return;
    baseLayer.innerHTML = `
      <img src="${pages[currentPageIndex].src}" alt="${pages[currentPageIndex].alt}">
      <div class="corner-hint"></div>
    `;
    updateIndicator();
  }

  function flipNext() {
    const pages = getActivePages();
    if (currentPageIndex >= pages.length - 1 || isFlipping) return;

    isFlipping = true;
    playPaperSound();

    const currentSrc = pages[currentPageIndex].src;
    const nextSrc = pages[currentPageIndex + 1].src;

    baseLayer.innerHTML = `<img src="${nextSrc}" alt="${pages[currentPageIndex + 1].alt}">`;

    const sheet = document.createElement('div');
    sheet.className = 'flipping-sheet flip-forward';
    sheet.innerHTML = `
      <div class="page-layer" style="backface-visibility: hidden;">
        <img src="${currentSrc}">
      </div>
      <div class="page-layer" style="transform: rotateY(180deg); backface-visibility: hidden; background: #fafafa;">
        <img src="${nextSrc}">
      </div>
    `;

    bookContainer.appendChild(sheet);

    setTimeout(() => {
      currentPageIndex++;
      sheet.remove();
      renderCurrentPage();
      isFlipping = false;
    }, 550);
  }

  function flipPrev() {
    const pages = getActivePages();
    if (currentPageIndex <= 0 || isFlipping) return;

    isFlipping = true;
    playPaperSound();

    const currentSrc = pages[currentPageIndex].src;
    const prevSrc = pages[currentPageIndex - 1].src;

    baseLayer.innerHTML = `<img src="${prevSrc}" alt="${pages[currentPageIndex - 1].alt}">`;

    const sheet = document.createElement('div');
    sheet.className = 'flipping-sheet flip-backward';
    sheet.innerHTML = `
      <div class="page-layer" style="backface-visibility: hidden;">
        <img src="${prevSrc}">
      </div>
      <div class="page-layer" style="transform: rotateY(180deg); backface-visibility: hidden; background: #fafafa;">
        <img src="${currentSrc}">
      </div>
    `;

    bookContainer.appendChild(sheet);

    setTimeout(() => {
      currentPageIndex--;
      sheet.remove();
      renderCurrentPage();
      isFlipping = false;
    }, 550);
  }

  function switchMode(newMode) {
    if (currentMode === newMode && !isFlipping) return;
    currentMode = newMode;
    currentPageIndex = 0;
    isFlipping = false;
    renderCurrentPage();
  }

  // Accordion Interaction Handlers
  accordionItems.forEach(item => {
    item.addEventListener('click', () => {
      const mode = item.getAttribute('data-mode');
      accordionItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      if (mode === 'pelajar') {
        switchMode('pelajar');
      } else if (mode === 'guru') {
        switchMode('guru');
      } else if (mode === 'format') {
        switchMode('pelajar');
      }
    });
  });

  // Click on book to turn page
  if (bookContainer) {
    bookContainer.addEventListener('click', (e) => {
      const rect = bookContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX > rect.width * 0.5) {
        flipNext();
      } else {
        flipPrev();
      }
    });

    // Smart Mobile & Tablet Touch Swipe
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    bookContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    bookContainer.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const elapsedTime = Date.now() - touchStartTime;

        if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.3 && elapsedTime < 600) {
          if (diffX < 0) {
            flipNext();
          } else {
            flipPrev();
          }
        }
      }
    }, { passive: true });
  }

  // HUD Buttons
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); flipPrev(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); flipNext(); });

  if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEnabled = !soundEnabled;
      soundBtn.style.color = soundEnabled ? 'var(--apple-blue-solid)' : 'var(--text-tertiary)';
      soundBtn.title = soundEnabled ? 'Page Turn Sound: On' : 'Page Turn Sound: Muted';
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        flipbookCard.requestFullscreen().catch(err => console.warn(err));
        fullscreenBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>`;
      } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>`;
      }
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      flipNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      flipPrev();
    }
  });

  // Initial Render
  renderCurrentPage();
});
