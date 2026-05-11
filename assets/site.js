/* ============================================================
   FLOWCHIP INFRA — MASTER SCRIPT
   ============================================================ */

/* ── CURSOR ── */
(function(){
  const cur = document.getElementById('cur');
  const ring = document.getElementById('cur-ring');
  if(!cur||!ring) return;
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX; my=e.clientY;
    cur.style.left=mx+'px'; cur.style.top=my+'px';
  });
  const lerp=(a,b,t)=>a+(b-a)*t;
  (function loop(){
    rx=lerp(rx,mx,.12); ry=lerp(ry,my,.12);
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,.proj-card,.srv-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>{
      cur.style.transform='translate(-50%,-50%) scale(2)';
      ring.style.transform='translate(-50%,-50%) scale(1.5)';
    });
    el.addEventListener('mouseleave',()=>{
      cur.style.transform='translate(-50%,-50%) scale(1)';
      ring.style.transform='translate(-50%,-50%) scale(1)';
    });
  });
})();

/* ── NAVBAR SCROLL ── */
(function(){
  const nav = document.getElementById('navbar');
  if(!nav) return;
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled', window.scrollY > 40);
  },{passive:true});
})();

/* ── MOBILE MENU ── */
function toggleMob(){
  const menu = document.getElementById('mob-menu');
  const btn  = document.getElementById('ham-btn');
  if(!menu) return;
  menu.classList.toggle('open');
  if(btn) btn.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}
function closeMob(){
  const menu = document.getElementById('mob-menu');
  const btn  = document.getElementById('ham-btn');
  if(!menu) return;
  menu.classList.remove('open');
  if(btn) btn.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMob(); });

/* ── ACTIVE NAV LINK ── */
(function(){
  const page = window.location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
})();

/* ── THEME TOGGLE ── */
(function(){
  const btn = document.querySelector('[data-theme-toggle]');
  const lbl = document.querySelector('[data-theme-label]');
  const icon= document.querySelector('[data-theme-icon]');
  if(!btn) return;
  const apply = t=>{
    document.body.setAttribute('data-theme',t);
    if(lbl)  lbl.textContent  = t==='dark'?'Light Mode':'Dark Mode';
    if(icon) icon.textContent = t==='dark'?'☾':'☀';
    btn.setAttribute('aria-pressed', t==='dark');
  };
  const stored = localStorage.getItem('fi-theme');
  if(stored) apply(stored);
  btn.addEventListener('click',()=>{
    const cur = document.body.getAttribute('data-theme')||'light';
    const next = cur==='dark'?'light':'dark';
    apply(next);
    localStorage.setItem('fi-theme',next);
  });
})();

/* ── REVEAL ON SCROLL ── */
(function(){
  const els = document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
  if(!els.length) return;
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  },{threshold:.12});
  els.forEach(el=>io.observe(el));
})();

/* ── COUNTER ANIMATION ── */
function animateCounter(el, target, suffix=''){
  let start=null;
  const dur=2000;
  const step = ts=>{
    if(!start) start=ts;
    const p=Math.min((ts-start)/dur,1);
    const ease = 1-Math.pow(1-p,3);
    el.textContent = Math.round(ease*target)+(suffix||'');
    if(p<1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

(function(){
  document.querySelectorAll('.cnt').forEach(el=>{
    const io=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting){ animateCounter(el,+el.dataset.target); io.disconnect(); }
    },{threshold:.5});
    io.observe(el);
  });
  document.querySelectorAll('.stat-bar-fill').forEach(el=>{
    const io=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting){ el.style.width=el.dataset.pct+'%'; io.disconnect(); }
    },{threshold:.5});
    io.observe(el);
  });
  document.querySelectorAll('.cnt2').forEach(el=>{
    const io=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting){
        animateCounter(el,+el.dataset.target,el.dataset.suffix||'');
        io.disconnect();
      }
    },{threshold:.5});
    io.observe(el);
  });
})();

