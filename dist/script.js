const gallery=document.querySelector('.work-grid');
document.querySelectorAll('.project:not([data-type="door54"])').forEach(project=>project.dataset.type='photography');
const extraWork=[
  {src:'assets/work/door-fieldbar-new-03.jpg',type:'door54'},
  {src:'assets/work/lyndon-martell.jpg',type:'photography'},
  {src:'assets/work/lyndon-4th-street.jpg',type:'photography'},
  {src:'assets/work/lyndon-redemption.jpg',type:'photography'},
  {src:'assets/work/lyndon-vawter-cucumber.jpg',type:'photography'},
  {src:'assets/work/lyndon-barista.jpg',type:'photography'},
  ...Array.from({length:12},(_,i)=>({src:`assets/work-expanded/lyndon-${String(i+1).padStart(2,'0')}.jpg`,type:'photography'})),
  ...Array.from({length:84},(_,i)=>({src:`assets/cameron/cameron-${String(i+1).padStart(3,'0')}.webp`,type:'photography'}))
];
extraWork.forEach((item,index)=>{
  const figure=document.createElement('figure');
  figure.className='project';
  figure.dataset.type=item.type;
  const image=document.createElement('img');
  image.src=item.src;
  image.alt=item.type==='door54'?'Campaign and film production work':'Commercial photography';
  image.loading=index<6?'eager':'lazy';
  image.decoding='async';
  figure.appendChild(image);
  gallery.appendChild(figure);
});

const buttons=[...document.querySelectorAll('.filters button')];
const projects=[...document.querySelectorAll('.project')];
const reel=document.querySelector('.reel');
projects.forEach(project=>{
  project.tabIndex=0;
  project.setAttribute('role','button');
  project.setAttribute('aria-label',`Open ${project.querySelector('img')?.alt||'image'} in The Viewing Suite`);
});
buttons.forEach(button=>button.addEventListener('click',()=>{
  buttons.forEach(b=>b.classList.remove('active')); button.classList.add('active');
  const filter=button.dataset.filter;
  reel.classList.toggle('hidden',filter!=='all'&&filter!=='door54');
  projects.forEach(project=>project.classList.toggle('hidden',filter!=='all'&&project.dataset.type!==filter));
}));

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});observer.unobserve(entry.target)}
}),{threshold:.12});
document.querySelectorAll('.room-card,.project,.stay-options article').forEach(el=>observer.observe(el));

const viewingSuite=document.querySelector('#viewing-suite');
const suiteImage=document.querySelector('#suite-image');
const suiteNumber=document.querySelector('#suite-number');
const suiteCaption=document.querySelector('#suite-caption');
const suiteCount=document.querySelector('#suite-count');
let suiteImages=[];
let suiteIndex=0;
let suiteOpener=null;
let touchStartX=0;
const suiteLabel=figure=>figure.querySelector('figcaption b')?.textContent||'THE CONTENT HOTEL';
const showSuiteImage=index=>{
  if(!suiteImages.length) return;
  suiteIndex=(index+suiteImages.length)%suiteImages.length;
  const figure=suiteImages[suiteIndex];
  const source=figure.querySelector('img');
  suiteImage.src=source.currentSrc||source.src;
  suiteImage.alt=source.alt;
  suiteNumber.textContent=`ROOM ${String(suiteIndex+1).padStart(2,'0')}`;
  suiteCaption.textContent=suiteLabel(figure);
  suiteCount.textContent=`${String(suiteIndex+1).padStart(2,'0')} / ${String(suiteImages.length).padStart(2,'0')}`;
};
const openSuite=figure=>{
  suiteImages=projects.filter(project=>!project.classList.contains('hidden'));
  suiteIndex=suiteImages.indexOf(figure);
  if(suiteIndex<0) return;
  suiteOpener=figure;
  showSuiteImage(suiteIndex);
  viewingSuite.showModal();
  document.body.classList.add('viewer-open');
};
const closeSuite=()=>viewingSuite.close();
projects.forEach(project=>{
  project.addEventListener('click',()=>openSuite(project));
  project.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();openSuite(project)}
  });
});
viewingSuite.querySelector('[data-suite-prev]').addEventListener('click',()=>showSuiteImage(suiteIndex-1));
viewingSuite.querySelector('[data-suite-next]').addEventListener('click',()=>showSuiteImage(suiteIndex+1));
viewingSuite.querySelector('[data-suite-close]').addEventListener('click',closeSuite);
viewingSuite.addEventListener('click',event=>{if(event.target===viewingSuite) closeSuite()});
viewingSuite.addEventListener('close',()=>{
  document.body.classList.remove('viewer-open');
  suiteImage.removeAttribute('src');
  suiteOpener?.focus({preventScroll:true});
});
viewingSuite.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft') showSuiteImage(suiteIndex-1);
  if(event.key==='ArrowRight') showSuiteImage(suiteIndex+1);
});
viewingSuite.addEventListener('touchstart',event=>{touchStartX=event.changedTouches[0].clientX},{passive:true});
viewingSuite.addEventListener('touchend',event=>{
  const distance=event.changedTouches[0].clientX-touchStartX;
  if(Math.abs(distance)>55) showSuiteImage(suiteIndex+(distance<0?1:-1));
},{passive:true});

const enquiryForm=document.querySelector('#enquiry-form');
const formStatus=document.querySelector('#form-status');
const enquirySuccess=document.querySelector('#enquiry-success');
const anotherEnquiry=document.querySelector('#another-enquiry');
enquiryForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!enquiryForm.checkValidity()){
    enquiryForm.reportValidity();
    return;
  }
  const button=enquiryForm.querySelector('button[type="submit"]');
  const data=Object.fromEntries(new FormData(enquiryForm));
  button.disabled=true;
  button.innerHTML='Sending…';
  formStatus.textContent='';
  formStatus.className='';
  try{
    const response=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error||'We could not send your enquiry.');
    enquiryForm.reset();
    enquiryForm.hidden=true;
    enquirySuccess.hidden=false;
    enquirySuccess.focus({preventScroll:true});
    enquirySuccess.scrollIntoView({behavior:'smooth',block:'center'});
  }catch(error){
    formStatus.textContent=error.message||'Something went wrong. Please try again.';
    formStatus.className='error';
  }finally{
    button.disabled=false;
    button.innerHTML='Send enquiry <b>↗</b>';
  }
});

anotherEnquiry?.addEventListener('click',()=>{
  enquirySuccess.hidden=true;
  enquiryForm.hidden=false;
  formStatus.textContent='';
  formStatus.className='';
  enquiryForm.querySelector('input[name="firstName"]').focus();
});
