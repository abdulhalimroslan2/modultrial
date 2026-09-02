/**
 * SPM 2026 PHYSICS MODULE - MASTER CINEMATIC WEB ENGINE
 * Autonomous Pipeline: 60FPS Keyframe-4 Video Scrubbing + GSAP ScrollTrigger + 3D A4 Flipbook
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
  let ambientAudioPlaying = false;

  // Video & Telemetry State
  const heroVideo = document.getElementById('heroVideo');
  const scrollContainer = document.getElementById('scrollContainer');
  const globalNav = document.getElementById('globalNav');
  const tourProgress = document.getElementById('tourProgress');
  const timecodeDisplay = document.getElementById('timecodeDisplay');
  const armCoords = document.getElementById('armCoords');
  const opticalFidelity = document.getElementById('opticalFidelity');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const chJumpBtns = document.querySelectorAll('.ch-jump');
  const ambientSoundBtn = document.getElementById('ambientSoundBtn');

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
  // 2. WEB AUDIO SYNTHESIZER (CRISP PAPER FLIP & AMBIENT TECH SOUND)
  // ==========================================================================
  let audioCtx = null;
  let ambientOsc = null;
  let ambientGain = null;

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

  function toggleAmbientSound() {
    initAudioContext();
    if (!ambientAudioPlaying) {
      try {
        ambientOsc = audioCtx.createOscillator();
        const subOsc = audioCtx.createOscillator();
        ambientGain = audioCtx.createGain();

        ambientOsc.type = 'sine';
        ambientOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // 55Hz deep hum

        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(110, audioCtx.currentTime); // 110Hz harmonic

        ambientGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        ambientGain.gain.exponentialRampToValueAtTime(0.04, audioCtx.currentTime + 1.5);

        ambientOsc.connect(ambientGain);
        subOsc.connect(ambientGain);
        ambientGain.connect(audioCtx.destination);

        ambientOsc.start();
        subOsc.start();
        ambientAudioPlaying = true;
        if (ambientSoundBtn) ambientSoundBtn.style.color = 'var(--laser-cyan)';
      } catch (e) {}
    } else {
      if (ambientGain) {
        ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        setTimeout(() => {
          if (ambientOsc) ambientOsc.stop();
          ambientAudioPlaying = false;
        }, 500);
      }
      if (ambientSoundBtn) ambientSoundBtn.style.color = 'var(--text-tertiary-dark)';
    }
  }

  if (ambientSoundBtn) {
    ambientSoundBtn.addEventListener('click', toggleAmbientSound);
  }

  // ==========================================================================
  // 3. 60FPS KEYFRAME-4 VIDEO SCRUBBING & SCROLLTRIGGER TIMELINE
  // ==========================================================================
  let isVideoLoaded = false;
  let videoDuration = 20.0;
  let isAutoTourPlaying = false;
  let autoTourTween = null;

  if (heroVideo) {
    heroVideo.addEventListener('loadedmetadata', () => {
      isVideoLoaded = true;
      videoDuration = heroVideo.duration || 20.0;
      initScrollTrigger();
    });

    // Fallback if metadata already loaded
    if (heroVideo.readyState >= 1) {
      isVideoLoaded = true;
      videoDuration = heroVideo.duration || 20.0;
      initScrollTrigger();
    }
  }

  function updateTelemetry(progress) {
    // 1. Timecode
    const curSec = (progress * videoDuration);
    const mins = String(Math.floor(curSec / 60)).padStart(2, '0');
    const secs = String(Math.floor(curSec % 60)).padStart(2, '0');
    const ms = String(Math.floor((curSec % 1) * 100)).padStart(2, '0');
    if (timecodeDisplay) timecodeDisplay.textContent = `00:${mins}:${secs}.${ms}`;

    // 2. Robotic Arm Coordinates Simulation
    const xCoord = (120 + Math.sin(progress * Math.PI * 4) * 85).toFixed(1);
    const yCoord = (80 + Math.cos(progress * Math.PI * 3) * 65).toFixed(1);
    const zCoord = (320 - progress * 140).toFixed(1);
    if (armCoords) armCoords.textContent = `[X: ${xCoord}mm, Y: ${yCoord}mm, Z: ${zCoord}mm]`;

    // 3. Optical Fidelity
    const fidelity = (99.2 + Math.sin(progress * 10) * 0.7).toFixed(1);
    if (opticalFidelity) opticalFidelity.textContent = `${fidelity}% FIDELITY`;

    // 4. Tour progress bar
    if (tourProgress) tourProgress.style.width = `${progress * 100}%`;

    // 5. Active Chapter highlight
    chJumpBtns.forEach(btn => {
      const btnProg = parseFloat(btn.getAttribute('data-progress'));
      if (Math.abs(progress - btnProg) < 0.15) {
        chJumpBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  }

  function initScrollTrigger() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

    // Pin & scrub timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".cinematic-scroll-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          if (heroVideo && isVideoLoaded && !isAutoTourPlaying) {
            heroVideo.currentTime = progress * videoDuration;
          }
          updateTelemetry(progress);
        }
      }
    });

    // Chapter Animations
    gsap.fromTo("#ch1 .chapter-content", 
      { opacity: 1, y: 0 }, 
      { opacity: 0, y: -60, scrollTrigger: { trigger: "#ch1", start: "top top", end: "bottom top", scrub: 1 } }
    );

    gsap.fromTo("#ch2 .chapter-content", 
      { opacity: 0, y: 80, scale: 0.96 }, 
      { opacity: 1, y: 0, scale: 1, scrollTrigger: { trigger: "#ch2", start: "top 70%", end: "center center", scrub: 1 } }
    );

    gsap.fromTo("#ch3 .chapter-content", 
      { opacity: 0, y: 80 }, 
      { opacity: 1, y: 0, scrollTrigger: { trigger: "#ch3", start: "top 70%", end: "center center", scrub: 1 } }
    );

    gsap.fromTo("#ch4 .chapter-content", 
      { opacity: 0, y: 80 }, 
      { opacity: 1, y: 0, scrollTrigger: { trigger: "#ch4", start: "top 70%", end: "center center", scrub: 1 } }
    );

    gsap.fromTo("#ch5 .chapter-content", 
      { opacity: 0, scale: 0.92 }, 
      { opacity: 1, scale: 1, scrollTrigger: { trigger: "#ch5", start: "top 75%", end: "center center", scrub: 1 } }
    );

    // Navbar light mode switch on flipbook section
    ScrollTrigger.create({
      trigger: "#flipbookSection",
      start: "top 80px",
      onEnter: () => globalNav.classList.add('scrolled-light'),
      onLeaveBack: () => globalNav.classList.remove('scrolled-light')
    });
  }

  // ==========================================================================
  // 4. AUTO TOUR CONTROLLER & CHAPTER JUMPS
  // ==========================================================================
  function toggleAutoTour() {
    if (!isAutoTourPlaying) {
      isAutoTourPlaying = true;
      if (playIcon) {
        playIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
      }
      
      const maxScroll = scrollContainer.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const remainingDistance = maxScroll - currentScroll;
      const duration = Math.max(5, (remainingDistance / maxScroll) * 20);

      autoTourTween = gsap.to(window, {
        scrollTo: maxScroll,
        duration: duration,
        ease: "none",
        onUpdate: () => {
          if (heroVideo && isVideoLoaded) {
            const prog = window.scrollY / maxScroll;
            heroVideo.currentTime = prog * videoDuration;
            updateTelemetry(prog);
          }
        },
        onComplete: () => {
          stopAutoTour();
        }
      });
    } else {
      stopAutoTour();
    }
  }

  function stopAutoTour() {
    isAutoTourPlaying = false;
    if (autoTourTween) autoTourTween.kill();
    if (playIcon) {
      playIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
    }
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', toggleAutoTour);
  }

  // Chapter Jump Buttons
  chJumpBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoTour();
      const progress = parseFloat(btn.getAttribute('data-progress'));
      const maxScroll = scrollContainer.scrollHeight - window.innerHeight;
      const targetScroll = progress * maxScroll;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  });

  // Stop auto tour on manual user scroll wheel / touch
  window.addEventListener('wheel', () => { if (isAutoTourPlaying) stopAutoTour(); }, { passive: true });
  window.addEventListener('touchmove', () => { if (isAutoTourPlaying) stopAutoTour(); }, { passive: true });

  // ==========================================================================
  // 5. INTERACTIVE 3D A4 LANDSCAPE FLIPBOOK ENGINE
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

    // Touch / Swipe
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
