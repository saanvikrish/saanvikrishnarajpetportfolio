(()=>{
 // The divider is static; never clone phrases based on layout measurements.
 document.querySelectorAll('.ticker-group[aria-hidden]').forEach(group=>group.remove());
 const strip=document.querySelector('.practice-strip');
 const projects=document.querySelector('#projects');
 if(strip && projects){
   const motion=matchMedia('(prefers-reduced-motion: reduce)');
   let used=false, lastY=scrollY, intentUntil=0, timer=0, touchY=0;
   const cancel=()=>{clearTimeout(timer);timer=0;};
   const intent=down=>{
     intentUntil=down?performance.now()+1200:0;
     if(!down)cancel();
   };
   window.addEventListener('wheel',event=>intent(event.deltaY>0),{passive:true});
   window.addEventListener('touchstart',event=>{touchY=event.touches[0].clientY;},{passive:true});
   window.addEventListener('touchmove',event=>{
     const next=event.touches[0].clientY;intent(next<touchY);touchY=next;
   },{passive:true});
   window.addEventListener('keydown',event=>{
     if(event.target.closest('input,textarea,select,button,a,[contenteditable]'))return;
     if(['ArrowDown','PageDown',' '].includes(event.key))intent(!event.shiftKey);
     else if(['ArrowUp','PageUp','Home','Escape'].includes(event.key))intent(false);
   });
   const eligible=()=>{
     const rect=strip.getBoundingClientRect();
     return !used && !motion.matches && performance.now()<intentUntil &&
       rect.top<innerHeight*.45 && rect.bottom>0 &&
       !document.body.matches('.intro-open,.lightbox-open');
   };
   window.addEventListener('scroll',()=>{
     const down=scrollY>lastY;lastY=scrollY;
     if(!down){cancel();return;}
     if(timer || !eligible())return;
     timer=setTimeout(()=>{
       timer=0;if(!eligible())return;
       const header=document.querySelector('.topbar');
       const inset=(header?.getBoundingClientRect().height || 0)+20;
       const target=scrollY+projects.getBoundingClientRect().top-inset;
       if(target<=scrollY)return;
       used=true;
       window.scrollTo({top:target,behavior:'smooth'});
     },220);
   },{passive:true});
   motion.addEventListener('change',cancel);
 }
 const rail=document.querySelector('#roles-rail'),buttons=[...document.querySelectorAll('[data-rail-step]')];
 if(!rail)return;
 const update=()=>{buttons.forEach(b=>b.disabled=Number(b.dataset.railStep)<0?rail.scrollLeft<3:rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-3)};
 buttons.forEach(b=>b.addEventListener('click',()=>{const card=rail.querySelector('.role-card');rail.scrollBy({left:Number(b.dataset.railStep)*(card.getBoundingClientRect().width+22),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}));
 rail.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(rail);update();
})();
