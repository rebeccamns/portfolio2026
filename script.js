/* =============================================================================
   REBECCA MANSJHUR — PORTFOLIO SCRIPT
   Sections: Hero Image Rotator · Nav Toggle · Smooth Scroll ·
             Tab Switching + Pagination · Fade-in Animations · Footer Year
   ============================================================================= */


/* ─────────────────────────────────────────────
   1. HERO IMAGE ROTATOR
   Fades between multiple hero photos every 4s.
   If you only have one image, just leave the
   array with one item — nothing will break.
───────────────────────────────────────────── */
const heroImage = document.getElementById('hero-image');

if (heroImage) {
  const heroImages = [
    'image/first.png',
    'image/second.png',
    'image/third.png',
  ];
  let currentHeroIndex = 0;

  heroImage.style.transition = 'opacity 0.6s ease-in-out';
  heroImage.style.opacity = 1;

  // Only rotate if there's more than one image
  if (heroImages.length > 1) {
    setInterval(() => {
      heroImage.style.opacity = 0;
      setTimeout(() => {
        currentHeroIndex = (currentHeroIndex + 1) % heroImages.length;
        heroImage.src = heroImages[currentHeroIndex];
        heroImage.style.opacity = 1;
      }, 600); // matches transition duration
    }, 4000);
  }
}


/* ─────────────────────────────────────────────
   2. MOBILE NAV TOGGLE
   Opens / closes the nav on small screens.
───────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close nav when a link is clicked (mobile UX)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}


/* ─────────────────────────────────────────────
   3. SMOOTH SCROLLING
   Intercepts all anchor links that start with #
   and scrolls smoothly, accounting for the
   fixed nav bar height.
───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return; // skip bare # links

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navHeight = document.querySelector('nav')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ─────────────────────────────────────────────
   4. FADE-IN ON SCROLL
   Watches .fade-in elements and adds .visible
   when they enter the viewport.
   Project cards are handled separately by the
   pagination logic below.
───────────────────────────────────────────── */
const fadeObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Don't touch project cards — pagination handles those
        if (!entry.target.classList.contains('project-card')) {
          entry.target.classList.add('visible');
        }
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.fade-in:not(.project-card)').forEach(el => {
  fadeObserver.observe(el);
});


