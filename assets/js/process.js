/* Evidence navigation. No analytics, tracking, build step, or external dependency. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const filters = [...document.querySelectorAll('.filter[data-filter]')];
  const allowed = new Set(filters.map(x => x.dataset.filter));
  const requested = new URLSearchParams(location.search).get('view');
  if (requested && allowed.has(requested)) {
    filters.find(x => x.dataset.filter === requested)?.click();
  }
  filters.forEach(button => button.addEventListener('click', () => {
    try {
      const url = new URL(location.href);
      button.dataset.filter === 'all' ? url.searchParams.delete('view') : url.searchParams.set('view', button.dataset.filter);
      history.replaceState(null, '', url);
    } catch (_) { /* file previews and restricted frames can still filter normally. */ }
  }));

  document.querySelectorAll('[data-film-seek]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.filmTarget;
      const video = [...document.querySelectorAll('.portfolio-film[data-film-key]')]
        .find(x => x.dataset.filmKey === key)?.querySelector('video');
      if (!video) return;
      const time = Number(button.dataset.filmSeek);
      if (!Number.isFinite(time)) return;
      document.querySelector('#film')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      const play = () => {
        video.currentTime = Math.min(Math.max(0, time), Number.isFinite(video.duration) ? video.duration : time);
        video.play().catch(() => { /* Native video controls remain available. */ });
      };
      if (video.readyState >= 1) play();
      else { video.addEventListener('loadedmetadata', play, { once: true }); video.load(); }
    });
  });

})();
