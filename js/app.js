/**
 * MODUL TRIAL SPM 2026 - APPLE MINIMALIST SHOWCASE ENGINE
 * Interactive Accordion & A4 Landscape Flipbook Viewer
 */

document.addEventListener('DOMContentLoaded', () => {
  // Book Data Configuration
  const bookData = {
    pelajar: {
      title: "Versi Pelajar (Modul Soalan Topikal)",
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
  const flipbookCard = document.getElementById('flipbookCard');
  const accordionItems = document.querySelectorAll('.accordion-item');

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

      const bufferSize = audioCtx.sampleRate * 0.07;
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
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {
      // Audio not supported
    }
  }

  // Calculate Responsive Dimensions for A4 Landscape inside Split-Card
  function getLandscapeDimensions() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 990;

    if (isMobile) {
      const stageW = Math.min(window.innerWidth - 64, 400);
      const width = Math.round(stageW);
      const height = Math.round(width / 1.414);
      return { width, height };
    } else if (isTablet) {
      const stageW = Math.min(window.innerWidth - 80, 600);
      const width = Math.round(stageW);
      const height = Math.round(width / 1.414);
      return { width, height };
    } else {
      // Desktop Split-View Card Stage
      const width = 640;
      const height = Math.round(640 / 1.414); // ~453px
      return { width, height };
    }
  }

  function updatePageIndicator(pageIndex) {
    const activeData = bookData[currentMode] || bookData.pelajar;
    const total = activeData.totalPages;
    const current = Math.min(pageIndex + 1, total);
    pageIndicator.textContent = `Halaman ${current} / ${total}`;
    
    if (prevBtn) prevBtn.style.opacity = pageIndex === 0 ? '0.4' : '1';
    if (nextBtn) nextBtn.style.opacity = pageIndex >= total - 1 ? '0.4' : '1';
  }

  // Load Flipbook Dynamically
  function loadBook(mode) {
    currentMode = mode === 'format' ? 'pelajar' : mode;

    if (typeof St === 'undefined' || !St.PageFlip) {
      console.error('St.PageFlip library not ready');
      return;
    }

    // Destroy existing instance cleanly
    if (pageFlipInstance) {
      try {
        pageFlipInstance.destroy();
      } catch (e) {
        console.warn(e);
      }
      pageFlipInstance = null;
    }

    // Recreate fresh DOM container
    wrapper.innerHTML = '<div id="flipbookBook" class="flipbook-instance"></div>';
    const bookEl = document.getElementById('flipbookBook');

    // Render pages
    const data = bookData[currentMode];
    data.pages.forEach((p) => {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'page';
      pageDiv.innerHTML = `<img src="${p.src}" alt="${p.alt}">`;
      bookEl.appendChild(pageDiv);
    });

    // Calculate dimensions
    const dims = getLandscapeDimensions();

    // Initialize fresh StPageFlip
    pageFlipInstance = new St.PageFlip(bookEl, {
      width: dims.width,
      height: dims.height,
      size: 'fixed',
      minWidth: 260,
      maxWidth: 750,
      minHeight: 180,
      maxHeight: 530,
      maxShadowOpacity: 0.32,
      showCover: false,
      usePortrait: true, // Clean Single A4 Landscape View
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

    updatePageIndicator(0);
  }

  // Accordion Interaction Handlers
  accordionItems.forEach(item => {
    item.addEventListener('click', () => {
      const mode = item.getAttribute('data-mode');
      
      // Update active accordion state
      accordionItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Load matching book mode
      if (mode === 'pelajar') {
        loadBook('pelajar');
      } else if (mode === 'guru') {
        loadBook('guru');
      } else if (mode === 'format') {
        loadBook('pelajar');
      }
    });
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
