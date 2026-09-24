const words = ["change", "history", "progress", "culture", "motion", "impact"];
const flipWord = document.querySelector("#flipWord");
const cursorLight = document.querySelector(".cursor-light");
const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const backToTop = document.querySelector("#backToTop");
const djDeck = document.querySelector(".dj-deck");
const djHideToggle = document.querySelector("#djHideToggle");
const vinylToggle = document.querySelector("#vinylToggle");
const siteTrack = document.querySelector("#siteTrack");
const volumeControl = document.querySelector("#volumeControl");
const bassControl = document.querySelector("#bassControl");
const trackStatus = document.querySelector("#trackStatus");
const prevTrack = document.querySelector("#prevTrack");
const nextTrack = document.querySelector("#nextTrack");
const trackTitle = document.querySelector("#trackTitle");
const trackArtist = document.querySelector("#trackArtist");
const vinylDisc = document.querySelector(".vinyl-disc");
const ornaments = document.querySelectorAll(".ornament");
const risingElements = document.querySelectorAll(".ornament, .case-study-card, .media-card, .role-card, .about-photo, .contact-photo, .contact-copy");
const mediaLightbox = document.querySelector("#mediaLightbox");
const mediaLightboxImage = mediaLightbox?.querySelector("figure img");
const mediaLightboxCaption = mediaLightbox?.querySelector("figcaption");
const mediaLightboxStrip = mediaLightbox?.querySelector(".lightbox-strip");
const mediaLightboxClose = mediaLightbox?.querySelector(".lightbox-close");

