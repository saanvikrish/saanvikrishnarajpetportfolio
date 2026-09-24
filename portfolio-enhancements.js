/* Progressive image inspection and compact mobile music controls.
   Original playlist/player behavior remains in script.js. */
(() => {
  const selected = new Set();
  document.querySelectorAll('[data-zoom], .feature-phone a').forEach(el => selected.add(el));
  document.querySelectorAll('.hifi-grid img, .process-grid img, .persona-panel figure img, .tabling-rail img').forEach(img => {
    let trigger = img.closest('button, a');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.type = 'button'; trigger.className = 'image-inspect';
      img.replaceWith(trigger); trigger.append(img);
    }
    selected.add(trigger);
  });
  const items = [...selected].map(trigger => {
    const img = trigger.querySelector('img');
    if (!img) return null;
    trigger.setAttribute('aria-label', `Enlarge ${img.alt || 'project image'}`);
    trigger.setAttribute('aria-haspopup', 'dialog');
    return { trigger, src: img.src, alt: img.alt, caption: trigger.closest('figure')?.querySelector('figcaption')?.textContent || img.alt };
  }).filter(Boolean);
  if (items.length) {
    const dialog = document.createElement('dialog');
    dialog.className = 'frame-viewer';
    dialog.setAttribute('aria-label','Project image viewer');
    dialog.innerHTML = '<div class="viewer-top"><p id="viewer-caption"></p><button class="viewer-close" type="button" aria-label="Close image viewer">✕</button></div><div class="viewer-image-area"><img alt=""></div><div class="viewer-bottom"><button class="viewer-arrow viewer-prev" type="button" aria-label="Previous image">←</button><span class="viewer-count" aria-live="polite"></span><a target="_blank" rel="noopener noreferrer">Open original ↗</a><button class="viewer-arrow viewer-next" type="button" aria-label="Next image">→</button></div>';
    document.body.append(dialog);
    let current = 0, returnFocus;
    const render = n => {
      current = (n + items.length) % items.length;
      const item = items[current], img = dialog.querySelector('img');
      img.src = item.src; img.alt = item.alt;
      dialog.querySelector('#viewer-caption').textContent = item.caption;
      dialog.querySelector('.viewer-count').textContent = `${current+1} / ${items.length}`;
      dialog.querySelector('a').href = item.src;
    };
    items.forEach((item,index) => item.trigger.addEventListener('click', e => {
      if(typeof dialog.showModal !== 'function') return;
      e.preventDefault(); returnFocus = item.trigger; render(index); dialog.showModal();
      document.body.classList.add('lightbox-open');
    }));
    dialog.querySelector('.viewer-close').addEventListener('click',()=>dialog.close());
    dialog.querySelector('.viewer-prev').addEventListener('click',()=>render(current-1));
    dialog.querySelector('.viewer-next').addEventListener('click',()=>render(current+1));
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();render(current-1)}if(e.key==='ArrowRight'){e.preventDefault();render(current+1)}});
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
    dialog.addEventListener('close',()=>{document.body.classList.remove('lightbox-open');returnFocus?.focus()});
  }
  document.querySelectorAll('.case-page .frame-rail, .case-page .amazon-catalogue, .case-page .tabling-rail').forEach((rail, index) => {
    rail.classList.add('screen-rail');
    rail.id ||= `screen-rail-${index}`;
    rail.tabIndex = 0;
    rail.setAttribute('role', 'region');
    rail.setAttribute('aria-label', 'Project images');
    const controls = document.createElement('div');
    controls.className = 'screen-rail-controls';
    const buttons = [-1, 1].map(direction => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = direction < 0 ? '←' : '→';
      button.setAttribute('aria-label', direction < 0 ? 'Previous images' : 'Next images');
      button.title = button.getAttribute('aria-label');
      button.setAttribute('aria-controls', rail.id);
      button.addEventListener('click', () => rail.scrollBy({ left: direction * Math.min(rail.clientWidth * .85, 360), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
      controls.append(button);
      return button;
    });
    rail.before(controls);
    const update = () => {
      buttons[0].disabled = rail.scrollLeft <= 2;
      buttons[1].disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
    };
    rail.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(rail);
    update();
  });
  // Frame the original exports without resampling or redrawing their UI.
  const phoneBounds = {
    'reflection-prompt.png': [800, 1410, 78, 12, 660, 1384],
    'home-dashboard.png': [980, 1484, 104, 26, 660, 1384],
    'focus-stats.png': [882, 1462, 46, 18, 660, 1384],
    'journaling.png': [762, 1448, 42, 10, 660, 1384],
    'meditation-detail.png': [818, 1474, 56, 12, 660, 1384],
    'meditation-library.png': [920, 1452, 104, 14, 660, 1384],
    'amazon-orders.png': [848, 1446, 35, 26, 660, 1384],
    'amazon-product-detail.png': [890, 1456, 91, 30, 660, 1383],
    'amazon-profile-switcher.png': [892, 1420, 31, 10, 660, 1384],
    'amazon-review-summary.png': [812, 1422, 45, 16, 660, 1383]
  };
  document.querySelectorAll('main img').forEach(img => {
    const bounds = phoneBounds[img.getAttribute('src')?.split('/').pop()];
    if (!bounds || img.closest('.screen-detail')) return;
    const [width, height, left, top, cropWidth, cropHeight] = bounds;
    const frame = document.createElement('span');
    frame.className = 'phone-cutout';
    frame.style.setProperty('--phone-ratio', `${cropWidth} / ${cropHeight}`);
    frame.style.setProperty('--export-width', `${width / cropWidth * 100}%`);
    frame.style.setProperty('--export-left', `${-left / cropWidth * 100}%`);
    frame.style.setProperty('--export-top', `${-top / cropHeight * 100}%`);
    if (img.classList.contains('hero-screen')) frame.classList.add('hero-phone-cutout');
    img.before(frame);
    frame.append(img);
    img.closest('.zine-screen')?.classList.add('phone-composition');
  });
  if (true) { // Keep music compact on first load at every screen size.
    const deck=document.querySelector('.dj-deck'),toggle=document.querySelector('#djHideToggle');
    deck?.classList.add('is-collapsed');
    toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Show music controls');
    if(toggle)toggle.textContent='show';
  }
})();