/* ─────────────────────────────────────────────
   5. TAB SWITCHING + PAGINATION
   Used by the Engineering Projects section.
   Shows projectsPerPage cards at a time with
   animated stagger on each page change.
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  const PROJECTS_PER_PAGE = 3;
  let currentPage         = 1;
  let currentCards        = [];
  let totalPages          = 1;

  const tabButtons        = document.querySelectorAll('.project-tabs .tab-button');
  const tabContents       = document.querySelectorAll('.projects-grid-container .tab-content');
  const prevBtn           = document.getElementById('prevPageButton');
  const nextBtn           = document.getElementById('nextPageButton');
  const pageInfo          = document.getElementById('pageInfo');
  const paginationWrapper = document.getElementById('paginationControls');

  /* Show the correct page of cards with stagger animation */
  function renderPage() {
    if (!currentCards.length) return;

    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    const end   = start + PROJECTS_PER_PAGE;
    let delay   = 0;

    currentCards.forEach((card, i) => {
      card.classList.remove('visible');
      card.style.transitionDelay = '0ms';

      if (i >= start && i < end) {
        card.style.display = 'flex';
        card.classList.add('fade-in');
        // Small timeout lets the browser register display:flex before animating
        setTimeout(() => {
          card.style.transitionDelay = `${delay * 90}ms`;
          card.classList.add('visible');
          delay++;
        }, 30);
      } else {
        card.style.display = 'none';
      }
    });

    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    if (prevBtn)  prevBtn.disabled = currentPage === 1;
    if (nextBtn)  nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  /* Set up pagination for whichever tab is currently active */
  function initPagination() {
    currentPage = 1;
    const activeContent = document.querySelector('.tab-content.active');
    const activeGrid    = activeContent?.querySelector('.projects-grid');

    if (!activeGrid) {
      if (paginationWrapper) paginationWrapper.style.display = 'none';
      return;
    }

    currentCards = Array.from(activeGrid.querySelectorAll('.project-card'));
    totalPages   = Math.ceil(currentCards.length / PROJECTS_PER_PAGE);

    if (paginationWrapper) {
      paginationWrapper.style.display = totalPages > 1 ? 'flex' : 'none';
    }

    renderPage();
  }

  /* Tab click handler */
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-tab-content`) {
          content.classList.add('active');
        }
      });

      initPagination();
    });
  });

  /* Pagination button handlers */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderPage(); }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderPage(); }
    });
  }

  /* Run on load */
  if (tabButtons.length > 0) initPagination();


  /* ─────────────────────────────────────────────
     6. SKILL BAR ANIMATION (if used)
     Animates .skill-bar-fill width when the
     parent .skill-item-interactive scrolls into
     view. Safe to keep even if bars aren't used.
  ───────────────────────────────────────────── */
  const skillBarObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.skill-bar-fill');
          if (fill) {
            fill.style.width = (fill.dataset.skillLevel || '0') + '%';
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.skill-item-interactive').forEach(el => {
    skillBarObserver.observe(el);
  });


  /* ─────────────────────────────────────────────
     7. FOOTER YEAR
     Keeps the copyright year always current.
  ───────────────────────────────────────────── */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─────────────────────────────────────────────
     8. UI/UX CASE STUDY CAROUSEL
     Fade-based auto-scroll with prev/next buttons.
     Slides stack with position:absolute; active one
     fades in. Auto-advances every 3.5 s.
     Pauses on hover; resumes on mouse-leave.
  ───────────────────────────────────────────── */
  document.querySelectorAll('.cs-carousel').forEach(carousel => {
    const slides  = Array.from(carousel.querySelectorAll('.cs-carousel-slide'));
    const prevBtn = carousel.querySelector('.cs-carousel-btn--prev');
    const nextBtn = carousel.querySelector('.cs-carousel-btn--next');
    const dotsEl  = carousel.querySelector('.cs-carousel-dots');

    if (slides.length === 0) return;

    let current   = 0;
    let autoTimer = null;
    const INTERVAL = 3500;

    /* ── Style all slides for absolute stacking ── */
    const track = carousel.querySelector('.cs-carousel-track');
    track.style.position = 'relative';

    // Measure the tallest slide to set track height
    slides.forEach(slide => {
      slide.style.position  = 'absolute';
      slide.style.inset     = '0';
      slide.style.opacity   = '0';
      slide.style.transition = 'opacity 0.6s ease';
      slide.style.display   = 'flex';
      slide.style.alignItems = 'center';
      slide.style.justifyContent = 'center';
    });

    // Set track to a fixed height so absolute children are visible
    function syncTrackHeight() {
      let maxH = 380;
      slides.forEach(slide => {
        slide.style.opacity = '1';
        slide.style.position = 'relative';
        const h = slide.offsetHeight;
        if (h > maxH) maxH = h;
        slide.style.position = 'absolute';
        slide.style.opacity  = '0';
      });
      track.style.height = maxH + 'px';
    }
    syncTrackHeight();
    window.addEventListener('resize', syncTrackHeight);

    /* ── Build dots ── */
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'cs-carousel-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
    const dots = Array.from(dotsEl.querySelectorAll('.cs-carousel-dot'));

    /* ── Hide controls for single slide ── */
    if (slides.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      dotsEl.style.display = 'none';
      slides[0].style.opacity = '1';
      slides[0].style.position = 'relative';
      track.style.height = 'auto';
      return;
    }

    /* ── Core go-to function ── */
    function goTo(index) {
      slides[current].style.opacity = '0';
      dots[current].classList.remove('active');

      current = (index + slides.length) % slides.length;

      slides[current].style.opacity = '1';
      dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); resetTimer(); }
    function prev() { goTo(current - 1); resetTimer(); }

    function startTimer() {
      autoTimer = setInterval(() => goTo(current + 1), INTERVAL);
    }
    function resetTimer() {
      clearInterval(autoTimer);
      startTimer();
    }

    /* ── Buttons ── */
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    /* ── Pause on hover ── */
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', () => startTimer());

    /* ── Keyboard ── */
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); prev(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { e.preventDefault(); next(); }
    });

    /* ── Init ── */
    goTo(0);
    startTimer();
  });


}); // end DOMContentLoaded