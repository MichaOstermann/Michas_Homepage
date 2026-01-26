(function(){
  'use strict';
  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id=a.getAttribute('href').slice(1); const el=document.getElementById(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
    });
  });

  // Mini Lightbox for gallery
  const gallery = document.querySelector('.gallery');
  if (gallery) {
    const items = Array.from(gallery.querySelectorAll('.g-item'));
    // Lazy-load backgrounds via IntersectionObserver
    const loadBg = (el)=>{
      const src = el.getAttribute('data-src');
      if (src && !el.style.backgroundImage) {
        el.style.backgroundImage = `url(${src})`;
      }
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{ if (e.isIntersecting) { loadBg(e.target); io.unobserve(e.target); } });
      }, { rootMargin: '100px' });
      items.forEach(it=> io.observe(it));
    } else {
      items.forEach(loadBg);
    }

    let index = -1;
    const open = (i)=>{
      index = i;
      const src = items[index].getAttribute('data-src');
      const caption = items[index].getAttribute('data-caption') || items[index].getAttribute('aria-label') || '';
      if (!src) return;
      const wrap = document.createElement('div');
      wrap.className = 'lb-backdrop';
      wrap.innerHTML = `
        <figure class="lb-figure">
          <img src="${src}" alt="${caption || ('Familienfoto '+(index+1))}">
          <figcaption class="lb-caption"><span class="cap-inner">${caption}</span></figcaption>
          <button class="lb-close" aria-label="Schließen">✕</button>
          <button class="lb-prev" aria-label="Vorheriges">‹</button>
          <button class="lb-next" aria-label="Nächstes">›</button>
        </figure>`;
      document.body.appendChild(wrap);

      const close = ()=>{ wrap.remove(); index=-1; document.removeEventListener('keydown',onKey); };
      const prev = ()=>{ if(index>0){ open(index-1);} };
      const next = ()=>{ if(index<items.length-1){ open(index+1);} };
      const onKey = (e)=>{
        if (e.key==='Escape') close();
        else if (e.key==='ArrowLeft') prev();
        else if (e.key==='ArrowRight') next();
      };
      document.addEventListener('keydown', onKey);

      wrap.addEventListener('click', (e)=>{ if (e.target===wrap) close(); });
      wrap.querySelector('.lb-close').addEventListener('click', close);
      wrap.querySelector('.lb-prev').addEventListener('click', prev);
      wrap.querySelector('.lb-next').addEventListener('click', next);

      // Touch swipe navigation
      let startX = 0; let startY = 0; let moved = false;
      wrap.addEventListener('touchstart', (e)=>{ const t=e.changedTouches[0]; startX=t.clientX; startY=t.clientY; moved=false; }, {passive:true});
      wrap.addEventListener('touchmove', ()=>{ moved=true; }, {passive:true});
      wrap.addEventListener('touchend', (e)=>{
        const t=e.changedTouches[0]; const dx=t.clientX-startX; const dy=t.clientY-startY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { dx<0 ? next() : prev(); }
      });

      // Preload neighbors
      const preload = (i)=>{ const el=items[i]; if(!el) return; const s=el.getAttribute('data-src'); if(!s) return; const img=new Image(); img.src=s; };
      preload(index-1); preload(index+1);
    };

    items.forEach((it,i)=>{
      it.addEventListener('click', ()=> open(i));
    });
  }
})();