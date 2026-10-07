const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value,max){return String(value??'').trim().slice(0,max)}
function escapeHtml(value){return value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}

module.exports=async function handler(request,response){
  if(request.method!=='POST') return response.status(405).json({error:'Method not allowed.'});
  if(!process.env.RESEND_API_KEY) return response.status(500).json({error:'Email service is not configured.'});

  const body=typeof request.body==='string'?JSON.parse(request.body||'{}'):(request.body||{});
  if(clean(body.website,200)) return response.status(200).json({ok:true});

  const enquiry={
    firstName:clean(body.firstName,80),lastName:clean(body.lastName,80),
    email:clean(body.email,160),company:clean(body.company,120),
    workNature:clean(body.workNature,120),details:clean(body.details,3000)
  };
  if(!enquiry.firstName||!enquiry.lastName||!enquiry.company||!enquiry.workNature||!EMAIL_RE.test(enquiry.email)){
    return response.status(400).json({error:'Please complete all required fields with a valid email address.'});
  }

  const safe=Object.fromEntries(Object.entries(enquiry).map(([key,value])=>[key,escapeHtml(value)]));
  const subject=`New Content Hotel enquiry — ${enquiry.workNature} — ${enquiry.firstName} ${enquiry.lastName}`;
  const resendResponse=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},
    body:JSON.stringify({
      from:'The Content Hotel <onboarding@resend.dev>',
      to:['padraigstan@gmail.com'],
      reply_to:enquiry.email,
      subject,
      html:`<div style="background:#f2efe8;padding:32px;font-family:Arial,sans-serif;color:#11110f"><div style="max-width:640px;margin:auto;background:#fff;padding:32px;border-top:8px solid #d94b32"><p style="font-size:12px;font-weight:700;letter-spacing:.08em">THE CONTENT HOTEL / NEW ENQUIRY</p><h1 style="font-size:28px;margin:24px 0">A new enquiry has checked in.</h1><table style="border-collapse:collapse;width:100%"><tr><td style="padding:10px 0;border-bottom:1px solid #ddd"><b>Name</b></td><td style="padding:10px 0;border-bottom:1px solid #ddd">${safe.firstName} ${safe.lastName}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #ddd"><b>Email</b></td><td style="padding:10px 0;border-bottom:1px solid #ddd"><a href="mailto:${safe.email}">${safe.email}</a></td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #ddd"><b>Company</b></td><td style="padding:10px 0;border-bottom:1px solid #ddd">${safe.company}</td></tr><tr><td style="padding:10px 0;border-bottom:1px solid #ddd"><b>Work required</b></td><td style="padding:10px 0;border-bottom:1px solid #ddd">${safe.workNature}</td></tr></table><h2 style="font-size:16px;margin-top:28px">Additional details</h2><p style="line-height:1.6;white-space:pre-wrap">${safe.details||'No additional details provided.'}</p><p style="margin-top:30px;font-size:12px;color:#666">Reply directly to this email to contact ${safe.firstName}.</p></div></div>`,
      text:`New Content Hotel enquiry\n\nName: ${enquiry.firstName} ${enquiry.lastName}\nEmail: ${enquiry.email}\nCompany: ${enquiry.company}\nWork required: ${enquiry.workNature}\n\nAdditional details:\n${enquiry.details||'No additional details provided.'}`
    })
  });
  const result=await resendResponse.json().catch(()=>({}));
  if(!resendResponse.ok){
    console.error('Resend error',resendResponse.status,result?.name||'unknown');
    return response.status(502).json({error:'We could not send your enquiry. Please try again.'});
  }
  return response.status(200).json({ok:true});
};
