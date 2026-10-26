/* ==========================================================================
   Aou × Boom | A Little Universe
   Each feature is its own small function, started together at the bottom.
   ========================================================================== */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* Images: reveal the photo once it loads, keep the fallback if it is missing */
  function initMedia() {
    $$('[data-media]').forEach((media) => {
      const img = $('img', media);
      if (!img) return;

      img.addEventListener('load', () => media.classList.add('is-loaded'));
      img.addEventListener('error', () => media.classList.add('is-missing'));

      // The image may have finished before this script ran
      if (img.complete && img.naturalWidth > 0) media.classList.add('is-loaded');
    });
  }

  /* Mobile menu: toggle, close on link click, close with Escape */
  function initMenu() {
    const button = $('#menuBtn');
    const menu = $('#navlinks');

    const setOpen = (open) => {
      menu.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      button.textContent = open ? 'Close ✕' : 'Menu ☰';
    };

    button.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    menu.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
  }

  /* Scroll reveal: fade content in once as it enters the screen */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    items.forEach((el) => observer.observe(el));
  }

  /* Navigation: highlight the link for the section currently in view */
  function initActiveNav() {
    if (!('IntersectionObserver' in window)) return;

    const links = $$('.navlinks a');
    const sections = links.map((link) => $(link.getAttribute('href'))).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => observer.observe(section));
  }

  /* Gallery: open a photo in a native <dialog> (Esc and backdrop click close it) */
  function initLightbox() {
    const dialog = $('#lightbox');
    const dialogImg = $('img', dialog);

    $$('[data-lightbox]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const media = $('[data-media]', trigger);
        const img = $('img', trigger);
        if (!media.classList.contains('is-loaded')) return; // nothing to enlarge yet

        dialogImg.src = img.currentSrc || img.src;
        dialogImg.alt = img.alt;
        dialog.showModal();
      });
    });

    $('.lightbox__close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  }

  initMedia();
  initMenu();
  initReveal();
  initActiveNav();
  initLightbox();
})();
