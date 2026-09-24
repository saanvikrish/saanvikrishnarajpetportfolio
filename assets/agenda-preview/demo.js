(() => {
  let playing = false;
  let elapsed = 0;
  let last = 0;
  let animation = 0;
  let interacted = false;
  const shell = document.querySelector('.shell');
  const pauseForInteraction = () => {
    playing = false;
    interacted = true;
    cancelAnimationFrame(animation);
    shell.style.opacity = 1;
    parent.postMessage({ type: 'agenda-preview-interact' }, '*');
  };
  for (const type of ['pointerdown', 'touchstart', 'wheel', 'keydown']) {
    document.addEventListener(type, pauseForInteraction, { passive: true, capture: true });
  }
  const position = id => Math.max(0, document.getElementById(id).getBoundingClientRect().top + scrollY - 68);
  const ease = t => t * t * (3 - 2 * t);
  const render = () => {
    const t = elapsed % 26000;
    const schedule = position('schedule');
    const sessions = position('sessions');
    let y = 0;
    let opacity = 1;
    if (t >= 3000 && t < 8000) y = schedule * ease((t - 3000) / 5000);
    else if (t >= 8000 && t < 12000) y = schedule;
    else if (t >= 12000 && t < 18000) y = schedule + (sessions - schedule) * ease((t - 12000) / 6000);
    else if (t >= 18000 && t < 24000) y = sessions;
    else if (t >= 24000 && t < 25000) { y = sessions; opacity = 1 - (t - 24000) / 1000; }
    else if (t >= 25000) opacity = (t - 25000) / 1000;
    shell.style.opacity = opacity;
    scrollTo(0, y);
  };
  const tick = now => {
    if (!playing) return;
    if (last) elapsed += Math.min(now - last, 100);
    last = now;
    render();
    animation = requestAnimationFrame(tick);
  };
  window.addEventListener('message', event => {
    if (event.source !== parent || event.data?.type !== 'agenda-preview-play') return;
    playing = event.data.playing === true;
    if (playing && interacted) {
      elapsed = 0;
      interacted = false;
      document.querySelector('.modal.is-open .modal-close')?.click();
      document.querySelector('.menu-button[aria-expanded="true"]')?.click();
    }
    cancelAnimationFrame(animation);
    last = 0;
    if (playing) animation = requestAnimationFrame(tick);
  });
  parent.postMessage({ type: 'agenda-preview-ready' }, '*');
})();
