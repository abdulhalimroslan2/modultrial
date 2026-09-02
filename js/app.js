/**
 * MODUL TRIAL SPM 2026 - PURE A4 LANDSCAPE 3D FLIPBOOK ENGINE
 * Dedicated 1.414:1 Landscape Reader with Smooth 3D Page Turn & Audio
 */

document.addEventListener('DOMContentLoaded', () => {
  // Configuration
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
  let currentPageIndex = 0;
  let isFlipping = false;
  let soundEnabled = true;

  // DOM Elements
  const bookContainer = document.getElementById('landscapeBook');
  const baseLayer = document.getElementById('baseLayer');
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
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  function getActivePages() {
    return bookData[currentMode].pages;
  }

  function updateIndicator() {
    const total = getActivePages().length;
    pageIndicator.textContent = `Halaman ${currentPageIndex + 1} / ${total}`;

    if (prevBtn) prevBtn.style.opacity = currentPageIndex === 0 ? '0.4' : '1';
    if (nextBtn) nextBtn.style.opacity = currentPageIndex >= total - 1 ? '0.4' : '1';
  }

  function renderCurrentPage() {
    const pages = getActivePages();
    baseLayer.innerHTML = `
      <img src="${pages[currentPageIndex].src}" alt="${pages[currentPageIndex].alt}">
      <div class="corner-hint"></div>
    `;
    updateIndicator();
  }

  // 3D Page Turn Forward
  function flipNext() {
    const pages = getActivePages();
    if (currentPageIndex >= pages.length - 1 || isFlipping) return;

    isFlipping = true;
    playPaperSound();

    const currentSrc = pages[currentPageIndex].src;
    const nextSrc = pages[currentPageIndex + 1].src;

    // Set underlay to next page
    baseLayer.innerHTML = `<img src="${nextSrc}" alt="${pages[currentPageIndex + 1].alt}">`;

    // Create 3D flipping sheet on top
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
    }, 580);
  }

  // 3D Page Turn Backward
  function flipPrev() {
    const pages = getActivePages();
    if (currentPageIndex <= 0 || isFlipping) return;

    isFlipping = true;
    playPaperSound();

    const currentSrc = pages[currentPageIndex].src;
    const prevSrc = pages[currentPageIndex - 1].src;

    // Base layer shows previous page
    baseLayer.innerHTML = `<img src="${prevSrc}" alt="${pages[currentPageIndex - 1].alt}">`;

    // Create 3D flipping sheet starting from left (-180deg) to right (0deg)
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
    }, 580);
  }

  // Switch Mode (Versi Pelajar vs Versi Guru)
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
  bookContainer.addEventListener('click', (e) => {
    const rect = bookContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX > rect.width * 0.5) {
      flipNext();
    } else {
      flipPrev();
    }
  });

  // Smart Mobile & Tablet Touch / Swipe Support
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

      // Only trigger if horizontal swipe is dominant and fast enough
      if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.3 && elapsedTime < 600) {
        if (diffX < 0) {
          flipNext(); // Swipe Left -> Next
        } else {
          flipPrev(); // Swipe Right -> Prev
        }
      }
    }
  }, { passive: true });

  // HUD Button Handlers
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); flipPrev(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); flipNext(); });

  if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEnabled = !soundEnabled;
      soundBtn.style.color = soundEnabled ? 'var(--apple-blue)' : 'var(--text-tertiary)';
      soundBtn.title = soundEnabled ? 'Bunyi: Hidup' : 'Bunyi: Senyap';
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
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      flipNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      flipPrev();
    }
  });

  // Initial Render
  renderCurrentPage();
});