/* ── HERO PARTICLE CANVAS ── */
(function(){
  const c=document.getElementById('pcanvas');
  if(!c) return;
  const ctx=c.getContext('2d');
  let W,H,pts=[];
  function resize(){ W=c.width=c.offsetWidth; H=c.height=c.offsetHeight; }
  resize();
  window.addEventListener('resize',resize,{passive:true});
  function rnd(a,b){return a+Math.random()*(b-a)}
  function init(){
    pts=[];
    for(let i=0;i<80;i++){
      pts.push({x:rnd(0,W),y:rnd(0,H),vx:rnd(-.3,.3),vy:rnd(-.3,.3),r:rnd(1,2.5),a:Math.random()});
    }
  }
  init();
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(245,200,0,${p.a*0.5})`; ctx.fill();
    });
    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<100){
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(43,142,199,${.12*(1-d/100)})`; ctx.lineWidth=.8; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── ABOUT CANVAS ── */
(function(){
  const c=document.getElementById('about-canvas');
  if(!c) return;
  const ctx=c.getContext('2d');
  let W,H,t=0;
  function resize(){ W=c.width=c.offsetWidth; H=c.height=c.offsetHeight; }
  resize(); window.addEventListener('resize',resize,{passive:true});
  function draw(){
    ctx.clearRect(0,0,W,H); t+=.005;
    for(let i=0;i<5;i++){
      const x=W*(0.2+i*0.18)+Math.sin(t+i)*60, y=H*.5+Math.cos(t*0.7+i)*80, r=80+i*30;
      const g=ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,'rgba(43,142,199,0.06)'); g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── STATS CANVAS ── */
(function(){
  const c=document.getElementById('stats-canvas');
  if(!c) return;
  const ctx=c.getContext('2d');
  let W,H,t=0;
  function resize(){ W=c.width=c.offsetWidth; H=c.height=c.offsetHeight; }
  resize(); window.addEventListener('resize',resize,{passive:true});
  function draw(){
    ctx.clearRect(0,0,W,H); t+=.003;
    const s=60;
    for(let r=0;r<Math.ceil(H/s)+1;r++){
      for(let col=0;col<Math.ceil(W/s)+1;col++){
        const x=col*s+(r%2)*s/2, y=r*s*0.866;
        const pulse=Math.sin(t*2+x*0.02+y*0.02)*0.5+0.5;
        ctx.beginPath();
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3, hx=x+s*.42*Math.cos(a), hy=y+s*.42*Math.sin(a);
          i===0?ctx.moveTo(hx,hy):ctx.lineTo(hx,hy);
        }
        ctx.closePath();
        ctx.strokeStyle=`rgba(245,200,0,${pulse*0.06})`; ctx.lineWidth=.6; ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── FOOTER CANVAS (light mode aware) ── */
(function(){
  const c = document.getElementById('fi-foot-canvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0;

  function isDark(){ return document.body.getAttribute('data-theme')==='dark'; }

  function resize(){ W=c.width=c.offsetWidth; H=c.height=c.offsetHeight; }
  resize();
  window.addEventListener('resize',resize,{passive:true});

  /* Particles */
  const pts = Array.from({length:55},()=>({
    x:Math.random()*2000,y:Math.random()*600,
    vx:(Math.random()-.5)*.15,vy:(Math.random()-.5)*.1,
    r:Math.random()*1.4+.4,a:Math.random()*.6+.2
  }));

  function draw(){
    ctx.clearRect(0,0,W,H); t+=.004;
    const dark = isDark();

    /* Radial blobs */
    for(let i=0;i<4;i++){
      const bx = W*(0.12+i*0.28)+Math.sin(t+i*1.6)*60;
      const by = H*.5+Math.cos(t*.7+i)*50;
      const br = 140+i*50;
      const g=ctx.createRadialGradient(bx,by,0,bx,by,br);
      const alpha = dark?0.06:0.04;
      g.addColorStop(0,`rgba(43,142,199,${alpha})`);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2); ctx.fill();
    }

    /* Gold accent blob */
    {
      const bx=W*.75+Math.sin(t*1.2)*40, by=H*.3+Math.cos(t*.8)*30, br=100;
      const g=ctx.createRadialGradient(bx,by,0,bx,by,br);
      const alpha=dark?0.05:0.03;
      g.addColorStop(0,`rgba(245,200,0,${alpha})`); g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2); ctx.fill();
    }

    /* Hex grid */
    const s=52; ctx.lineWidth=.5;
    for(let row=0;row<Math.ceil(H/s)+1;row++){
      for(let col=0;col<Math.ceil(W/s)+1;col++){
        const hx=col*s+(row%2)*s/2, hy=row*s*.866;
        const pulse=Math.sin(t*1.5+hx*.015+hy*.015)*.5+.5;
        ctx.beginPath();
        for(let v=0;v<6;v++){
          const a=v*Math.PI/3;
          v===0?ctx.moveTo(hx+s*.4*Math.cos(a),hy+s*.4*Math.sin(a)):ctx.lineTo(hx+s*.4*Math.cos(a),hy+s*.4*Math.sin(a));
        }
        ctx.closePath();
        const hexAlpha = dark ? pulse*.04 : pulse*.025;
        ctx.strokeStyle=`rgba(245,200,0,${hexAlpha})`; ctx.stroke();
      }
    }

    /* Particles */
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      const pAlpha = dark ? p.a*.3 : p.a*.12;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(245,200,0,${pAlpha})`; ctx.fill();
    });

    /* Connections */
    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<90){
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          const lAlpha = dark ? .08*(1-d/90) : .04*(1-d/90);
          ctx.strokeStyle=`rgba(43,142,199,${lAlpha})`; ctx.lineWidth=.5; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── CONTACT CANVAS ── */
(function(){
  const c=document.getElementById('contact-canvas');
  if(!c) return;
  const ctx=c.getContext('2d');
  let W,H,t=0;
  function resize(){ W=c.width=c.offsetWidth; H=c.height=c.offsetHeight; }
  resize(); window.addEventListener('resize',resize,{passive:true});
  function draw(){
    ctx.clearRect(0,0,W,H); t+=.004;
    ctx.save(); ctx.strokeStyle='rgba(245,200,0,0.04)'; ctx.lineWidth=1;
    for(let i=-H;i<W+H;i+=40){
      ctx.beginPath();
      ctx.moveTo(i+Math.sin(t)*20,0); ctx.lineTo(i+H+Math.sin(t)*20,H); ctx.stroke();
    }
    ctx.restore();
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── CONTACT FORM ── */
function submitForm(e){
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type=submit]');
  const succ = document.getElementById('f-success');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const endpoint = form.dataset.googleFormAction;
  btn.textContent = 'Sending…';
  btn.disabled = true;
  if (endpoint && endpoint.indexOf('docs.google.com/forms/d/e/') !== -1) {
    const data = new FormData(form);
    fetch(endpoint, { method: 'POST', mode: 'no-cors', body: data });
  }
  setTimeout(() => {
    btn.textContent = 'Sent! ✓';
    if (succ) succ.style.display = 'block';
    setTimeout(() => {
      btn.textContent = 'Send Enquiry →'; btn.disabled = false;
      form.reset();
      if (succ) succ.style.display = 'none';
    }, 4000);
  }, 1200);
}