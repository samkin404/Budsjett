var SURL='https://fexxivmthxjyzljbmylk.supabase.co';
var SKEY='sb_publishable__l1bjZODQJmia0pCYGv6bg_a5RhG6zT';
var M=['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember'];
var ICONS=['🏠','🚗','📱','⚡','🌐','🎬','📺','💪','⛳','🔋','🛒','🎯','🍽️','👟','🎲','💊','✈️','🐾','🎓','💈','🎸','🏋️','🚴','🏊','🎮','🎨','📚','💻','🖥️','📷','🎥','🔧','🏗️','🏢','🏪','🏥','🍕','🍔','🌮','🍜','🍣','☕','🍺','🥤','🛁','🛋️','🌿','🌸','🌞','❄️','🚀','🎁','💰','💳','🏆','🔑','📝','📌','📦','🛍️','🧴','👗','👔','🐶','🐱','🐠','🌱','💐','⛽','🚌','🎵','🎤','⌚','💎','🏡'];
var COLORS=['#1e3a5f','#1e3a3a','#1e2a3a','#3a2e10','#2a1e10','#3a1a1a','#2a1a3a','#1a3a1e','#2a2a2a','#1a2e3a'];

// Suggested categories for onboarding
var SUGGEST_FIXED=[
  {id:'bolig',name:'Husleie / boliglån',icon:'🏠',color:'#1e3a5f',amount:10000},
  {id:'mobil',name:'Mobilabonnement',icon:'📱',color:'#1e2a3a',amount:400},
  {id:'inet',name:'Internett',icon:'🌐',color:'#1e2a3a',amount:500},
  {id:'strom',name:'Strøm',icon:'⚡',color:'#3a2e10',amount:1000},
  {id:'bil',name:'Bilforsikring',icon:'🚗',color:'#1e3a3a',amount:500},
  {id:'streaming',name:'Netflix / strømming',icon:'🎬',color:'#3a1a1a',amount:200},
  {id:'gym',name:'Treningssenter',icon:'💪',color:'#1a3a1e',amount:400},
  {id:'leasing',name:'Billån / leasing',icon:'🔋',color:'#1a2e3a',amount:4000},
  {id:'forsikring',name:'Annen forsikring',icon:'🛡️',color:'#2a1a3a',amount:500},
  {id:'sparing',name:'Fast sparing',icon:'💰',color:'#1a3a1e',amount:2000},
];
var SUGGEST_VAR=[
  {id:'mat',name:'Mat og dagligvarer',icon:'🛒',color:'#2a1e10',amount:4000},
  {id:'rest',name:'Restaurant / kafe',icon:'🍽️',color:'#3a1a1a',amount:1500},
  {id:'klar',name:'Klær og sko',icon:'👟',color:'#2a1a3a',amount:1000},
  {id:'fritid',name:'Fritid og hobby',icon:'🎯',color:'#1a3a1e',amount:1500},
  {id:'transport',name:'Transport / drivstoff',icon:'⛽',color:'#2a2a2a',amount:800},
  {id:'helse',name:'Helse / apotek',icon:'💊',color:'#3a1a1a',amount:500},
  {id:'div',name:'Diverse / uforutsett',icon:'🎲',color:'#2a2a2a',amount:1000},
  {id:'barn',name:'Barn / familie',icon:'🧸',color:'#2a1e10',amount:1000},
  {id:'reise',name:'Reise / ferie',icon:'✈️',color:'#1e2a3a',amount:1000},
];

var cy=new Date().getFullYear(),cm=new Date().getMonth();
var mode='budget',addTo=null,txItem=null,emTarget=null,chartObj=null;
var supa=null,userId=null,cache={};
// Onboarding state
var obIncome=56000,obFixed=[],obVar=[];

// ── SCREEN NAVIGATION ──
function goTo(id){
  document.querySelectorAll('.screen').forEach(function(s){
    s.classList.remove('active');
  });
  var next=document.getElementById(id);
  if(next){
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        next.classList.add('active');
      });
    });
  }
}

