(() => {
  const preview = document.querySelector('.agenda-preview');
  if (!preview) return;
  const frame = preview.querySelector('iframe');
  const windowElement = preview.querySelector('.agenda-preview-window');
  const button = preview.querySelector('button');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches;
  let visible = false;
  const sync = () => {
    frame.contentWindow?.postMessage({ type: 'agenda-preview-play', playing: visible && !paused && !document.hidden }, '*');
    const label = paused ? 'Play agenda preview' : 'Pause agenda preview';
    button.setAttribute('aria-label', label);
    button.title = label;
    button.firstElementChild.textContent = paused ? '\u25b6' : '\u275a\u275a';
  };
  const resize = () => { frame.style.transform = `scale(${windowElement.clientWidth / 390})`; };
  new ResizeObserver(resize).observe(windowElement);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(preview);
  button.addEventListener('click', () => { paused = !paused; sync(); });
  motion.addEventListener('change', () => { paused = motion.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow) return;
    if (event.data?.type === 'agenda-preview-interact') {
      paused = true;
      sync();
    } else if (event.data?.type === 'agenda-preview-ready') sync();
  });
  frame.addEventListener('load', () => { resize(); sync(); });
  resize();
  sync();
})();