let wordIndex = 0;
let trackContext;
let trackSource;
let trackGain;
let bassFilter;
let bassPresenceFilter;
let scrollMotionFrame;
const playlist = [
  {
    title: "I Like It Like That",
    artist: "Pete Rodriguez",
    file: "i-like-it-like-that.mp3",
    color: "#ff6b4a",
    start: 0
  },
  {
    title: "El Rincon Caliente",
    artist: "Manuel Guajiro Mirabal",
    file: "el-rincon-caliente.mp3",
    color: "#e34028",
    start: 0
  },
  {
    title: "Mas Que Nada",
    artist: "Sergio Mendes feat. Brasil '66",
    file: "mas-que-nada.mp3",
    color: "#f1c26b",
    start: 0
  },
  {
    title: "Didn't I",
    artist: "Darondo",
    file: "didnt-i.mp3",
    color: "#8f6ac8",
    start: 5
  },
  {
    title: "Doin' Time",
    artist: "Sublime",
    file: "doin-time.mp3",
    color: "#73b7ff",
    start: 3
  },
  {
    title: "La Bamba",
    artist: "Los Lobos",
    file: "la-bamba.mp3",
    color: "#d8a7ff",
    start: 3
  },
  {
    title: "Never Let You Go",
    artist: "Third Eye Blind",
    file: "never-let-you-go.mp3",
    color: "#a8be73",
    start: 3
  }
];
let activeTrackIndex = Number(siteTrack?.dataset.track || 0);
let pendingStartTime = 0;
function readVisitPreference(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
function saveVisitPreference(key, value) {
  try { sessionStorage.setItem(key, value); } catch { /* Storage can be unavailable in private or file browsing. */ }
}
const showPortfolioIntro = document.body.classList.contains('portfolio-home') && readVisitPreference('portfolio-entered') !== 'yes';

const signature = document.querySelector('.portfolio-home .hero h1 span');
function fitSignature() {
  if (!signature) return;
  for (const name of [signature, document.querySelector('.name-first')].filter(Boolean)) {
    name.style.removeProperty('font-size');
    const range = document.createRange();
    range.selectNodeContents(name);
    const width = range.getBoundingClientRect().width;
    const available = name.parentElement.clientWidth - 32;
    if (width > available && available > 0) {
      const size = parseFloat(getComputedStyle(name).fontSize);
      name.style.fontSize = `${Math.floor(size * available / width)}px`;
    }
  }
}
document.fonts.ready.then(fitSignature);
window.addEventListener('resize', fitSignature);

if (topbar && menuToggle) {
  const closeMenu = () => {
    topbar.classList.remove("is-menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = topbar.classList.toggle("is-menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  topbar.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

function renderFlipWord(word, animate = false) {
  if (!flipWord) return;
  const letters = word.padEnd(8, " ").slice(0, 8).split("");
  flipWord.innerHTML = letters.map((letter, index) => {
    const safeLetter = letter === " " ? "&nbsp;" : letter;
    const delay = index * 26;
    return `<span class="flip-char${animate ? " is-flipping" : ""}" style="--delay:${delay}ms"><span>${safeLetter}</span></span>`;
  }).join("");
  flipWord.setAttribute("aria-label", word);
}

function swapWord() {
  if (!flipWord) return;
  wordIndex = (wordIndex + 1) % words.length;
  renderFlipWord(words[wordIndex], true);
}

renderFlipWord(words[wordIndex]);
window.setInterval(swapWord, 1250);

window.addEventListener("pointermove", (event) => {
  if (!cursorLight) return;
  cursorLight.style.left = `${event.clientX}px`;
  cursorLight.style.top = `${event.clientY}px`;

  ornaments.forEach((ornament, index) => {
    const strength = (index + 1) * 5;
    const moveX = ((event.clientX / window.innerWidth) - 0.5) * strength;
    const moveY = ((event.clientY / window.innerHeight) - 0.5) * strength;
    ornament.style.setProperty("--drift-x", `${moveX}px`);
    ornament.style.setProperty("--drift-y", `${moveY}px`);
  });
});

function updateScrollMotion() {
  const viewportHeight = window.innerHeight || 1;
  risingElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const clamped = Math.max(0, Math.min(1, progress));
    let strength = element.classList.contains("ornament") ? 44 : 18;
    if (element.classList.contains("contact-copy")) strength = 96;
    if (element.classList.contains("contact-photo")) strength = 76;
    const offset = (0.5 - clamped) * strength;
    element.style.setProperty("--scroll-rise", `${offset.toFixed(1)}px`);
    if (element.classList.contains("contact-copy")) {
      element.style.setProperty("--contact-opacity", String(Math.max(0.42, Math.min(1, clamped * 1.35))));
    }
  });
  scrollMotionFrame = null;
}

function requestScrollMotion() {
  if (scrollMotionFrame) return;
  scrollMotionFrame = window.requestAnimationFrame(updateScrollMotion);
}

window.addEventListener("scroll", () => {
  if (!backToTop) return;
  backToTop.classList.toggle("is-visible", window.scrollY > 520);
  requestScrollMotion();
}, { passive: true });

window.addEventListener("resize", requestScrollMotion);
updateScrollMotion();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setupTrackAudio() {
  if (!siteTrack || trackContext) return;
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  trackContext = new AudioEngine();
  trackSource = trackContext.createMediaElementSource(siteTrack);
  trackGain = trackContext.createGain();
  bassFilter = trackContext.createBiquadFilter();
  bassPresenceFilter = trackContext.createBiquadFilter();
  bassFilter.type = "lowshelf";
  bassFilter.frequency.value = 260;
  bassFilter.gain.value = Number(bassControl?.value || 0) * 1.35;
  bassPresenceFilter.type = "peaking";
  bassPresenceFilter.frequency.value = 95;
  bassPresenceFilter.Q.value = 0.9;
  bassPresenceFilter.gain.value = Number(bassControl?.value || 0) * 0.85;
  trackGain.gain.value = Number(volumeControl?.value || 0.18);
  siteTrack.volume = 1;
  trackSource.connect(bassFilter);
  bassFilter.connect(bassPresenceFilter);
  bassPresenceFilter.connect(trackGain);
  trackGain.connect(trackContext.destination);
}

function getTrackBase() {
  return siteTrack?.dataset.base || "assets/audio/";
}

function applyTrackStart(track) {
  pendingStartTime = Number(track.start || 0);
  if (!siteTrack || !pendingStartTime) return;
  const jumpToStart = () => {
    try {
      if (Math.abs(siteTrack.currentTime - pendingStartTime) > 0.4) {
        siteTrack.currentTime = pendingStartTime;
      }
    } catch {
      // Some browsers delay seeking until metadata is fully ready.
    }
  };

  if (siteTrack.readyState >= 1) {
    jumpToStart();
  } else {
    siteTrack.addEventListener("loadedmetadata", jumpToStart, { once: true });
  }
}

function loadTrack(index, shouldPlay = false) {
  if (!siteTrack || !playlist.length) return;
  activeTrackIndex = ((index % playlist.length) + playlist.length) % playlist.length;
  const track = playlist[activeTrackIndex];
  const wasPaused = siteTrack.paused;

  if (trackTitle) trackTitle.textContent = track.title;
  if (trackArtist) {
    trackArtist.textContent = `${track.artist} • ${track.artist} • ${track.artist}`;
    trackArtist.dataset.artist = track.artist;
    trackArtist.setAttribute("aria-label", track.artist);
  }
  if (vinylDisc) vinylDisc.style.setProperty("--vinyl-accent", track.color);
  if (djDeck) djDeck.style.setProperty("--vinyl-accent", track.color);

  const nextSrc = `${getTrackBase()}${track.file}`;
  if (!siteTrack.getAttribute("src")?.endsWith(track.file)) {
    siteTrack.src = nextSrc;
    siteTrack.load();
  }
  applyTrackStart(track);

  if (trackStatus && !shouldPlay && wasPaused) {
    trackStatus.textContent = "tap vinyl to play";
  }
  if (shouldPlay) playCurrentTrack();
}

async function playCurrentTrack({ automatic = false } = {}) {
  if (!siteTrack) return;
  try {
    // Native audio can autoplay without routing into a suspended AudioContext.
    if (!automatic) setupTrackAudio();
    await Promise.all([siteTrack.play(), trackContext?.resume()]);
    if (!automatic) saveVisitPreference('portfolio-quiet', 'no');
    vinylToggle?.setAttribute("aria-pressed", "true");
    vinylToggle?.setAttribute("aria-label", "Pause music");
    djDeck?.classList.add("is-playing");
    if (trackStatus) trackStatus.textContent = describeVolume(Number(volumeControl?.value || 0.18));
  } catch (error) {
    vinylToggle?.setAttribute("aria-pressed", "false");
    vinylToggle?.setAttribute("aria-label", "Play music");
    djDeck?.classList.remove("is-playing");
    if (trackStatus) trackStatus.textContent = error.name === "NotAllowedError"
      ? "tap vinyl to start music" : "unable to play this song";
  }
}

function describeVolume(volume) {
  if (volume >= 0.66) return "playing loudly (good job)";
  if (volume >= 0.34) return "nice groove";
  if (volume > 0) return "playing softly";
  return "muted";
}

function describeBass(value) {
  if (value >= 10) return "bass boosted";
  if (value > 0) return "bass warming up";
  if (value < -4) return "bass tucked";
  return describeVolume(Number(volumeControl?.value || 0.18));
}

function setBassAmount(value) {
  const bass = Number(value);
  if (bassFilter) bassFilter.gain.value = bass * 1.35;
  if (bassPresenceFilter) bassPresenceFilter.gain.value = bass * 0.85;
  djDeck?.classList.toggle("bass-boosted", bass > 4);
  if (trackStatus) trackStatus.textContent = describeBass(bass);
}

if (siteTrack && volumeControl) {
  siteTrack.volume = Number(volumeControl.value);
  loadTrack(activeTrackIndex);
  if (!showPortfolioIntro && readVisitPreference('portfolio-quiet') !== 'yes') playCurrentTrack({ automatic: true });
}

if (showPortfolioIntro) {
  const intro = document.createElement('dialog');
  intro.className = 'portfolio-intro';
  intro.setAttribute('aria-labelledby', 'intro-title');
  intro.setAttribute('aria-describedby', 'intro-copy');
  intro.innerHTML = `<div class="intro-content"><p class="intro-eyebrow">Saanvi Krishnarajpet</p><span class="intro-record" aria-hidden="true"></span><h2 id="intro-title">Before you step inside.</h2><p id="intro-copy">Turn your volume up a little.<br>This portfolio has a soundtrack.</p><button type="button" class="intro-enter">Enter portfolio <span aria-hidden="true">↗</span></button><button type="button" class="intro-quiet">Enter quietly</button></div>`;
  document.body.append(intro);
  document.body.classList.add('intro-open');
  intro.showModal();
  document.documentElement.classList.remove('portfolio-intro-pending');
  let leaving = false;
  const enter = withSound => {
    if (leaving) return;
    leaving = true;
    saveVisitPreference('portfolio-entered', 'yes');
    saveVisitPreference('portfolio-quiet', withSound ? 'no' : 'yes');
    if (withSound) playCurrentTrack();
    else siteTrack?.pause();
    intro.classList.add('is-leaving');
    const finish = () => {
      intro.close();
      intro.remove();
      document.body.classList.remove('intro-open');
      document.documentElement.classList.remove('portfolio-intro-pending');
      const destination = document.querySelector('.hero-actions a');
      destination?.focus({ preventScroll: true });
    };
    window.setTimeout(finish, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 850);
  };
  intro.querySelector('.intro-enter').addEventListener('click', () => enter(true));
  intro.querySelector('.intro-quiet').addEventListener('click', () => enter(false));
  intro.addEventListener('cancel', event => { event.preventDefault(); enter(false); });
}

if (vinylToggle && siteTrack) {
  vinylToggle.addEventListener("click", async () => {
    if (djDeck?.classList.contains("is-collapsed")) {
      djDeck.classList.remove("is-collapsed");
      djHideToggle?.setAttribute("aria-expanded", "true");
      djHideToggle?.setAttribute("aria-label", "Hide music controls");
      if (djHideToggle) djHideToggle.textContent = "hide";
      if (!siteTrack.paused) return;
    }

    const isPlaying = vinylToggle.getAttribute("aria-pressed") === "true";

    if (isPlaying) {
      siteTrack.pause();
      vinylToggle.setAttribute("aria-pressed", "false");
      vinylToggle.setAttribute("aria-label", "Play music");
      djDeck?.classList.remove("is-playing");
      if (trackStatus) trackStatus.textContent = "paused";
      return;
    }

    await playCurrentTrack();
  });

  siteTrack.addEventListener("error", () => {
    vinylToggle.setAttribute("aria-pressed", "false");
    djDeck?.classList.remove("is-playing");
    if (trackStatus) trackStatus.textContent = "song file missing";
  });

  siteTrack.addEventListener("ended", () => {
    loadTrack(activeTrackIndex + 1, true);
  });
}

if (volumeControl) {
  volumeControl.addEventListener("input", () => {
    const volume = Number(volumeControl.value);
    if (trackGain) trackGain.gain.value = volume;
    else if (siteTrack) siteTrack.volume = volume;
    if (trackStatus) trackStatus.textContent = describeVolume(volume);
  });
}

if (bassControl) {
  bassControl.addEventListener("input", () => {
    setupTrackAudio();
    trackContext?.resume().catch(() => {});
    setBassAmount(bassControl.value);
  });
}

if (prevTrack) {
  prevTrack.addEventListener("click", () => {
    const shouldPlay = vinylToggle?.getAttribute("aria-pressed") === "true";
    loadTrack(activeTrackIndex - 1, shouldPlay);
  });
}

if (nextTrack) {
  nextTrack.addEventListener("click", () => {
    const shouldPlay = vinylToggle?.getAttribute("aria-pressed") === "true";
    loadTrack(activeTrackIndex + 1, shouldPlay);
  });
}

if (djHideToggle && djDeck) {
  djHideToggle.addEventListener("click", () => {
    const isCollapsed = djDeck.classList.toggle("is-collapsed");
    djHideToggle.setAttribute("aria-expanded", String(!isCollapsed));
    djHideToggle.setAttribute("aria-label", isCollapsed ? "Show music controls" : "Hide music controls");
    djHideToggle.textContent = isCollapsed ? "show" : "hide";
  });
}

document.querySelectorAll(".photo-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    card.style.setProperty("--tilt", `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--tilt");
  });
});

