/**
 * MODUL TRIAL SPM 2026 - INTERACTIVE A4 LANDSCAPE FLIPBOOK ENGINE
 * Powered by StPageFlip with Apple Store Malaysia Design System
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuration
  const bookConfig = {
    pelajar: {
      title: "Versi Pelajar (Modul Soalan Topikal Kertas 2)",
      subtitle: "69 Muka Surat • Format A4 Landscape • Susunan Topikal Tingkatan 4 & 5",
      totalPages: 10
    },
    guru: {
      title: "Versi Guru (Skema Analisis & Tip A+)",
      subtitle: "69 Muka Surat • Format A4 Landscape • Rubrik Pemarkahan Rasmi & Tip Pemeriksa",
      totalPages: 10
    }
  };

  let currentMode = 'pelajar';
  let flipPelajar = null;
  let flipGuru = null;
  let soundEnabled = true;

  // DOM Elements
  const containerPelajar = document.getElementById('bookPelajar');
  const containerGuru = document.getElementById('bookGuru');
  const pageIndicator = document.getElementById('pageIndicator');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const soundBtn = document.getElementById('soundBtn');
  const activeBookTitle = document.getElementById('activeBookTitle');
  const activeBookDesc = document.getElementById('activeBookDesc');
  const segPelajar = document.getElementById('segPelajar');
  const segGuru = document.getElementById('segGuru');
  const flipbookCard = document.getElementById('flipbookCard');

  // Web Audio Synthesizer for Crisp Paper Flip Sound
  let audioCtx = null;
  function playPaperSound() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const bufferSize = audioCtx.sampleRate * 0.07; // 70ms
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2200;
      filter.Q.value = 2.0;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {
      // Audio not supported or blocked by browser
    }
  }

  // Calculate Responsive Dimensions for A4 Landscape (1.414 ratio)
  function getLandscapeDimensions() {
    const stageWidth = Math.min(window.innerWidth - 48, 1020);
    
    if (window.innerWidth <= 600) {
      // Small Mobile
      const width = Math.min(stageWidth * 0.96, 380);
      const height = Math.round(width / 1.414);
      return { width: Math.round(width), height: height };
    } else if (window.innerWidth <= 900) {
      // Tablet / Medium
      const width = Math.min(stageWidth * 0.88, 620);
      const height = Math.round(width / 1.414);
      return { width: Math.round(width), height: height };
    } else {
      // Desktop
      const width = Math.min(stageWidth * 0.78, 760);
      const height = Math.round(width / 1.414); // ~537px
      return { width: Math.round(width), height: height };
    }
  }

  function createFlipInstance(element, onFlipCallback) {
    const dims = getLandscapeDimensions();

    const instance = new St.PageFlip(element, {
      width: dims.width,
      height: dims.height,
      size: 'fixed',
      minWidth: 260,
      maxWidth: 820,
      minHeight: 180,
      maxHeight: 580,
      maxShadowOpacity: 0.35,
      showCover: false,
      mobileScrollSupport: true,
      usePortrait: true, // Clean single A4 landscape sheet view
      startPage: 0,
      drawShadow: true,
      flippingTime: 650,
      swipeDistance: 30
    });

    instance.loadFromHTML(element.querySelectorAll('.page'));

    instance.on('flip', (e) => {
      playPaperSound();
      if (onFlipCallback) onFlipCallback(e.data);
    });

    instance.on('changeState', (e) => {
      if (e.data === 'flipping') {
        playPaperSound();
      }
    });

    return instance;
  }

  function getActiveInstance() {
    return currentMode === 'pelajar' ? flipPelajar : flipGuru;
  }

  function updatePageIndicator(pageIndex) {
    const total = bookConfig[currentMode].totalPages;
    const current = Math.min(pageIndex + 1, total);
    pageIndicator.textContent = `Halaman ${current} / ${total}`;
    
    if (prevBtn) prevBtn.style.opacity = pageIndex === 0 ? '0.4' : '1';
    if (nextBtn) nextBtn.style.opacity = pageIndex >= total - 1 ? '0.4' : '1';
  }

  // Initialize both books
  function initAllBooks() {
    if (typeof St === 'undefined' || !St.PageFlip) {
      console.error('St.PageFlip library not ready');
      return;
    }

    try {
      if (flipPelajar) flipPelajar.destroy();
      if (flipGuru) flipGuru.destroy();
    } catch (e) {
      console.warn(e);
    }

    // Initialize Pelajar
    containerPelajar.style.display = 'block';
    containerGuru.style.display = 'none';

    flipPelajar = createFlipInstance(containerPelajar, (pageIndex) => {
      if (currentMode === 'pelajar') updatePageIndicator(pageIndex);
    });

    // Initialize Guru
    containerGuru.style.display = 'block';
    flipGuru = createFlipInstance(containerGuru, (pageIndex) => {
      if (currentMode === 'guru') updatePageIndicator(pageIndex);
    });

    // Set initial active state
    if (currentMode === 'pelajar') {
      containerPelajar.style.display = 'block';
      containerGuru.style.display = 'none';
      updatePageIndicator(flipPelajar.getCurrentPageIndex() || 0);
    } else {
      containerPelajar.style.display = 'none';
      containerGuru.style.display = 'block';
      updatePageIndicator(flipGuru.getCurrentPageIndex() || 0);
    }
  }

  // Segmented Switcher Handlers
  segPelajar.addEventListener('click', () => {
    if (currentMode === 'pelajar') return;
    currentMode = 'pelajar';
    segPelajar.classList.add('active');
    segGuru.classList.remove('active');

    activeBookTitle.textContent = bookConfig.pelajar.title;
    activeBookDesc.textContent = bookConfig.pelajar.subtitle;

    containerGuru.style.display = 'none';
    containerPelajar.style.display = 'block';
    if (flipPelajar) {
      updatePageIndicator(flipPelajar.getCurrentPageIndex());
    }
  });

  segGuru.addEventListener('click', () => {
    if (currentMode === 'guru') return;
    currentMode = 'guru';
    segGuru.classList.add('active');
    segPelajar.classList.remove('active');

    activeBookTitle.textContent = bookConfig.guru.title;
    activeBookDesc.textContent = bookConfig.guru.subtitle;

    containerPelajar.style.display = 'none';
    containerGuru.style.display = 'block';
    if (flipGuru) {
      updatePageIndicator(flipGuru.getCurrentPageIndex());
    }
  });

  // HUD Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const active = getActiveInstance();
      if (active) active.flipPrev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const active = getActiveInstance();
      if (active) active.flipNext();
    });
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.style.color = soundEnabled ? 'var(--apple-blue)' : 'var(--text-tertiary)';
      soundBtn.title = soundEnabled ? 'Bunyi: Hidup' : 'Bunyi: Senyap';
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        flipbookCard.requestFullscreen().catch(err => console.warn(err));
        fullscreenBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>`;
      } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>`;
      }
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      const active = getActiveInstance();
      if (active) active.flipNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      const active = getActiveInstance();
      if (active) active.flipPrev();
    }
  });

  // Responsive Resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initAllBooks();
    }, 350);
  });

  // Start initialization
  initAllBooks();
});
