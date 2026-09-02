/**
 * MODUL TRIAL SPM 2026 - INTERACTIVE A4 LANDSCAPE FLIPBOOK ENGINE
 * Powered by StPageFlip with Apple Store Malaysia Design System
 */

document.addEventListener('DOMContentLoaded', () => {
  // Book Data Configuration
  const bookData = {
    pelajar: {
      title: "Versi Pelajar (Modul Soalan Topikal Kertas 2)",
      subtitle: "69 Muka Surat • Format A4 Landscape • Susunan Topikal Tingkatan 4 & 5",
      totalPages: 10,
      pages: [
        { src: "assets/pages/pelajar/page_1.jpg", alt: "Versi Pelajar M/S 1 (Muka Depan)" },
        { src: "assets/pages/pelajar/page_2.jpg", alt: "Versi Pelajar M/S 2 (Agihan Markah & Panduan)" },
        { src: "assets/pages/pelajar/page_3.jpg", alt: "Versi Pelajar M/S 3 (Bab 1 Pengukuran)" },
        { src: "assets/pages/pelajar/page_4.jpg", alt: "Versi Pelajar M/S 4 (Bab 2 Daya & Gerakan I)" },
        { src: "assets/pages/pelajar/page_5.jpg", alt: "Versi Pelajar M/S 5 (Soalan Struktur Percubaan SPM)" },
        { src: "assets/pages/pelajar/page_6.jpg", alt: "Versi Pelajar M/S 6 (Soalan Bahagian B)" },
        { src: "assets/pages/pelajar/page_7.jpg", alt: "Versi Pelajar M/S 7 (Soalan Bahagian C)" },
        { src: "assets/pages/pelajar/page_8.jpg", alt: "Versi Pelajar M/S 8 (Bab 3 Kegravitian)" },
        { src: "assets/pages/pelajar/page_9.jpg", alt: "Versi Pelajar M/S 9 (Bab 4 Haba)" },
        { src: "assets/pages/pelajar/page_10.jpg", alt: "Versi Pelajar M/S 10 (Bab 5 Gelombang)" }
      ]
    },
    guru: {
      title: "Versi Guru (Skema Analisis & Tip A+)",
      subtitle: "69 Muka Surat • Format A4 Landscape • Rubrik Pemarkahan Rasmi & Tip Pemeriksa",
      totalPages: 10,
      pages: [
        { src: "assets/pages/guru/page_1.jpg", alt: "Versi Guru M/S 1 (Muka Depan)" },
        { src: "assets/pages/guru/page_2.jpg", alt: "Versi Guru M/S 2 (Rubrik & Skema Pemarkahan)" },
        { src: "assets/pages/guru/page_3.jpg", alt: "Versi Guru M/S 3 (Skema Jawapan Bab 1)" },
        { src: "assets/pages/guru/page_4.jpg", alt: "Versi Guru M/S 4 (Skema Jawapan Bab 2)" },
        { src: "assets/pages/guru/page_5.jpg", alt: "Versi Guru M/S 5 (Pemarkahan Langkah Demi Langkah)" },
        { src: "assets/pages/guru/page_6.jpg", alt: "Versi Guru M/S 6 (Kata Kunci Wajib & Formula)" },
        { src: "assets/pages/guru/page_7.jpg", alt: "Versi Guru M/S 7 (Skema Bahagian C & Tip Maksimum)" },
        { src: "assets/pages/guru/page_8.jpg", alt: "Versi Guru M/S 8 (Skema Bab 3 Kegravitian)" },
        { src: "assets/pages/guru/page_9.jpg", alt: "Versi Guru M/S 9 (Skema Bab 4 Haba)" },
        { src: "assets/pages/guru/page_10.jpg", alt: "Versi Guru M/S 10 (Skema Bab 5 Gelombang)" }
      ]
    }
  };

  let currentMode = 'pelajar';
  let pageFlipInstance = null;
  let soundEnabled = true;

  // DOM Elements
  const wrapper = document.getElementById('flipbookWrapper');
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

  function updatePageIndicator(pageIndex) {
    const total = bookData[currentMode].totalPages;
    const current = Math.min(pageIndex + 1, total);
    pageIndicator.textContent = `Halaman ${current} / ${total}`;
    
    if (prevBtn) prevBtn.style.opacity = pageIndex === 0 ? '0.4' : '1';
    if (nextBtn) nextBtn.style.opacity = pageIndex >= total - 1 ? '0.4' : '1';
  }

  // Load Flipbook dynamically
  function loadBook(mode) {
    currentMode = mode;

    if (typeof St === 'undefined' || !St.PageFlip) {
      console.error('St.PageFlip library not ready');
      return;
    }

    // 1. Destroy existing instance cleanly
    if (pageFlipInstance) {
      try {
        pageFlipInstance.destroy();
      } catch (e) {
        console.warn('PageFlip destroy warning:', e);
      }
      pageFlipInstance = null;
    }

    // 2. Re-create fresh DOM container
    wrapper.innerHTML = '<div id="flipbookBook" class="flipbook-instance"></div>';
    const bookEl = document.getElementById('flipbookBook');

    // 3. Render pages
    const data = bookData[mode];
    data.pages.forEach((p, idx) => {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'page';
      pageDiv.innerHTML = `<img src="${p.src}" alt="${p.alt}">`;
      bookEl.appendChild(pageDiv);
    });

    // 4. Calculate dimensions
    const dims = getLandscapeDimensions();

    // 5. Initialize fresh StPageFlip
    pageFlipInstance = new St.PageFlip(bookEl, {
      width: dims.width,
      height: dims.height,
      size: 'fixed',
      minWidth: 260,
      maxWidth: 820,
      minHeight: 180,
      maxHeight: 580,
      maxShadowOpacity: 0.35,
      showCover: false,
      usePortrait: true, // Force Single-Page A4 Landscape Mode
      mobileScrollSupport: true,
      startPage: 0,
      drawShadow: true,
      flippingTime: 600,
      useMouseEvents: true,
      swipeDistance: 30
    });

    pageFlipInstance.loadFromHTML(bookEl.querySelectorAll('.page'));

    pageFlipInstance.on('flip', (e) => {
      playPaperSound();
      updatePageIndicator(e.data);
    });

    pageFlipInstance.on('changeState', (e) => {
      if (e.data === 'flipping') {
        playPaperSound();
      }
    });

    // 6. Update Header & Indicator
    activeBookTitle.textContent = data.title;
    activeBookDesc.textContent = data.subtitle;
    updatePageIndicator(0);
  }

  // Segmented Switcher Handlers
  segPelajar.addEventListener('click', () => {
    if (currentMode === 'pelajar') return;
    segPelajar.classList.add('active');
    segGuru.classList.remove('active');
    loadBook('pelajar');
  });

  segGuru.addEventListener('click', () => {
    if (currentMode === 'guru') return;
    segGuru.classList.add('active');
    segPelajar.classList.remove('active');
    loadBook('guru');
  });

  // HUD Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (pageFlipInstance) pageFlipInstance.flipPrev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (pageFlipInstance) pageFlipInstance.flipNext();
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
      if (pageFlipInstance) pageFlipInstance.flipNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (pageFlipInstance) pageFlipInstance.flipPrev();
    }
  });

  // Responsive Resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      loadBook(currentMode);
    }, 350);
  });

  // Initial Load
  loadBook('pelajar');
});
