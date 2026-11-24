const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type,x-admin-key","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8",...cors}});
export default {async fetch(request,env){
  if(request.method==='OPTIONS') return new Response(null,{headers:cors});
  const u=new URL(request.url);
  if(u.pathname==='/check'&&request.method==='POST'){
    let body; try{body=await request.json()}catch{return json({error:'json'},400)}
    const id=String(body.id||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,80); if(!id)return json({error:'id'},400);
    const paused=await env.DB.prepare("SELECT value FROM settings WHERE key='paused'").first();
    if(paused?.value==='1') return json({allowed:false,reason:'paused'});
    const existing=await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(id).first();
    if(!existing){const limit=Number((await env.DB.prepare("SELECT value FROM settings WHERE key='limit'").first())?.value||88); const count=Number((await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first())?.n||0); if(count>=limit)return json({allowed:false,reason:'full',limit,count}); const now=new Date().toISOString(); await env.DB.prepare('INSERT INTO users(id,first_seen,last_seen) VALUES(?,?,?)').bind(id,now,now).run();}
    else await env.DB.prepare('UPDATE users SET last_seen=? WHERE id=?').bind(new Date().toISOString(),id).run();
    const count=Number((await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first())?.n||0); return json({allowed:true,count,limit:Number((await env.DB.prepare("SELECT value FROM settings WHERE key='limit'").first())?.value||88)});
  }
  if(u.pathname==='/admin/status'&&request.method==='GET'){if(request.headers.get('x-admin-key')!==env.ADMIN_KEY)return json({error:'unauthorized'},401); const n=await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first(); const p=await env.DB.prepare("SELECT value FROM settings WHERE key='paused'").first(); const l=await env.DB.prepare("SELECT value FROM settings WHERE key='limit'").first(); return json({count:n?.n||0,limit:Number(l?.value||88),paused:p?.value==='1'});}
  if(u.pathname==='/admin/pause'&&request.method==='POST'){if(request.headers.get('x-admin-key')!==env.ADMIN_KEY)return json({error:'unauthorized'},401); const body=await request.json().catch(()=>({})); await env.DB.prepare("UPDATE settings SET value=? WHERE key='paused'").bind(body.paused?'1':'0').run(); return json({paused:!!body.paused});}
  return json({error:'not_found'},404);
}};
