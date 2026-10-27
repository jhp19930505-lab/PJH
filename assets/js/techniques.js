/* Grouped techniques: preserve native controls, never play multiple clips. */
(()=>{
  'use strict';
  const root=document.querySelector('.window-suite');if(!root)return;
  const players=[...root.querySelectorAll('[data-player] video')];
  document.addEventListener('play',e=>{
    if(!players.includes(e.target))return;
    players.forEach(v=>{if(v!==e.target&&!v.paused)v.pause();});
  },true);
  const supplementary=new Set(['#techniques','#product-styling','#pattern-change']);
  function stopLead(){
    if(supplementary.has(location.hash)){
      const lead=root.querySelector('[data-primary-player] video');
      if(lead)lead.pause();
    }
  }
  root.querySelectorAll('.case-tabs a').forEach(a=>a.addEventListener('click',()=>{
    if(supplementary.has(a.hash))players.forEach(v=>v.pause());
  }));
  addEventListener('hashchange',stopLead);
  stopLead();
})();