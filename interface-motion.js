(()=>{
 // The divider is static; never clone phrases based on layout measurements.
 document.querySelectorAll('.ticker-group[aria-hidden]').forEach(group=>group.remove());
 const rail=document.querySelector('#roles-rail'),buttons=[...document.querySelectorAll('[data-rail-step]')];
 if(!rail)return;
 const update=()=>{buttons.forEach(b=>b.disabled=Number(b.dataset.railStep)<0?rail.scrollLeft<3:rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-3)};
 buttons.forEach(b=>b.addEventListener('click',()=>{const card=rail.querySelector('.role-card');rail.scrollBy({left:Number(b.dataset.railStep)*(card.getBoundingClientRect().width+22),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}));
 rail.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(rail);update();
})();