document.querySelectorAll(".case-study-card").forEach((card) => {
  const openCard = () => {
    const href = card.dataset.cardHref;
    if (href) window.location.href = href;
  };

  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    openCard();
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target.closest("a, button")) return;
    event.preventDefault();
    openCard();
  });

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -4;
    const rotateY = ((x / rect.width) - 0.5) * 4;
    card.style.setProperty("--card-tilt", `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--card-tilt");
  });
});

document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("error", () => {
    const fallback = document.createElement("div");
    fallback.className = "image-fallback";
    fallback.textContent = image.alt ? `Image unavailable: ${image.alt}` : "Image unavailable";
    image.replaceWith(fallback);
  }, { once: true });
});

const mediaFigures = Array.from(document.querySelectorAll(".tabling-rail figure, .media-gallery-section figure"));
const mediaItems = mediaFigures.map((figure) => {
  const image = figure.querySelector("img");
  const caption = figure.querySelector("figcaption");
  return {
    src: image?.getAttribute("src") || "",
    alt: image?.getAttribute("alt") || "Portfolio media",
    caption: caption?.textContent?.trim() || "Portfolio media"
  };
}).filter((item) => item.src);

let activeMediaIndex = 0;

function renderLightbox(index) {
  if (!mediaLightbox || !mediaLightboxImage || !mediaLightboxCaption) return;
  activeMediaIndex = (index + mediaItems.length) % mediaItems.length;
  const item = mediaItems[activeMediaIndex];
  mediaLightboxImage.src = item.src;
  mediaLightboxImage.alt = item.alt;
  mediaLightboxCaption.textContent = item.caption;
  mediaLightboxStrip?.querySelectorAll("button").forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === activeMediaIndex);
  });
}

function openLightbox(index) {
  if (!mediaLightbox || !mediaItems.length) return;
  renderLightbox(index);
  mediaLightbox.classList.add("is-open");
  mediaLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  if (!mediaLightbox) return;
  mediaLightbox.classList.remove("is-open");
  mediaLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
}

if (mediaLightbox && mediaLightboxStrip && mediaItems.length) {
  mediaItems.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `View ${item.caption}`);
    button.innerHTML = `<img src="${item.src}" alt="">`;
    button.addEventListener("click", () => renderLightbox(index));
    mediaLightboxStrip.append(button);
  });

  mediaFigures.forEach((figure, index) => {
    const button = figure.querySelector(".media-lightbox-trigger");
    button?.addEventListener("click", () => openLightbox(index));
  });

  mediaLightboxClose?.addEventListener("click", closeLightbox);
  mediaLightbox.addEventListener("click", (event) => {
    if (event.target === mediaLightbox) closeLightbox();
  });

  window.addEventListener("keydown", (event) => {
    if (!mediaLightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") renderLightbox(activeMediaIndex + 1);
    if (event.key === "ArrowLeft") renderLightbox(activeMediaIndex - 1);
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal-on-scroll").forEach((item) => {
  revealObserver.observe(item);
});
