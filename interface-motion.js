(()=>{
 const strip=document.querySelector('.practice-strip'),toggle=document.querySelector('.ticker-toggle');
 const track=strip?.querySelector('.ticker-track'),group=track?.querySelector('.ticker-group');
 if(group){
   const originals=[...group.children].map(item=>item.cloneNode(true));
   const fillTicker=()=>{
     group.replaceChildren(...originals.map(item=>item.cloneNode(true)));
     while(group.getBoundingClientRect().width<strip.clientWidth){
       const copies=originals.map(item=>{const copy=item.cloneNode(true);copy.setAttribute('aria-hidden','true');return copy;});
       group.append(...copies);
     }
     track.querySelectorAll('.ticker-group[aria-hidden]').forEach(item=>item.remove());
     const duplicate=group.cloneNode(true);duplicate.setAttribute('aria-hidden','true');track.append(duplicate);
   };
   document.fonts.ready.then(fillTicker);
   new ResizeObserver(fillTicker).observe(strip);
 }
 toggle?.addEventListener('click',()=>{const paused=strip.classList.toggle('is-paused');toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Resume scrolling phrases':'Pause scrolling phrases');toggle.textContent=paused?'Play ↔':'Pause ↔'});
 const rail=document.querySelector('#roles-rail'),buttons=[...document.querySelectorAll('[data-rail-step]')];
 if(!rail)return;
 const update=()=>{buttons.forEach(b=>b.disabled=Number(b.dataset.railStep)<0?rail.scrollLeft<3:rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-3)};
 buttons.forEach(b=>b.addEventListener('click',()=>{const card=rail.querySelector('.role-card');rail.scrollBy({left:Number(b.dataset.railStep)*(card.getBoundingClientRect().width+22),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}));
 rail.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(rail);update();
})();
