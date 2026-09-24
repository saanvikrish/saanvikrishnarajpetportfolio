(()=>{
 const gallery=document.querySelector('#marcom-gallery');if(!gallery)return;
 const work=window.marcomWork||[];const reduced=matchMedia('(prefers-reduced-motion: reduce)');const videos=[];
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt)n.textContent=txt;return n};
 work.forEach(item=>{
  if(!item.src||!['image','video'].includes(item.type))return;
  const figure=el('figure','mc-media');
  if(item.type==='video'){
   const video=el('video');video.src=item.src;if(item.poster)video.poster=item.poster;video.muted=true;video.loop=true;video.playsInline=true;video.preload='metadata';video.controls=true;video.setAttribute('aria-label',item.title||'Work sample');
   const controls=el('div','mc-controls'),toggle=el('button','','Play clip'),sound=el('button','','Turn sound on');toggle.type=sound.type='button';
   const state={video,visible:false,userPaused:false,toggle};videos.push(state);
   toggle.onclick=()=>{state.userPaused=!video.paused;if(video.paused)video.play().catch(()=>{});else video.pause()};
   sound.onclick=()=>{video.muted=!video.muted;if(!video.muted){document.querySelector('#siteTrack')?.pause();videos.forEach(v=>{if(v.video!==video)v.video.muted=true})}};
   video.addEventListener('play',()=>{toggle.textContent='Pause clip';if(!video.muted)document.querySelector('#siteTrack')?.pause()});video.addEventListener('pause',()=>toggle.textContent='Play clip');video.addEventListener('volumechange',()=>{sound.textContent=video.muted?'Turn sound on':'Mute clip';if(!video.muted)document.querySelector('#siteTrack')?.pause()});
   controls.append(toggle,sound);figure.append(video,controls);
  }else{const a=el('a');a.href=item.src;a.dataset.zoom='';const img=el('img');img.src=item.src;img.alt=item.alt||item.title||'Work sample';img.loading='lazy';a.append(img);figure.append(a)}
  const cap=el('figcaption');cap.append(el('h3','',item.title),el('p','',item.role),el('p','',item.caption));if(item.transcript){const details=el('details');details.append(el('summary','','Video transcript'),el('p','',item.transcript));cap.append(details)}figure.append(cap);gallery.append(figure);
 });
 if(gallery.children.length)document.querySelector('#marcom-pending').hidden=true;
 const sync=()=>videos.forEach(s=>{if(!s.visible||document.hidden){s.video.pause();s.video.muted=true}else if(!s.userPaused&&!reduced.matches&&!navigator.connection?.saveData)s.video.play().catch(()=>{})});
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{videos.find(s=>s.video===e.target).visible=e.isIntersecting});sync()},{threshold:.5});videos.forEach(s=>observer.observe(s.video));document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{if(reduced.matches)videos.forEach(s=>s.video.pause());else sync()});document.querySelector('#siteTrack')?.addEventListener('play',()=>videos.forEach(s=>s.video.muted=true));
})();