// ── STORAGE ──
function ls(k,d){if(cache[k]!==undefined)return cache[k];try{var v=localStorage.getItem(k);return v!==null?JSON.parse(v):d}catch(e){return d}}
function lss(k,v){cache[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}saveCloud(k,v)}
function gF(){return ls('fx',[])}
function gV(){return ls('vr',[])}
function sF(v){lss('fx',v)}
function sV(v){lss('vr',v)}
function gMD(y,m){return ls('b_'+y+'_'+m,{})}
function sMD(y,m,d){lss('b_'+y+'_'+m,d)}
function gInc(y,m){return gMD(y,m).income||56000}
function gExt(y,m){return ls('ex_'+y+'_'+m,[])}
function sExt(y,m,v){lss('ex_'+y+'_'+m,v)}
function gTI(y,m){return gInc(y,m)+gExt(y,m).reduce(function(s,x){return s+x.amount},0)}
function gTxs(y,m,id){return ls('tx_'+y+'_'+m+'_'+id,[])}
function sTxs(y,m,id,v){lss('tx_'+y+'_'+m+'_'+id,v)}
function gTxT(y,m,id){return gTxs(y,m,id).reduce(function(s,x){return s+x.amount},0)}
function fmt(n){return Math.round(n).toLocaleString('nb-NO')+' kr'}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,5)}
function rnd(){return Math.floor(Math.random()*ICONS.length)}
function esc(s){return String(s).replace(/"/g,'&quot;')}

// ── SAVINGS ──
function getSavMode(){return ls('sav_mode','pct')}
function getSavVal(){return ls('sav_val',10)}
function calcSavings(income){
  var mode=getSavMode(),val=getSavVal();
  if(mode==='pct')return Math.round(income*(val/100));
  return val;
}
function setSavMode(m){
  lss('sav_mode',m);
  var pBtn=document.getElementById('sav-pct-btn');
  var fBtn=document.getElementById('sav-fix-btn');
  var unit=document.getElementById('sav-unit');
  var inp=document.getElementById('sav-inp');
  if(pBtn&&fBtn&&unit&&inp){
    pBtn.style.background=m==='pct'?'var(--accent)':'transparent';
    pBtn.style.color=m==='pct'?'#0a0f1e':'var(--muted)';
    fBtn.style.background=m==='fixed'?'var(--accent)':'transparent';
    fBtn.style.color=m==='fixed'?'#0a0f1e':'var(--muted)';
    unit.textContent=m==='pct'?'%':'kr';
    inp.value=getSavVal();
  }
  updInc();
}
function saveSavings(){
  var inp=document.getElementById('sav-inp');
  if(!inp)return;
  var v=parseFloat(inp.value)||0;
  lss('sav_val',v);
  updInc();
}
function initSavingsUI(){
  var m=getSavMode(),v=getSavVal();
  var pBtn=document.getElementById('sav-pct-btn');
  var fBtn=document.getElementById('sav-fix-btn');
  var unit=document.getElementById('sav-unit');
  var inp=document.getElementById('sav-inp');
  if(!inp)return;
  inp.value=v;
  unit.textContent=m==='pct'?'%':'kr';
  pBtn.style.background=m==='pct'?'var(--accent)':'transparent';
  pBtn.style.color=m==='pct'?'#0a0f1e':'var(--muted)';
  fBtn.style.background=m==='fixed'?'var(--accent)':'transparent';
  fBtn.style.color=m==='fixed'?'#0a0f1e':'var(--muted)';
}

// ── SYNC ──
function showSync(msg){var b=document.getElementById('sync-bar');b.textContent=msg;b.style.display='block'}
function hideSync(){setTimeout(function(){document.getElementById('sync-bar').style.display='none'},1200)}
async function saveCloud(key,value){
  if(!supa||!userId)return;
  try{await supa.from('budget_data').upsert({user_id:userId,data_key:key,data_value:value,updated_at:new Date().toISOString()},{onConflict:'user_id,data_key'})}catch(e){}
}
async function loadCloud(){
  if(!supa||!userId)return;
  showSync('☁️ Laster data...');
  try{
    var r=await supa.from('budget_data').select('data_key,data_value').eq('user_id',userId);
    if(r.data)r.data.forEach(function(row){
      cache[row.data_key]=row.data_value;
      try{localStorage.setItem(row.data_key,JSON.stringify(row.data_value))}catch(e){}
    });
    hideSync();
  }catch(e){hideSync()}
}

// ── AUTH ──
async function initApp(){
  try{supa=supabase.createClient(SURL,SKEY)}catch(e){}
  var hash=window.location.hash.substring(1);
  var params=new URLSearchParams(hash);
  var type=params.get('type');
  var token=params.get('token');
  // Check for password recovery
  if(type==='recovery'&&token){
    showSync('☁️ Verifiserer...');
    try{
      var r=await supa.auth.verifyOtp({token_hash:token,type:'recovery'});
      hideSync();
      history.replaceState(null,null,window.location.pathname);
      if(r.error){
        goTo('scr-login');
      }else{
        userId=r.data.user.id;
        goTo('scr-reset');
      }
    }catch(e){hideSync();goTo('scr-login')}
    return;
  }

  if(type==='signup'&&token){
    showSync('☁️ Bekrefter konto...');
    try{
      var r=await supa.auth.verifyOtp({token_hash:token,type:'email'});
      hideSync();
      history.replaceState(null,null,window.location.pathname);
      if(r.error){
        goTo('scr-login');
        setTimeout(function(){var e=document.getElementById('login-err');e.textContent='Bekreftelseslenken er utløpt. Registrer deg på nytt.';e.style.display='block'},400);
      }else{goTo('scr-confirmed')}
    }catch(e){hideSync();goTo('scr-login')}
    return;
  }
  try{
    var s=await supa.auth.getSession();
    if(s.data&&s.data.session&&s.data.session.user){
      userId=s.data.session.user.id;
      await loadCloud();
      enterApp();
      return;
    }
  }catch(e){}
  goTo('scr-login');
}

async function doLogin(){
  var email=document.getElementById('login-email').value.trim();
  var pw=document.getElementById('login-pw').value;
  var err=document.getElementById('login-err');
  var btn=document.getElementById('login-btn');
  err.style.display='none';
  if(!email||!pw){err.textContent='Fyll inn e-post og passord';err.style.display='block';return}
  btn.textContent='Logger inn...';btn.disabled=true;
  try{
    var r=await supa.auth.signInWithPassword({email:email,password:pw});
    if(r.error){
      var msg=r.error.message;
      if(msg.includes('Invalid login'))msg='Feil e-post eller passord';
      else if(msg.includes('Email not confirmed'))msg='E-posten er ikke bekreftet. Sjekk innboksen din.';
      err.textContent=msg;err.style.display='block';btn.textContent='Logg inn';btn.disabled=false;return;
    }
    userId=r.data.user.id;
    btn.textContent='Laster...';
    await loadCloud();
    btn.textContent='Logg inn';btn.disabled=false;
    enterApp();
  }catch(e){err.textContent='Noe gikk galt, prøv igjen';err.style.display='block';btn.textContent='Logg inn';btn.disabled=false}
}

async function doRegister(){
  var email=document.getElementById('reg-email').value.trim();
  var pw=document.getElementById('reg-pw').value;
  var pw2=document.getElementById('reg-pw2').value;
  var err=document.getElementById('reg-err');
  var ok=document.getElementById('reg-ok');
  var btn=document.getElementById('reg-btn');
  err.style.display='none';ok.style.display='none';
  if(!email||!pw){err.textContent='Fyll inn e-post og passord';err.style.display='block';return}
  if(pw.length<6){err.textContent='Passordet må være minst 6 tegn';err.style.display='block';return}
  if(pw!==pw2){err.textContent='Passordene stemmer ikke overens';err.style.display='block';return}
  btn.textContent='Oppretter konto...';btn.disabled=true;
  try{
    var r=await supa.auth.signUp({email:email,password:pw,options:{emailRedirectTo:'https://samkin404.github.io/Budsjett/'}});
    if(r.error){err.textContent=r.error.message;err.style.display='block';btn.textContent='Opprett konto';btn.disabled=false;return}
    ok.textContent='✓ Sjekk e-posten din (også søppelpost) for bekreftelseslenke!';ok.style.display='block';
    btn.textContent='Opprett konto';btn.disabled=false;
  }catch(e){err.textContent='Noe gikk galt, prøv igjen';err.style.display='block';btn.textContent='Opprett konto';btn.disabled=false}
}

async function doForgot(){
  var email=document.getElementById('forgot-email').value.trim();
  var err=document.getElementById('forgot-err');
  var ok=document.getElementById('forgot-ok');
  var btn=document.getElementById('forgot-btn');
  err.style.display='none';ok.style.display='none';
  if(!email){err.textContent='Fyll inn e-postadressen din';err.style.display='block';return}
  btn.textContent='Sender...';btn.disabled=true;
  try{
    var r=await supa.auth.resetPasswordForEmail(email,{
      redirectTo:'https://samkin404.github.io/Budsjett/'
    });
    if(r.error){err.textContent=r.error.message;err.style.display='block';btn.textContent='Send tilbakestillingslenke';btn.disabled=false;return}
    ok.textContent='✓ Sjekk e-posten din for tilbakestillingslenke!';ok.style.display='block';
    btn.textContent='Send tilbakestillingslenke';btn.disabled=false;
  }catch(e){err.textContent='Noe gikk galt, prøv igjen';err.style.display='block';btn.textContent='Send tilbakestillingslenke';btn.disabled=false}
}

async function doReset(){
  var pw=document.getElementById('reset-pw').value;
  var pw2=document.getElementById('reset-pw2').value;
  var err=document.getElementById('reset-err');
  var btn=document.getElementById('reset-btn');
  err.style.display='none';
  if(!pw||pw.length<6){err.textContent='Passordet må være minst 6 tegn';err.style.display='block';return}
  if(pw!==pw2){err.textContent='Passordene stemmer ikke overens';err.style.display='block';return}
  btn.textContent='Lagrer...';btn.disabled=true;
  try{
    var r=await supa.auth.updateUser({password:pw});
    if(r.error){err.textContent=r.error.message;err.style.display='block';btn.textContent='Lagre nytt passord';btn.disabled=false;return}
    // Password updated - go to app
    userId=r.data.user.id;
    await loadCloud();
    enterApp();
  }catch(e){err.textContent='Noe gikk galt, prøv igjen';err.style.display='block';btn.textContent='Lagre nytt passord';btn.disabled=false}
}

async function doLogout(){
  if(!confirm('Vil du logge ut?'))return;
  if(supa)await supa.auth.signOut();
  userId=null;cache={};
  goTo('scr-login');
}

function enterApp(){
  goTo('scr-app');
  if(!ls('ob_done',false)){
    startOnboarding();
  }else{
    document.getElementById('view-ob').style.display='none';
    document.getElementById('view-main').style.display='block';
    upd();
  }
}

// ── ONBOARDING ──
var obStep=0;

function startOnboarding(){
  obIncome=56000;obFixed=[];obVar=[];obStep=0;
  document.getElementById('view-main').style.display='none';
  document.getElementById('view-ob').style.display='block';
  showObStep(0);
}

function showObStep(s){
  document.querySelectorAll('.ob-step').forEach(function(el){el.style.display='none'});
  document.querySelectorAll('.ob-dot').forEach(function(el,i){el.classList.toggle('active',i===s)});
  var el=document.getElementById('ob'+s);
  if(el)el.style.display='block';
  obStep=s;
  if(s===2)renderObFixed();
  if(s===3)renderObVar();
  if(s===4)setTimeout(updateObSavPreview,100);
}

function obNext(){showObStep(obStep+1)}
function obBack(){if(obStep>0)showObStep(obStep-1)}

function obSaveIncome(){
  var inp=document.getElementById('ob-income-inp');
  var v=parseInt(inp?inp.value:0)||0;
  obIncome=v;
  obNext();
}

function renderObFixed(){
  var el=document.getElementById('ob-fixed-list');
  el.innerHTML=SUGGEST_FIXED.map(function(cat){
    var checked=obFixed.some(function(x){return x.id===cat.id});
    return '<div class="ob-cat-row" id="obfrow_'+cat.id+'" onclick="toggleObCat(\'fixed\',\''+cat.id+'\')" style="'+(checked?'border-color:var(--accent);background:rgba(74,222,128,.08)':'')+'">'+
      '<div style="display:flex;align-items:center;gap:10px;flex:1">'+
        '<span style="font-size:20px;width:36px;height:36px;border-radius:10px;background:'+cat.color+';display:flex;align-items:center;justify-content:center">'+cat.icon+'</span>'+
        '<span style="font-size:14px;font-weight:600">'+cat.name+'</span>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
        '<span style="font-family:var(--mono);font-size:12px;color:var(--muted)">'+fmt(cat.amount)+'</span>'+
        '<span style="font-size:18px;color:'+(checked?'var(--accent)':'var(--muted)')+'">'+(checked?'✓':'○')+'</span>'+
      '</div>'+
    '</div>';
  }).join('');
}

function renderObVar(){
  var el=document.getElementById('ob-var-list');
  el.innerHTML=SUGGEST_VAR.map(function(cat){
    var checked=obVar.some(function(x){return x.id===cat.id});
    return '<div class="ob-cat-row" id="obvrow_'+cat.id+'" onclick="toggleObCat(\'var\',\''+cat.id+'\')" style="'+(checked?'border-color:var(--accent);background:rgba(74,222,128,.08)':'')+'">'+
      '<div style="display:flex;align-items:center;gap:10px;flex:1">'+
        '<span style="font-size:20px;width:36px;height:36px;border-radius:10px;background:'+cat.color+';display:flex;align-items:center;justify-content:center">'+cat.icon+'</span>'+
        '<span style="font-size:14px;font-weight:600">'+cat.name+'</span>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:8px">'+
        '<span style="font-family:var(--mono);font-size:12px;color:var(--muted)">'+fmt(cat.amount)+'</span>'+
        '<span style="font-size:18px;color:'+(checked?'var(--accent)':'var(--muted)')+'">'+(checked?'✓':'○')+'</span>'+
      '</div>'+
    '</div>';
  }).join('');
}

function toggleObCat(type,id){
  var list=type==='fixed'?SUGGEST_FIXED:SUGGEST_VAR;
  var arr=type==='fixed'?obFixed:obVar;
  var cat=list.find(function(x){return x.id===id});
  if(!cat)return;
  var idx=arr.findIndex(function(x){return x.id===id});
  if(idx>=0){arr.splice(idx,1)}
  else{arr.push(JSON.parse(JSON.stringify(cat)))}
  if(type==='fixed')renderObFixed();else renderObVar();
}

function obSetSavMode(m){
  lss('sav_mode',m);
  var pBtn=document.getElementById('ob-sav-pct');
  var fBtn=document.getElementById('ob-sav-fix');
  var unit=document.getElementById('ob-sav-unit');
  if(pBtn&&fBtn&&unit){
    pBtn.style.background=m==='pct'?'var(--accent)':'transparent';
    pBtn.style.color=m==='pct'?'#0a0f1e':'var(--muted)';
    fBtn.style.background=m==='fixed'?'var(--accent)':'transparent';
    fBtn.style.color=m==='fixed'?'#0a0f1e':'var(--muted)';
    unit.textContent=m==='pct'?'%':'kr';
  }
  updateObSavPreview();
}
function updateObSavPreview(){
  var inp=document.getElementById('ob-sav-val');
  var prev=document.getElementById('ob-sav-preview');
  if(!inp||!prev)return;
  var v=parseFloat(inp.value)||0;
  var m=getSavMode();
  var sav=m==='pct'?Math.round(obIncome*(v/100)):v;
  if(obIncome>0){
    prev.textContent='= '+Math.round(sav).toLocaleString('nb-NO')+' kr / måned';
  } else {
    prev.textContent='Legg inn inntekt i steg 2 for å se beløp';
  }
}
function obSaveSavings(){
  var inp=document.getElementById('ob-sav-val');
  var v=parseFloat(inp?inp.value:10)||10;
  lss('sav_val',v);
  obNext();
}

function finishOb(){
  // Save income
  var d=gMD(cy,cm);d.income=obIncome||0;d.set=obIncome>0;sMD(cy,cm,d);
  // Save categories (use defaults if none selected)
  var fx=obFixed.length>0?obFixed:[
    {id:'bolig',name:'Husleie / boliglån',icon:'🏠',color:'#1e3a5f',amount:10000},
    {id:'div-fast',name:'Andre faste utgifter',icon:'📌',color:'#2a2a2a',amount:1000}
  ];
  var vr=obVar.length>0?obVar:[
    {id:'mat',name:'Mat og dagligvarer',icon:'🛒',color:'#2a1e10',amount:4000},
    {id:'div',name:'Diverse / uforutsett',icon:'🎲',color:'#2a2a2a',amount:1000}
  ];
  // Add uid to each
  fx.forEach(function(x){if(!x.uid)x.uid=uid()});
  vr.forEach(function(x){if(!x.uid)x.uid=uid()});
  sF(fx);sV(vr);
  lss('ob_done',true);
  document.getElementById('view-ob').style.display='none';
  document.getElementById('view-main').style.display='block';
  upd();
}

// ── MODE ──
function setMode(m){
  mode=m;
  document.getElementById('mode-budget').classList.toggle('active',m==='budget');
  document.getElementById('mode-actual').classList.toggle('active',m==='actual');
  document.getElementById('mode-hint').textContent=m==='budget'
    ?'Trykk ikon for å endre det · Trykk beløp for å endre · ✕ for å slette'
    :'Trykk på en kategori for å logge kjøp';
  rFixed();rVar();initSavingsUI();updInc();
}

// ── INCOME ──
function updInc(){
  var y=cy,m=cm,d=gMD(y,m),base=d.income||56000,ext=gExt(y,m),tot=gTI(y,m);
  var fx=gF(),vr=gV();
  var ft=fx.reduce(function(s,x){return s+x.amount},0);
  var vt=vr.reduce(function(s,x){var t=gTxT(y,m,x.id);return s+(t>0?t:x.amount)},0);
  var sv=calcSavings(tot),lf=tot-ft-vt-sv;
  document.getElementById('ic-month-label').textContent=M[m]+' '+y;
  document.getElementById('ic-remind').style.display=d.set?'none':'flex';
  var leftEl=document.getElementById('ic-left-val');
  leftEl.textContent=fmt(lf);
  leftEl.style.color=lf>=0?'var(--accent)':'var(--danger)';
  document.getElementById('ic-subtitle').textContent='Inntekt '+fmt(tot)+'  ·  Utgifter '+fmt(ft+vt)+'  ·  Sparing '+fmt(sv);
  document.getElementById('ic-val').textContent=fmt(base);
  var ex=document.getElementById('ic-extras'),exl=document.getElementById('ic-extras-list');
  if(ext.length){
    ex.style.display='block';
    exl.innerHTML=ext.map(function(e,i){
      return '<div class="extra-row"><span class="extra-name">💸 '+e.name+'</span><span class="extra-amt">+'+fmt(e.amount)+'</span><button class="extra-del" onclick="delExt('+i+')">✕</button></div>'
    }).join('');
  }else{ex.style.display='none'}
}
function delExt(i){var e=gExt(cy,cm);e.splice(i,1);sExt(cy,cm,e);updInc()}
function startIncEdit(){document.getElementById('ic-val').style.display='none';var inp=document.getElementById('ic-inp');inp.style.display='block';inp.value=gInc(cy,cm);inp.focus();inp.select()}
function commitIncEdit(){var v=parseInt(document.getElementById('ic-inp').value)||56000;var d=gMD(cy,cm);d.income=v;d.set=true;sMD(cy,cm,d);document.getElementById('ic-inp').style.display='none';document.getElementById('ic-val').style.display='block';upd()}

// ── SUMMARY ──
function updSum(){
  var y=cy,m=cm,fx=gF(),vr=gV();
  var ft=fx.reduce(function(s,x){return s+x.amount},0);
  var vt=vr.reduce(function(s,x){var t=gTxT(y,m,x.id);return s+(t>0?t:x.amount)},0);
  var ftEl=document.getElementById('fixed-total');
  var vtEl=document.getElementById('var-total');
  if(ftEl)ftEl.textContent=fmt(ft);
  if(vtEl)vtEl.textContent=fmt(vt);
  updInc();
}

// ── FIXED LIST ──
function rFixed(){
  var items=gF(),el=document.getElementById('fixed-list');
  if(!items.length){el.innerHTML='<div class="empty-state">Ingen kategorier ennå – trykk + Legg til</div>';return}
  var locked=mode==='actual';
  el.innerHTML=items.map(function(item,i){
    return '<div class="expense-row">'+
      '<div class="exp-icon" style="background:'+item.color+'" onclick="openEmoji(\'f\','+i+',event)">'+item.icon+'</div>'+
      '<div class="exp-info">'+
        '<input class="exp-name-inp" value="'+esc(item.name)+'" onchange="updF('+i+',\'name\',this.value)">'+
        '<input class="exp-note-inp" value="'+esc(item.note||'')+'" placeholder="Notat..." onchange="updF('+i+',\'note\',this.value)">'+
      '</div>'+
      '<div class="amt-col">'+
        (locked?'':'<input class="exp-amt-inp" id="fi'+i+'" type="number" inputmode="numeric" value="'+item.amount+'" onblur="cF('+i+')" onkeydown="if(event.key===\'Enter\')this.blur()">')+
        '<span class="exp-amt'+(locked?' locked':'')+'" id="fa'+i+'" '+(locked?'':'onclick="sF2('+i+')"')+'>'+fmt(item.amount)+'</span>'+
      '</div>'+
      '<button class="del-btn" onclick="dF('+i+')">✕</button>'+
    '</div>';
  }).join('');
}
function updF(i,f,v){var a=gF();if(a[i])a[i][f]=v;sF(a);updSum()}
function sF2(i){if(mode==='actual')return;document.getElementById('fa'+i).style.display='none';var inp=document.getElementById('fi'+i);inp.style.display='block';inp.focus();inp.select()}
function cF(i){var inp=document.getElementById('fi'+i),sp=document.getElementById('fa'+i);if(!inp||!sp)return;var v=parseInt(inp.value)||0,a=gF();if(a[i])a[i].amount=v;sF(a);sp.textContent=fmt(v);inp.style.display='none';sp.style.display='block';updSum()}
function dF(i){if(!confirm('Slette?'))return;var a=gF();a.splice(i,1);sF(a);rFixed();updSum()}

// ── VAR LIST ──
function rVar(){
  var items=gV(),el=document.getElementById('var-list');
  if(!items.length){el.innerHTML='<div class="empty-state">Ingen kategorier ennå – trykk + Legg til</div>';return}
  var y=cy,m=cm,isActual=mode==='actual';
  el.innerHTML=items.map(function(item,i){
    var tt=gTxT(y,m,item.id),has=tt>0,over=tt>item.amount;
    if(isActual){
      var sub=has
        ?'<span class="exp-sub '+(over?'tx-over':'tx-logged')+'">'+fmt(tt)+' logget'+(over?' ⚠️':'✓')+'</span>'
        :'<span class="exp-sub" style="color:var(--muted)">Trykk for å logge kjøp</span>';
      return '<div class="expense-row var-row" onclick="openTx('+i+')">'+
        '<div class="exp-icon" style="background:'+item.color+'" onclick="openEmoji(\'v\','+i+',event)">'+item.icon+'</div>'+
        '<div class="exp-info"><div class="exp-name">'+esc(item.name)+'</div>'+sub+'</div>'+
        '<div class="amt-col" onclick="event.stopPropagation()">'+
          '<span style="font-family:var(--mono);font-size:13px;color:'+(has?(over?'var(--danger)':'var(--accent)'):'var(--muted)')+'">'+
            (has?fmt(tt):'0 kr')+'</span>'+
        '</div>'+
        '<button class="del-btn" onclick="event.stopPropagation();dV('+i+')">✕</button>'+
      '</div>';
    }else{
      return '<div class="expense-row">'+
        '<div class="exp-icon" style="background:'+item.color+'" onclick="openEmoji(\'v\','+i+',event)">'+item.icon+'</div>'+
        '<div class="exp-info"><div class="exp-name">'+esc(item.name)+'</div></div>'+
        '<div class="amt-col">'+
          '<input class="exp-amt-inp" id="vi'+i+'" type="number" inputmode="numeric" value="'+item.amount+'" onblur="cV('+i+')" onkeydown="if(event.key===\'Enter\')this.blur()">'+
          '<span class="exp-amt" id="va'+i+'" onclick="sV2('+i+')">'+fmt(item.amount)+'</span>'+
        '</div>'+
        '<button class="del-btn" onclick="dV('+i+')">✕</button>'+
      '</div>';
    }
  }).join('');
}
function sV2(i){if(mode==='actual')return;document.getElementById('va'+i).style.display='none';var inp=document.getElementById('vi'+i);inp.style.display='block';inp.focus();inp.select()}
function cV(i){var inp=document.getElementById('vi'+i),sp=document.getElementById('va'+i);if(!inp||!sp)return;var v=parseInt(inp.value)||0,a=gV();if(a[i])a[i].amount=v;sV(a);sp.textContent=fmt(v);inp.style.display='none';sp.style.display='block';updSum()}
function dV(i){if(!confirm('Slette?'))return;var a=gV();a.splice(i,1);sV(a);rVar();updSum()}

// ── TRANSACTIONS ──
function openTx(i){
  var items=gV();txItem={item:items[i],idx:i};var it=items[i];
  document.getElementById('tx-icon').textContent=it.icon;
  document.getElementById('tx-icon').style.background=it.color;
  document.getElementById('tx-name').textContent=it.name;
  document.getElementById('tx-budget').textContent='Budsjett: '+fmt(it.amount);
  document.getElementById('tx-amt-inp').value='';
  rTxList();
  document.getElementById('tx-ov').classList.add('open');
  document.getElementById('tx-sh').classList.add('open');
  setTimeout(function(){document.getElementById('tx-amt-inp').focus()},400);
}
function rTxList(){
  if(!txItem)return;
  var y=cy,m=cm,id=txItem.item.id,txs=gTxs(y,m,id);
  var tot=txs.reduce(function(s,x){return s+x.amount},0),over=tot>txItem.item.amount;
  var tr=document.getElementById('tx-total-row');
  tr.textContent='Totalt: '+fmt(tot);
  tr.style.color=over?'var(--danger)':'var(--accent)';
  var le=document.getElementById('tx-list');
  if(!txs.length){le.innerHTML='<div style="text-align:center;padding:12px;color:var(--muted);font-size:13px">Ingen registreringer ennå</div>';return}
  le.innerHTML=txs.slice().reverse().map(function(t,ri){
    var ri2=txs.length-1-ri,d=new Date(t.ts);
    var time=d.getDate()+'. '+M[d.getMonth()].slice(0,3)+' kl '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    return '<div class="tx-item"><div><div class="tx-amt">'+fmt(t.amount)+'</div><div class="tx-time">'+time+'</div></div><button class="tx-del" onclick="dTx('+ri2+')">✕</button></div>';
  }).join('');
}
function commitTx(){
  if(!txItem)return;
  var v=parseFloat(document.getElementById('tx-amt-inp').value)||0;if(!v)return;
  var y=cy,m=cm,id=txItem.item.id,txs=gTxs(y,m,id);
  txs.push({amount:v,ts:Date.now()});sTxs(y,m,id,txs);
  document.getElementById('tx-amt-inp').value='';
  rTxList();rVar();updInc();
}
function dTx(i){
  if(!txItem)return;
  var y=cy,m=cm,id=txItem.item.id,txs=gTxs(y,m,id);
  txs.splice(i,1);sTxs(y,m,id,txs);rTxList();rVar();updInc();
}
function closeTx(){
  document.getElementById('tx-ov').classList.remove('open');
  document.getElementById('tx-sh').classList.remove('open');
  txItem=null;
}

// ── EMOJI ──
function openEmoji(type,idx,ev){
  ev.stopPropagation();emTarget={type:type,idx:idx};
  document.getElementById('em-grid').innerHTML=ICONS.map(function(e){
    return '<button class="emoji-btn" onclick="pickEmoji(\''+e+'\')">'+e+'</button>'
  }).join('');
  document.getElementById('em-ov').classList.add('open');
  document.getElementById('em-sh').classList.add('open');
}
function pickEmoji(e){
  if(!emTarget)return;
  if(emTarget.type==='f'){var a=gF();a[emTarget.idx].icon=e;sF(a);rFixed()}
  else{var a=gV();a[emTarget.idx].icon=e;sV(a);rVar()}
  closeEmoji();
}
function closeEmoji(){
  document.getElementById('em-ov').classList.remove('open');
  document.getElementById('em-sh').classList.remove('open');
  emTarget=null;
}

// ── ADD SHEET ──
function openSheet(type){
  addTo=type;var isInc=type==='income';
  document.getElementById('sh-title').textContent=isInc?'Legg til ekstra inntekt':type==='fixed'?'Legg til fast utgift':'Legg til variabel utgift';
  document.getElementById('sh-name').placeholder=isInc?'Navn (f.eks. Feriepenger)':'Navn (f.eks. Spotify)';
  document.getElementById('sh-note-wrap').style.display=isInc?'none':'block';
  document.getElementById('sh-name').value='';document.getElementById('sh-note').value='';document.getElementById('sh-amount').value='';
  document.getElementById('add-ov').classList.add('open');document.getElementById('add-sh').classList.add('open');
  setTimeout(function(){document.getElementById('sh-name').focus()},400);
}
function closeSheet(){document.getElementById('add-ov').classList.remove('open');document.getElementById('add-sh').classList.remove('open');addTo=null}
function commitAdd(){
  var name=document.getElementById('sh-name').value.trim();
  var note=document.getElementById('sh-note').value.trim();
  var amount=parseInt(document.getElementById('sh-amount').value)||0;
  if(!name)return;
  if(addTo==='income'){
    var e=gExt(cy,cm);e.push({id:uid(),name:name,amount:amount});sExt(cy,cm,e);closeSheet();updInc();
  }else if(addTo==='fixed'){
    var a=gF();a.push({id:uid(),name:name,note:note,amount:amount,icon:ICONS[rnd()],color:COLORS[Math.floor(Math.random()*COLORS.length)]});
    sF(a);closeSheet();rFixed();updSum();
  }else{
    var a=gV();a.push({id:uid(),name:name,amount:amount,icon:ICONS[rnd()],color:COLORS[Math.floor(Math.random()*COLORS.length)]});
    sV(a);closeSheet();rVar();updSum();
  }
}

// ── SAVE MONTH ──
function saveMonth(){
  var y=cy,m=cm,inc=gTI(y,m);
  var ft=gF().reduce(function(s,x){return s+x.amount},0);
  var vt=gV().reduce(function(s,x){var t=gTxT(y,m,x.id);return s+(t>0?t:x.amount)},0);
  var sv=calcSavings(inc),lf=inc-ft-vt-sv;
  var d=gMD(y,m);
  sMD(y,m,Object.assign({},d,{income:gInc(y,m),ft:ft,vt:vt,sv:sv,left:lf,saved:true}));
  var btn=document.querySelector('.save-btn');
  btn.textContent='✓ Lagret!';btn.style.background='#22c55e';
  setTimeout(function(){btn.textContent='Lagre denne måneden';btn.style.background='var(--accent)'},1800);
}

function changeMonth(dir){cm+=dir;if(cm>11){cm=0;cy++}if(cm<0){cm=11;cy--}upd()}
function upd(){
  document.getElementById('month-label').textContent=M[cm];
  document.getElementById('year-label').textContent=cy;
  rFixed();rVar();updInc();
}
function showTab(n){
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active')});
  document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.remove('active')});
  document.getElementById('tab-'+n).classList.add('active');
  document.getElementById('nav-'+n).classList.add('active');
  if(n==='historikk')rHist();
  if(n==='graf')rGraf();
}
function getSaved(){
  var e=[];
  for(var i=0;i<localStorage.length;i++){
    var k=localStorage.key(i);
    if(k&&k.startsWith('b_')){
      try{var d=JSON.parse(localStorage.getItem(k));if(d&&d.saved){var p=k.split('_');if(p.length===3)e.push({key:k,year:parseInt(p[1]),month:parseInt(p[2]),left:d.left||0,income:d.income||0,sv:d.sv||0})}}catch(er){}
    }
  }
  return e.sort(function(a,b){return a.year-b.year||a.month-b.month});
}
function rGraf(){
  var e=getSaved(),emp=document.getElementById('graph-empty'),cv=document.getElementById('trendChart');
  if(e.length<2){emp.style.display='block';cv.style.display='none';document.getElementById('graf-history').innerHTML='';return}
  emp.style.display='none';cv.style.display='block';
  if(chartObj)chartObj.destroy();
  chartObj=new Chart(cv,{type:'line',data:{labels:e.map(function(x){return M[x.month].slice(0,3)+' '+String(x.year).slice(2)}),datasets:[{data:e.map(function(x){return x.left}),borderColor:'#4ade80',backgroundColor:'rgba(74,222,128,0.08)',borderWidth:2,pointBackgroundColor:'#4ade80',pointRadius:4,tension:0.3,fill:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return fmt(c.raw)}},backgroundColor:'#1a2236',titleColor:'#f1f5f9',bodyColor:'#4ade80',borderColor:'rgba(255,255,255,0.1)',borderWidth:1}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#64748b',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#64748b',font:{size:10},callback:function(v){return Math.round(v/1000)+'k'}}}}}});
  document.getElementById('graf-history').innerHTML='<div class="section" style="margin-top:14px"><div class="hist-card">'+e.slice().reverse().map(function(x){var c=x.left>=0?'#4ade80':'#f87171';return '<div class="hist-row"><div><div class="hist-month">'+M[x.month]+' '+x.year+'</div><div class="hist-sub">Inntekt '+fmt(x.income)+' · Spart '+fmt(x.sv)+'</div></div><div class="hist-left" style="color:'+c+'">'+(x.left>=0?'+':'')+fmt(x.left)+'</div></div>'}).join('')+'</div></div>';
}
function rHist(){
  var el=document.getElementById('history-content'),e=getSaved().reverse();
  if(!e.length){el.innerHTML='<div class="empty-state">Ingen lagrede måneder ennå.</div>';return}
  el.innerHTML='<div class="hist-card">'+e.map(function(x){var c=x.left>=0?'#4ade80':'#f87171';return '<div class="hist-row"><div><div class="hist-month">'+M[x.month]+' '+x.year+'</div><div class="hist-sub">Inntekt: '+fmt(x.income)+' · Spart: '+fmt(x.sv)+'</div></div><div class="hist-right"><div class="hist-left" style="color:'+c+'">'+(x.left>=0?'+':'')+fmt(x.left)+'</div><button class="hist-del" onclick="dHist(\''+x.key+'\')">🗑</button></div></div>'}).join('')+'</div>';
}
function dHist(k){
  if(confirm('Slette denne måneden?')){
    localStorage.removeItem(k);delete cache[k];
    if(supa&&userId)supa.from('budget_data').delete().eq('user_id',userId).eq('data_key',k);
    rHist();
  }
}

initApp();
