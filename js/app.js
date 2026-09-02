/**
 * MODUL TRIAL SPM 2026 - INTERACTIVE 3D FLIPBOOK ENGINE
 * Powered by StPageFlip with Apple Store Malaysia Design System
 */

document.addEventListener('DOMContentLoaded', () => {
  // Page Assets Configuration
  const bookData = {
    pelajar: {
      title: "Versi Pelajar (Modul Soalan Topikal)",
      subtitle: "69 Muka Surat • Koleksi Soalan SPM Kertas 2 Mengikut Bab Tingkatan 4 & 5",
      badge: "Modul Soalan",
      totalPages: 10,
      pages: [
        { src: "assets/pages/pelajar/page_1.jpg", alt: "Muka Depan Versi Pelajar" },
        { src: "assets/pages/pelajar/page_2.jpg", alt: "Panduan & Agihan Markah" },
        { src: "assets/pages/pelajar/page_3.jpg", alt: "Bab 1 Pengukuran" },
        { src: "assets/pages/pelajar/page_4.jpg", alt: "Bab 2 Daya & Gerakan I" },
        { src: "assets/pages/pelajar/page_5.jpg", alt: "Soalan Struktur Percubaan SPM" },
        { src: "assets/pages/pelajar/page_6.jpg", alt: "Soalan Bahagian B (Esei Pendek)" },
        { src: "assets/pages/pelajar/page_7.jpg", alt: "Soalan Bahagian C (Esei Penuh)" },
        { src: "assets/pages/pelajar/page_8.jpg", alt: "Bab 3 Kegravitian" },
        { src: "assets/pages/pelajar/page_9.jpg", alt: "Bab 4 Haba & Termodinamik" },
        { src: "assets/pages/pelajar/page_10.jpg", alt: "Bab 5 Gelombang" }
      ]
    },
    guru: {
      title: "Versi Guru (Skema Analisis & Tip A+)",
      subtitle: "69 Muka Surat • Skema Pemarkahan Rasmi, Rubrik Jawapan Lengkap & Tip Pemeriksa",
      badge: "Skema & Analisis",
      totalPages: 10,
      pages: [
        { src: "assets/pages/guru/page_1.jpg", alt: "Muka Depan Versi Guru" },
        { src: "assets/pages/guru/page_2.jpg", alt: "Rubrik & Skema Analisis Soalan" },
        { src: "assets/pages/guru/page_3.jpg", alt: "Skema Jawapan Bab 1" },
        { src: "assets/pages/guru/page_4.jpg", alt: "Skema Jawapan Bab 2" },
        { src: "assets/pages/guru/page_5.jpg", alt: "Pemarkahan Langkah Demi Langkah" },
        { src: "assets/pages/guru/page_6.jpg", alt: "Kata Kunci & Formula Wajib" },
        { src: "assets/pages/guru/page_7.jpg", alt: "Skema Bahagian C & Tip Skor Maksimum" },
        { src: "assets/pages/guru/page_8.jpg", alt: "Skema Bab 3 Kegravitian" },
        { src: "assets/pages/guru/page_9.jpg", alt: "Skema Bab 4 Haba" },
        { src: "assets/pages/guru/page_10.jpg", alt: "Skema Bab 5 Gelombang" }
      ]
    }
  };

  let currentMode = 'pelajar';
  let pageFlipInstance = null;
  let soundEnabled = true;

  // DOM Elements
  const container = document.getElementById('flipbookBook');
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

      const bufferSize = audioCtx.sampleRate * 0.08; // 80ms
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 1.8;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  // Calculate Responsive Page Dimensions
  function getBookDimensions() {
    const isMobile = window.innerWidth <= 768;
    const stageWidth = Math.min(window.innerWidth - 60, 1020);
    
    if (isMobile) {
      const width = Math.min(stageWidth * 0.92, 360);
      const height = width * 1.414; // A4 aspect ratio
      return { width: Math.round(width), height: Math.round(height), mode: 'single' };
    } else {
      const pageW = Math.min(Math.round(stageWidth * 0.44), 440);
      const pageH = Math.round(pageW * 1.414);
      return { width: pageW, height: pageH, mode: 'double' };
    }
  }

  // Render Pages into DOM
  function renderBookPages(mode) {
    const data = bookData[mode];
    container.innerHTML = '';
    
    data.pages.forEach((page, index) => {
      const pageEl = document.createElement('div');
      pageEl.className = 'page' + (index === 0 ? ' --cover' : '');
      pageEl.setAttribute('data-density', index === 0 || index === data.pages.length - 1 ? 'hard' : 'soft');

      const img = document.createElement('img');
      img.src = page.src;
      img.alt = page.alt;
      img.loading = index < 4 ? 'eager' : 'lazy';

      pageEl.appendChild(img);
      container.appendChild(pageEl);
    });

    activeBookTitle.textContent = data.title;
    activeBookDesc.textContent = data.subtitle;
  }

  // Initialize StPageFlip
  function initFlipbook(mode) {
    if (pageFlipInstance) {
      try {
        pageFlipInstance.destroy();
      } catch (e) {
        console.warn(e);
      }
      pageFlipInstance = null;
    }

    renderBookPages(mode);
    const dims = getBookDimensions();

    if (typeof St === 'undefined' || !St.PageFlip) {
      console.error('St.PageFlip library not loaded');
      return;
    }

    pageFlipInstance = new St.PageFlip(container, {
      width: dims.width,
      height: dims.height,
      size: 'fixed',
      minWidth: 280,
      maxWidth: 480,
      minHeight: 400,
      maxHeight: 680,
      maxShadowOpacity: 0.45,
      showCover: true,
      mobileScrollSupport: true,
      usePortrait: dims.mode === 'single',
      startPage: 0,
      drawShadow: true,
      flippingTime: 700
    });

    pageFlipInstance.loadFromHTML(document.querySelectorAll('#flipbookBook .page'));

    pageFlipInstance.on('flip', (e) => {
      playPaperSound();
      updatePageIndicator(e.data);
    });

    pageFlipInstance.on('changeState', (e) => {
      if (e.data === 'flipping') {
        playPaperSound();
      }
    });

    updatePageIndicator(0);
  }

  function updatePageIndicator(pageIndex) {
    const total = bookData[currentMode].totalPages;
    const current = Math.min(pageIndex + 1, total);
    pageIndicator.textContent = `Halaman ${current} / ${total}`;
    
    // Update button states
    if (prevBtn) prevBtn.style.opacity = pageIndex === 0 ? '0.4' : '1';
    if (nextBtn) nextBtn.style.opacity = pageIndex >= total - 1 ? '0.4' : '1';
  }

  // Event Listeners for Segmented Switcher
  segPelajar.addEventListener('click', () => {
    if (currentMode === 'pelajar') return;
    currentMode = 'pelajar';
    segPelajar.classList.add('active');
    segGuru.classList.remove('active');
    initFlipbook('pelajar');
  });

  segGuru.addEventListener('click', () => {
    if (currentMode === 'guru') return;
    currentMode = 'guru';
    segGuru.classList.add('active');
    segPelajar.classList.remove('active');
    initFlipbook('guru');
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

  // Window Resize Debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initFlipbook(currentMode);
    }, 300);
  });

  // Initial Load
  initFlipbook('pelajar');
});
