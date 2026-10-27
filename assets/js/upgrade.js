/* V9 additions; native video, no generated claims, no tracking requests. */
(()=>{
 'use strict';
 const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Main-case video: preserve requested audible-autoplay attempt; fall back to muted.
 qa('[data-player]').forEach(box=>{
  const video=q('video',box),button=q('.player-start',box); if(!video||!button)return;
  const sync=()=>{box.classList.toggle('is-playing',!video.paused);box.classList.toggle('is-muted',video.muted);box.classList.toggle('is-audible',!video.paused&&!video.muted);};
  ['play','playing','pause','volumechange','ended'].forEach(ev=>video.addEventListener(ev,sync));
  video.addEventListener('error',()=>{box.classList.add('video-error');button.lastElementChild.textContent='재생 다시 시도';});
  button.addEventListener('click',()=>{video.muted=false;video.volume=1;video.play().catch(()=>{button.lastElementChild.textContent='아래 영상 파일 링크로 열기';});});
  if(box.hasAttribute('data-primary-player')&&!reduced&&!['#techniques','#product-styling','#pattern-change'].includes(location.hash)){
   video.muted=false;
   video.play().catch(()=>{video.muted=true;video.play().catch(()=>{});});
  }
 });
 // Only one audible movie at a time. Muted previews do not interrupt foreground films.
 document.addEventListener('play',e=>{const v=e.target;if(v.tagName!=='VIDEO'||v.muted)return;qa('video').forEach(other=>{if(other!==v&&!other.muted)other.pause();});},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)qa('[data-player] video').forEach(v=>v.pause());});
 // Card previews are loaded only when nearby, and stopped when out of view.
 const previews=qa('[data-preview-src]');
 if(!reduced&&'IntersectionObserver'in window){
  const io=new IntersectionObserver(entries=>entries.forEach(({target:v,isIntersecting})=>{
   if(isIntersecting){if(!v.getAttribute('src'))v.src=v.dataset.previewSrc;v.muted=true;v.play().then(()=>v.classList.add('is-playing')).catch(()=>{});}
   else v.pause();
  }),{rootMargin:'100px',threshold:.08});previews.forEach(v=>io.observe(v));
 }
 const hero=q('#hero-video');
 if(hero&&'IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(({isIntersecting})=>{const v=q('video',hero);if(!v)return;if(!isIntersecting)v.pause();else if(!reduced&&q('[data-video-pause] .control-label')?.textContent?.trim()!=='PLAY')v.play().catch(()=>{});}),{threshold:.08});io.observe(hero);}
 // Named scenes jump to the real local film; metadata delay is handled explicitly.
 qa('[data-seek]').forEach(b=>b.addEventListener('click',()=>{
  const v=q(b.dataset.seekTarget||'video');if(!v)return;
  const seek=()=>{v.currentTime=Number(b.dataset.seek)||0;v.muted=false;v.play().catch(()=>{});};
  if(v.readyState>=1)seek();else{v.addEventListener('loadedmetadata',seek,{once:true});v.load();}
  v.closest('[data-player]')?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});
 }));
 // Email copy is useful even without a configured mail client, with honest failure text.
 qa('[data-copy-email]').forEach(b=>b.addEventListener('click',async()=>{
  const status=q('.copy-status',b.parentElement);const email='jhp2328@naver.com';let ok=false;
  try{if(navigator.clipboard){await navigator.clipboard.writeText(email);ok=true;}}catch(_){}
  if(!ok){const t=document.createElement('textarea');t.value=email;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();try{ok=document.execCommand('copy');}catch(_){}t.remove();b.focus();}
  if(status)status.textContent=ok?'복사했습니다.':'위 이메일 주소를 직접 복사해 주세요.';
 }));
 // Complete the original mobile-menu keyboard handling with a focus loop.
 document.addEventListener('keydown',e=>{
  if(e.key!=='Tab'||!document.body.classList.contains('nav-open'))return;
  const items=[q('.menu-toggle'),...qa('#mobile-navigation a')].filter(Boolean),first=items[0],last=items.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
})();
