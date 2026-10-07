const gallery=document.querySelector('.work-grid');
document.querySelectorAll('.project:not([data-type="door54"])').forEach(project=>project.dataset.type='photography');
const extraWork=[
  {src:'assets/work/door-fieldbar-new-01.jpg',type:'door54'},
  {src:'assets/work/door-fieldbar-new-02.jpg',type:'door54'},
  {src:'assets/work/door-fieldbar-new-03.jpg',type:'door54'},
  {src:'assets/work/door-fieldbar-new-04.jpg',type:'door54'},
  {src:'assets/work/lyndon-martell.jpg',type:'photography'},
  {src:'assets/work/lyndon-4th-street.jpg',type:'photography'},
  {src:'assets/work/lyndon-redemption.jpg',type:'photography'},
  {src:'assets/work/lyndon-vawter-cucumber.jpg',type:'photography'},
  {src:'assets/work/lyndon-barista.jpg',type:'photography'},
  ...Array.from({length:12},(_,i)=>({src:`assets/work-expanded/lyndon-${String(i+1).padStart(2,'0')}.jpg`,type:'photography'}))
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
