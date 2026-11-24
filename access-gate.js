/* Control práctico de altas: 80 plazas previstas + 10 % = 88. */
(function(){
  const ENDPOINT='https://mi-refuerzo-2eso-control.agilgomez.workers.dev/check';
  const ID_KEY='mi_refuerzo_2eso_access_id_v1';
  const appSrc='app.js?v=2eso-niveles-r5';
  const loadApp=()=>{const s=document.createElement('script');s.src=appSrc;document.body.appendChild(s)};
  const show=(title,text)=>{document.body.innerHTML=`<main style="font-family:system-ui,sans-serif;max-width:680px;margin:12vh auto;padding:28px;color:#24364b"><h1>${title}</h1><p>${text}</p><p style="color:#62748a">Mi Refuerzo · Matemáticas 2.º ESO</p></main>`};
  const id=()=>{let v=localStorage.getItem(ID_KEY);if(!v){v=crypto.randomUUID?crypto.randomUUID():`a${Date.now()}${Math.random().toString(36).slice(2)}`;localStorage.setItem(ID_KEY,v)}return v};
  fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:id()})})
    .then(r=>r.json().then(x=>({ok:r.ok,x})))
    .then(({ok,x})=>{if(ok&&x.allowed)loadApp();else if(x.reason==='full')show('Cupo completo','Se ha alcanzado el límite de 88 dispositivos autorizados. Consulta al profesor.');else if(x.reason==='paused')show('Acceso pausado','El profesor ha pausado temporalmente el acceso.');else loadApp()})
    .catch(()=>loadApp());
})();
