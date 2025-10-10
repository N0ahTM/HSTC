(()=>{
 const root=document.documentElement;const motion=matchMedia('(prefers-reduced-motion: reduce)');
 function set(m){root.dataset.prefersReducedMotion=m?'true':'false';}
 set(motion.matches);motion.addEventListener?.('change',e=>set(e.matches));
 if(root.dataset.prefersReducedMotion==='true') return;
 const grid=document.querySelector('.background-grid');
 if(grid){let dir=1,opacity=.32;setInterval(()=>{opacity+=0.02*dir;if(opacity>0.42||opacity<0.22)dir*=-1;grid.style.opacity=opacity.toFixed(2)},200)}
})();