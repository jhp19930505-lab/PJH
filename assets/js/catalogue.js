/* V9.4 catalogue: native local assets, keyboard tabs, bookmarkable category state. */
(()=>{
 'use strict';
 const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
 const work=q('.catalogue');if(!work)return;
 const tabs=qa('[data-major]',work),panels=qa('.catalogue-panel',work),status=q('.catalogue-status',work);
 const state={major:'design',design:'all',video:'all'};
 const valid={design:new Set(['all','brand','information']),video:new Set(['all'])};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const routes={design:['design','all'],video:['video','all'],'design-brand':['design','brand'],'design-information':['design','information'],'video-film':['video','all'],'video-ai':['video','all'],'video-editing':['video','all'],work:['design','all'],films:['video','all'],editing:['video','all'],process:['video','all']};
 function paint(){
  tabs.forEach(t=>{const on=t.dataset.major===state.major;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;});
  panels.forEach(p=>{const cat=p.id.replace('panel-',''),active=cat===state.major;p.hidden=!active;
   qa('[data-subfilter]',p).forEach(b=>{const on=b.dataset.subfilter===state[cat];b.classList.toggle('is-current',on);b.setAttribute('aria-pressed',String(on));});
   qa('[data-subcategory]',p).forEach(card=>{card.hidden=state[cat]!=='all'&&card.dataset.subcategory!==state[cat];});
   if(!active)qa('video',p).forEach(v=>v.pause());
  });
  const panel=q('#panel-'+state.major);const shown=qa('.catalogue-card',panel).filter(c=>!c.hidden).length;
  if(status){const labels={design:{all:'All',brand:'Brand & Editorial',information:'Information'},video:{all:'All',film:'Brand Film',ai:'3D & AI',editing:'Editing & Short-form'}};status.textContent=(state.major==='design'?'Design':'Video')+' · '+labels[state.major][state[state.major]];}
 }
 function write(push=false){const hash=state[state.major]==='all'?state.major:state.major+'-'+state[state.major];try{const u=new URL(location.href);u.hash=hash;u.searchParams.delete('view');history[push?'pushState':'replaceState']({portfolioCategory:true},'',u);}catch(_){} }
 function choose(major,sub='all',{scroll=false,push=false,save=true}={}){
  if(!valid[major])return;state.major=major;state[major]=valid[major].has(sub)?sub:'all';paint();if(save)write(push);
  if(scroll)work.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
 }
 tabs.forEach(t=>{
  t.addEventListener('click',()=>choose(t.dataset.major,state[t.dataset.major],{push:true}));
  t.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const index=tabs.indexOf(t);let next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();choose(tabs[next].dataset.major,state[tabs[next].dataset.major],{push:true});});
 });
 panels.forEach(p=>qa('[data-subfilter]',p).forEach(b=>b.addEventListener('click',()=>choose(p.id.replace('panel-',''),b.dataset.subfilter,{push:true}))));
 function readRoute(scroll=false){
  const hash=location.hash.slice(1),route=routes[hash];if(route){choose(route[0],route[1],{scroll,save:false});return;}
  const view=new URLSearchParams(location.search).get('view');const legacy={motion:['video','all'],brand:['design','brand'],editorial:['design','brand'],information:['design','information'],all:['design','all']};if(legacy[view])choose(...legacy[view],{scroll,save:false});
 }
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target==='_blank')return;
  let url;try{url=new URL(a.href,location.href);}catch(_){return;}
  const same=url.pathname.replace(/index\.html$/,'')===location.pathname.replace(/index\.html$/,'');
  if(!same||url.origin!==location.origin)return;
  const route=routes[url.hash.slice(1)];if(!route)return;e.preventDefault();choose(route[0],route[1],{scroll:true,push:true});
 });
 addEventListener('popstate',()=>readRoute(true));addEventListener('hashchange',()=>readRoute(true));
 paint();readRoute(false);
 if(routes[location.hash.slice(1)])requestAnimationFrame(()=>work.scrollIntoView({block:'start',behavior:'instant'}));
 // Load only the two small existing brand-film previews, not full new movies.
 qa('[data-card-preview]',work).forEach(link=>{
  let v=null;const stop=()=>{if(v){v.pause();v.classList.remove('is-playing');}};
  const start=()=>{if(reduced||matchMedia('(hover:none)').matches)return;if(!v){v=document.createElement('video');v.className='catalogue-preview';v.src=link.dataset.cardPreview;v.muted=true;v.loop=true;v.playsInline=true;v.preload='none';v.tabIndex=-1;v.setAttribute('aria-hidden','true');q('.catalogue-media',link).append(v);}v.play().then(()=>v.classList.add('is-playing')).catch(()=>{});};
  link.addEventListener('pointerenter',start);link.addEventListener('focus',start);link.addEventListener('pointerleave',stop);link.addEventListener('blur',stop);
 });
})();
