import puppeteer from 'puppeteer-core';
const CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE='http://127.0.0.1:5173';
const PAGES=[['home','/'],['about','/aboutUs'],['contact','/contact'],['courses','/courses'],['notes','/notes'],['syllabus','/syllabus'],['main-login','/MainLogin'],['login','/login'],['not-found','/x'],['dashboard','/StudentDashboard/dashboard'],['announcements','/StudentDashboard/announcement'],['assignments','/StudentDashboard/assignment'],['quizzes','/StudentDashboard/quiz'],['library','/StudentDashboard/library'],['ai','/ai'],['pdf','/StudentDashboard/notes'],['teachers','/StudentDashboard/teachersNotes'],['fees','/StudentDashboard/payfees'],['live','/live-class']];
const AUTH=new Set(['dashboard','announcements','assignments','quizzes','library','ai','pdf','teachers','fees','live']);
const browser=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-first-run','--no-default-browser-check','--hide-scrollbars']});
const report=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
for(const [name,route] of PAGES){
  const context=await browser.createBrowserContext();
  const page=await context.newPage();
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.evaluateOnNewDocument((auth)=>{localStorage.clear(); if(auth){localStorage.setItem('token','audit-token');localStorage.setItem('email','aarav.sharma@college.edu');}},AUTH.has(name));
  await page.goto(BASE+route,{waitUntil:'domcontentloaded'}); await delay(800);
  const data=await page.evaluate(()=>{
    const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/); if(!m)return null; const p=m[1].split(',').map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};};
    const lum=c=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4};return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b)};
    const contrast=(a,b)=>{const l=[lum(a),lum(b)].sort((x,y)=>y-x);return (l[0]+0.05)/(l[1]+0.05)};
    const blend=(top,bot)=>{const a=top.a;return {r:Math.round(top.r*a+bot.r*(1-a)),g:Math.round(top.g*a+bot.g*(1-a)),b:Math.round(top.b*a+bot.b*(1-a)),a:1}};
    const bgFor=el=>{
      let cur=el, layers=[], image=false;
      while(cur){const cs=getComputedStyle(cur); if(cs.backgroundImage&&cs.backgroundImage!=='none') image=true; const c=parse(cs.backgroundColor); if(c&&c.a>0) layers.push(c); if(c&&c.a>=0.999) break; cur=cur.parentElement;}
      let base={r:255,g:255,b:255,a:1};
      for(let i=layers.length-1;i>=0;i--) base=blend(layers[i],base);
      return {base,image};
    };
    const visible=el=>{const cs=getComputedStyle(el);const r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)>0&&r.width>0&&r.height>0&&!el.closest('.sr-only, [aria-hidden="true"]')};
    const directText=el=>[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').replace(/\s+/g,' ').trim();
    const missingAlt=[...document.images].filter(img=>!img.hasAttribute('alt')).map(img=>img.getAttribute('src'));
    const controls=[...document.querySelectorAll('a,button,input,select,textarea,summary')].filter(visible).map(el=>{
      const tag=el.tagName.toLowerCase(); let label=(el.getAttribute('aria-label')||el.getAttribute('title')||'').trim();
      if(!label && (tag==='button'||tag==='a'||tag==='summary')) label=el.innerText.trim().replace(/\s+/g,' ');
      if(!label && ['input','select','textarea'].includes(tag)){const id=el.id; const lab=id?document.querySelector(`label[for="${CSS.escape(id)}"]`):null; const wrapping=el.closest('label'); label=(lab?.innerText||wrapping?.innerText||el.getAttribute('placeholder')||'').trim();}
      return {tag,label,html:el.outerHTML.slice(0,120)};
    }).filter(x=>!x.label);
    const ids={}; const dup=[]; document.querySelectorAll('[id]').forEach(el=>{ids[el.id]=(ids[el.id]||0)+1}); for(const [id,n] of Object.entries(ids)) if(n>1) dup.push({id,n});
    const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>({level:+h.tagName[1],text:h.innerText.trim().slice(0,60)}));
    const contrastFails=[];
    document.querySelectorAll('body *').forEach(el=>{
      const text=directText(el); if(!text) return; if(!visible(el)) return;
      const cs=getComputedStyle(el); const fgRaw=parse(cs.color); if(!fgRaw) return;
      const {base,image}=bgFor(el);
      const fg=blend(fgRaw,base); const ratio=contrast(fg,base);
      const size=parseFloat(cs.fontSize), weight=parseInt(cs.fontWeight)||400; const large=size>=24||(size>=18.66&&weight>=700); const req=large?3:4.5;
      if(ratio+0.01<req) contrastFails.push({text:text.slice(0,55),ratio:+ratio.toFixed(2),size,weight,cls:typeof el.className==='string'?el.className.slice(0,90):'',fg:cs.color,bg:`rgb(${base.r}, ${base.g}, ${base.b})`,image});
    });
    return {missingAlt,controls,dup,h1:document.querySelectorAll('h1').length,headings,contrastFails};
  });
  report.push({name,route,...data});
  await context.close();
}
for(const r of report){
  const uniqueContrast=[...new Map(r.contrastFails.map(x=>[x.text+x.cls+x.ratio,x])).values()];
  console.log(`\n=== ${r.name} === h1:${r.h1} duplicateIds:${JSON.stringify(r.dup)} missingAlt:${JSON.stringify(r.missingAlt)} unlabeledControls:${r.controls.length} contrastFails:${uniqueContrast.length}`);
  if(r.controls.length) console.log('controls',r.controls.slice(0,8));
  if(uniqueContrast.length) console.log('contrast',uniqueContrast.slice(0,12));
  const levels=r.headings.map(h=>h.level); let bad=false; for(let i=1;i<levels.length;i++) if(levels[i]-levels[i-1]>1) bad=true;
  if(bad) console.log('heading jump', r.headings);
}
await browser.close();
