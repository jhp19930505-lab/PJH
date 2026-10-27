/* Grouped process: local native clips; start on request; one clip at a time. */
(()=>{'use strict';const root=document.querySelector('.production-page');if(!root)return;
const videos=[...root.querySelectorAll('[data-player] video')];
document.addEventListener('play',event=>{if(!videos.includes(event.target))return;videos.forEach(video=>{if(video!==event.target&&!video.paused)video.pause();});},true);
root.querySelectorAll('.production-nav a').forEach(link=>link.addEventListener('click',()=>videos.forEach(video=>video.pause())));
addEventListener('hashchange',()=>videos.forEach(video=>video.pause()));
})();
