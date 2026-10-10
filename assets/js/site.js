/* Portable, accessible interactions. No external JS dependencies. */
(() => {
  'use strict';
  document.documentElement.classList.add('has-js');
  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header and reading progress, batched once per frame.
  const header=$('#site-header'),meter=$('.scroll-meter');
  let isQueued=false;
  function onViewport(){
    if(isQueued)return;
    isQueued=true;
    requestAnimationFrame(()=>{
      isQueued=false;
      const sy=window.scrollY||0;
      header?.classList.toggle('is-scrolled',sy>52);
      if(meter){const d=Math.max(1,document.documentElement.scrollHeight-innerHeight);meter.style.width=`${Math.min(100,Math.max(0,sy/d*100))}%`;}
    });
  }
  addEventListener('scroll',onViewport,{passive:true});
  addEventListener('resize',onViewport,{passive:true});
  onViewport();

  // Mobile overlay navigation.
  const menu=$('.menu-toggle'),nav=$('#mobile-navigation');
  function setMenu(open){
    if(!nav||!menu)return;
    nav.classList.toggle('is-open',open);
    nav.inert=!open;
    menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
    document.body.classList.toggle('nav-open',open);
    header?.classList.toggle('is-menu-open',open);
    if(open){const first=$('a',nav);first?.focus({preventScroll:true});}
    else menu.focus({preventScroll:true});
  }
  menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
  $$('a',nav||document.createElement('div')).forEach(a=>a.addEventListener('click',()=>{if(menu?.getAttribute('aria-expanded')==='true')setMenu(false)}));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true')setMenu(false)});
  addEventListener('resize',()=>{if(innerWidth>780&&menu?.getAttribute('aria-expanded')==='true')setMenu(false)});

  // Elegant reveal animation; respects reduced-motion user preferences.
  if(!reducedMotion&&'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}
    }),{threshold:.07,rootMargin:'0px 0px -24px 0px'});
    $$('[data-reveal]').forEach(el=>observer.observe(el));
  } else $$('[data-reveal]').forEach(el=>el.classList.add('in-view'));

  // Portfolio categories.
  const filters=$$('.filter[data-filter]'),tiles=$$('.project-tile[data-category]');
  function applyFilter(category){
    filters.forEach(b=>{
      const chosen=b.dataset.filter===category;
      b.classList.toggle('is-current',chosen);
      b.setAttribute('aria-pressed',String(chosen));
    });
    tiles.forEach(tile=>tile.classList.toggle('is-filtered-out',category!=='all'&&!tile.dataset.category.split(/\s+/).includes(category)));
  }
  filters.forEach(btn=>btn.addEventListener('click',()=>applyFilter(btn.dataset.filter)));

  // Full original image viewer with native zoom/scroll; never crops the artwork.
  const dialog=$('#art-dialog'),dialogImg=$('.dialog-image',dialog||document),dialogTitle=$('.dialog-name',dialog||document),dialogLink=$('.dialog-original',dialog||document);
  $$('[data-art-open]').forEach(button=>button.addEventListener('click',()=>{
    if(!dialog?.showModal)return;
    const image=button.dataset.artOpen||'',caption=button.dataset.artCaption||'원본 이미지';
    dialogImg.src=image;
    dialogImg.alt=caption;
    dialogTitle.textContent=caption;
    dialogLink.href=image;
    dialog.showModal();
    $('.dialog-scroller',dialog).scrollTop=0;
  }));
  $('.dialog-close',dialog||document)?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',evt=>{if(evt.target===dialog)dialog.close()});
  dialog?.addEventListener('close',()=>{if(dialogImg){dialogImg.removeAttribute('src');}});

  /* ================================================================
     LOCAL BRAND FILMS / V5
     Homepage / Work / Motion: native MP4, muted autoplay + loop.
     Project detail: attempt audible autoplay; if blocked, run muted
     and let a real user click ENABLE SOUND (browser policy).
     No iframe or external video service is necessary.
     ================================================================ */
  const filmSettings=window.PORTFOLIO_FILMS || {};
  const isCase=document.body.dataset.page==='case';
  const asset=(path)=> (isCase?'../../':'')+path;
  const getFilm=(id)=>filmSettings[id]||null;
  const filmVideo=(cfg,mode,poster)=>{
    const v=document.createElement('video');
    v.src=asset(mode==='detail'?cfg.localSrc:cfg.previewSrc);
    v.poster=asset(poster||cfg.poster);
    v.loop=true;v.autoplay=true;v.playsInline=true;
    v.setAttribute('playsinline','');v.setAttribute('loop','');v.setAttribute('autoplay','');
    v.preload=mode==='detail'?'auto':'metadata';
    v.controls=mode==='detail';
    v.muted=mode!=='detail';
    if(mode!=='detail')v.setAttribute('muted','');
    v.setAttribute('aria-label',cfg.title+' 영상');
    if(mode!=='detail'){v.tabIndex=-1;v.setAttribute('aria-hidden','true')}
    return v;
  };
  const tryPlay=async (video, soundRequested, indicator)=>{
    video.muted=!soundRequested;
    try {await video.play();return soundRequested?'audible':'muted';}
    catch(_){
      if(soundRequested){
        video.muted=true;
        if(indicator)indicator.textContent='AUTO · MUTED / ENABLE SOUND';
        try{await video.play();return 'muted'}catch(_e){return 'blocked'}
      }
      return 'blocked';
    }
  };
  $$('.portfolio-film[data-film-key]').forEach((container)=>{
    const cfg=getFilm(container.dataset.filmKey);if(!cfg)return;
    const detail=container.dataset.filmMode==='detail';
    const slot=$('.film-stage',container),button=$('[data-film-sound]',container),ind=$('.film-indicator',container);
    const direct=$('[data-film-external]',container);
    if(direct){direct.href=asset(cfg.localSrc);direct.textContent='OPEN VIDEO ↗';direct.setAttribute('aria-label',cfg.title+' MP4 새 탭에서 열기')}
    if(!slot)return;
    const v=filmVideo(cfg,detail?'detail':'preview');
    // Offscreen cards must not preload or start just because the video node exists.
    if(!detail){v.autoplay=false;v.removeAttribute('autoplay');v.preload='none';}
    slot.replaceChildren(v);
    const setLabel=(soundOn)=>{
      if(button){button.innerHTML=soundOn?'♫ &nbsp; MUTE':'♫ &nbsp; ENABLE SOUND';
        button.setAttribute('aria-label',soundOn?'영상 음소거':'클릭하여 영상 소리 켜기');}
      if(ind)ind.textContent=detail?(soundOn?'SOUND ON · LOOP':'AUTO · MUTED · LOOP'):'AUTO · MUTED · LOOP';
    };
    v.addEventListener('playing',()=>{container.classList.add('is-playing');container.classList.remove('video-error')});
    v.addEventListener('error',()=>{
      container.classList.remove('is-playing');container.classList.add('video-error');
      if(ind)ind.textContent='VIDEO LOAD ERROR';
    });
    v.addEventListener('volumechange',()=>setLabel(!v.muted));
    button?.addEventListener('click',(event)=>{
      event.preventDefault();event.stopPropagation();
      if(!v.muted){v.muted=true;setLabel(false);return;}
      v.muted=false;v.volume=1;
      tryPlay(v,true,ind).then(state=>setLabel(state==='audible'));
    });
    if(detail){
      setLabel(false);
      // First attempt WITH audio as requested; most browsers will require a click.
      if(reducedMotion){v.autoplay=false;v.muted=true;setLabel(false)}
      else tryPlay(v,true,ind).then(state=>setLabel(state==='audible'));
    } else {
      setLabel(false);
      // Load and play only near the viewport; pause elsewhere to save bandwidth.
      if(reducedMotion){v.autoplay=false;v.preload='none';v.pause();return;}
      if('IntersectionObserver' in window){
        let seen=false;
        const io=new IntersectionObserver(entries=>{
          for(const entry of entries){
            if(entry.isIntersecting){seen=true;v.preload='metadata';tryPlay(v,false,ind)}
            else if(seen){v.pause()}
          }
        },{threshold:0.04,rootMargin:'220px'});
        io.observe(container);
      }else tryPlay(v,false,ind);
    }
  });

  // Full-screen KOLL hero: native MP4 independent of YouTube.
  const hero=$('#hero-video'),heroPause=$('[data-video-pause]'),heroSound=$('[data-video-sound]');
  const heroStatus=$('.hero-video-status');
  const heroLink=$('.hero-youtube-link');
  const koll=getFilm('knoll');
  if(heroLink&&koll){heroLink.href=asset(koll.localSrc);heroLink.textContent='OPEN VIDEO ↗';heroLink.setAttribute('aria-label','KOLL 브랜드 필름 MP4 새 탭에서 열기')}
  let heroPlayer=null,heroPaused=false;
  const heroControls=()=>{
    if(heroPause){heroPause.querySelector('.control-glyph').textContent=heroPaused?'▶':'Ⅱ';
      heroPause.querySelector('.control-label').textContent=heroPaused?'PLAY':'PAUSE';}
    if(heroSound&&heroPlayer)heroSound.querySelector('.control-label').textContent=heroPlayer.muted?'SOUND OFF':'SOUND ON';
    if(heroStatus)heroStatus.textContent=heroPaused?'PAUSED':`AUTO · LOOP · ${heroPlayer&&!heroPlayer.muted?'SOUND ON':'MUTED'}`;
  };
  if(hero&&koll){
    heroPlayer=filmVideo(koll,'detail');
    heroPlayer.src=asset(koll.localSrc);
    heroPlayer.controls=false;heroPlayer.muted=true;
    heroPlayer.setAttribute('muted','');heroPlayer.preload='auto';
    heroPlayer.setAttribute('aria-hidden','true');heroPlayer.tabIndex=-1;
    heroPlayer.addEventListener('playing',()=>hero.classList.add('is-playing'));
    heroPlayer.addEventListener('error',()=>{hero.classList.remove('is-playing');if(heroStatus)heroStatus.textContent='VIDEO LOAD ERROR'});
    hero.replaceChildren(heroPlayer);
    if(!reducedMotion)tryPlay(heroPlayer,false,heroStatus);
    heroPause?.addEventListener('click',()=>{
      heroPaused=!heroPaused;
      if(heroPaused)heroPlayer.pause();
      else heroPlayer.play().catch(()=>{});
      heroControls();
    });
    heroSound?.addEventListener('click',()=>{
      heroPlayer.muted=!heroPlayer.muted;
      if(!heroPlayer.muted){heroPlayer.volume=1;heroPlayer.play().catch(()=>{heroPlayer.muted=true})}
      heroControls();
    });
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)heroPlayer.pause();
      else if(!heroPaused&&!reducedMotion)heroPlayer.play().catch(()=>{});
    });
    heroControls();
  }

})();

// V5 preview indicator is visible only via the isolated launcher.
try { if (new URLSearchParams(location.search).has("preview")) document.body.classList.add("preview-build"); }catch(_){}
