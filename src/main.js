import '@fontsource-variable/inter/wght.css';
import './style.css';
import {createChrome} from './design/SiteChrome.jsx';
import './design/home.css';
import {catalogueProjects} from './data.js';
import {db,loadListings,requestLogin,getLoginProviders,loginWithProvider,publishListing,requestPremium} from './backend.js';
import {makeView} from './views.js';

const app=document.querySelector('#app');
app.innerHTML='<a class="skip" href="#main"></a><header class="header liquid-site-header"></header><main id="main" tabindex="-1"></main><div id="site-footer"></div>';
const renderChrome=createChrome(app.querySelector('header'),app.querySelector('#site-footer'));
const dialog=document.querySelector('#dialog');
const safeRead=(store,key)=>{try{return store.getItem(key);}catch{return null;}};
const safeWrite=(store,key,value)=>{try{if(value===null)store.removeItem(key);else store.setItem(key,value);}catch{/* Browsing still works without storage. */}};
const routeFor=()=>{const path=location.pathname.replace(/^\/|\/$/g,'');return path===''?'home':['investors','developers','premium','account'].includes(path)?path:'missing';};
const state={lang:safeRead(localStorage,'invest-flow-lang')==='en'?'en':'ru',route:routeFor(),kind:'all',query:'',projects:catalogueProjects,user:null,catalogError:false};
state.compareIds = catalogueProjects.filter(p => p.source).slice(0, 2).map(p => p.id);
state.compareOpen = false;
state.loginFailed = state.route === 'account' && new URLSearchParams(location.search).has('login_error');
let loginProviders = [];
let detailId=null;
let view=makeView(state);
let lastFocus=null;
const allowedReturn=new Set(['premium','developers','investors']);
const search=()=>new URLSearchParams(location.search);
function readFilters() {
  state.query=search().get('q')||'';
  const kind=search().get('type');
  state.kind=['residential','office','hotel'].includes(kind)?kind:'all';
}
function closeDialog(){
  if(dialog.open)dialog.close();
}
dialog.addEventListener('close',()=>{detailId=null;document.body.classList.remove('dialog-open');lastFocus?.focus({preventScroll:true});});
dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)closeDialog();}});
function updateCount(){
  const count=app.querySelector('.result-count');
  if(count)count.textContent=view.t('Найдено','Results')+' · '+view.filtered().length;
}
function refreshResults(){
  const el=app.querySelector('#results');
  if(!el)return;
  el.innerHTML=view.results();
  app.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===state.kind)));
  updateCount();
}
function renderLoginProviders() {
  const container = app.querySelector('.login-providers');
  if (!container) return;
  container.replaceChildren();
  for (const provider of loginProviders) {
    const name = provider === 'google' ? 'Google' : 'GitHub';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn secondary';
    button.dataset.provider = provider;
    button.textContent = view.t('Войти через ', 'Continue with ') + name;
    container.append(button);
  }
}
function rememberLoginReturn() {
  const next = search().get('next');
  safeWrite(localStorage, 'invest-flow-return', allowedReturn.has(next) ? next : null);
}
function render(){
  view=makeView(state);
  document.documentElement.lang=state.lang;
  const titles={home:view.t('Маркетплейс недвижимости','Real estate marketplace'),investors:view.t('Инвесторам','For investors'),developers:view.t('Девелоперам','For developers'),account:view.t('Аккаунт','Account'),premium:'Premium',missing:'404'};
  document.title=titles[state.route]+' · Invest Flow';
  renderChrome(state);
  app.querySelector('.skip').textContent=view.t('К содержанию','Skip to content');
  app.querySelector('#main').innerHTML=view.content();
  document.body.dataset.page=state.route;
  updateCount();
  restoreDraft();
  renderLoginProviders();
  if(detailId){const p=state.projects.find(p=>p.id===detailId);if(p)dialog.innerHTML=view.projectDetail(p);}
}
function rememberDraft(){
  const form=document.querySelector('#listing-form');
  if(form)safeWrite(sessionStorage,'invest-flow-draft',JSON.stringify(Object.fromEntries(new FormData(form))));
}
function restoreDraft(){
  const form=document.querySelector('#listing-form');
  if(!form)return;
  try{const values=JSON.parse(safeRead(sessionStorage,'invest-flow-draft')||'{}');for(const [name,value] of Object.entries(values)){const input=form.elements.namedItem(name);if(input)input.value=value;}}catch{/* Ignore an old draft. */}
}
function go(to, replace=false){
  rememberDraft();closeDialog();
  const url=new URL(to,location.origin);
  if(url.origin!==location.origin)return;
  if(replace)history.replaceState(null,'',url);else history.pushState(null,'',url);
  state.route=routeFor();readFilters();render();
  const target=document.getElementById(url.hash.slice(1));
  if(target)target.scrollIntoView({behavior:'instant'});
  else window.scrollTo({top:0,behavior:'instant'});
  (target?.querySelector('input,summary')||document.querySelector('#main')).focus({preventScroll:true});
}
function applySearch(query,kind){
  const url=new URL('/investors',location.origin);
  if(query.trim())url.searchParams.set('q',query.trim());
  if(kind!=='all')url.searchParams.set('type',kind);
  go(url);
}
function updateFilter(kind){
  state.kind=kind;
  const url=new URL(location.href);
  if(kind==='all')url.searchParams.delete('type');else url.searchParams.set('type',kind);
  history.replaceState(null,'',url);
  refreshResults();
}
async function refreshProjects(){
  try{state.projects=[...(await loadListings()),...catalogueProjects];state.catalogError=false;}
  catch{state.catalogError=true;}
  refreshResults();
}
function showMessage(el,message,error=false){
  if(!el)return;
  el.textContent=message;el.classList.toggle('error',error);
}
function humanError(error){
  if(error?.status===429||error?.code==='over_email_send_rate_limit')return view.t('Слишком много попыток. Попробуйте чуть позже.','Too many attempts. Please try again shortly.');
  return view.t('Не удалось выполнить запрос. Проверьте соединение и попробуйте снова.','The request could not be completed. Check your connection and try again.');
}
async function busy(button,feedback,action){
  if(button.disabled)return;
  button.disabled=true;showMessage(feedback,'');
  try{await action();}catch(error){showMessage(feedback,humanError(error),true);}finally{button.disabled=false;}
}
async function copyQuestions(button) {
  const section = button.closest('section');
  const project = state.projects.find(p => p.id === detailId);
  const title = project.title[state.lang] + (project.demo ? view.t(' (пример)', ' (demo)') : '');
  const questions = Array.from(section.querySelectorAll('.project-questions li'), li => '• ' + li.textContent);
  const list = [title, ...questions].join('\n');
  const status = section.querySelector('.copy-status');
  try {
    await navigator.clipboard.writeText(list);
    status.textContent = view.t('Вопросы скопированы.', 'Questions copied.');
  } catch {
    if (!section.isConnected) return;
    let field = section.querySelector('textarea');
    if (!field) {
      field = document.createElement('textarea');
      field.readOnly = true;
      field.rows = 5;
      field.setAttribute('aria-label', view.t('Вопросы для копирования', 'Questions to copy'));
      section.append(field);
    }
    field.value = list;
    field.focus();
    field.select();
    status.textContent = view.t('Скопируйте выделенный текст.', 'Copy the selected text.');
  }
}
app.addEventListener('toggle', event => {
  if (event.target.matches('.compare-panel')) state.compareOpen = event.target.open;
}, true);
app.addEventListener('change', event => {
  const select = event.target.closest('select[data-compare-index]');
  if (!select) return;
  const index = Number(select.dataset.compareIndex);
  state.compareIds[index] = select.value;
  const panel = app.querySelector('#comparison');
  panel.innerHTML = view.comparisonBody();
  panel.querySelector(`[data-compare-index="${index}"]`).focus({preventScroll:true});
});
document.addEventListener('click',async e=>{
  const link=e.target.closest('a[data-nav]');
  if(link&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey&&e.button===0){e.preventDefault();go(link.href);return;}
  const b=e.target.closest('button');if(!b)return;
  if (db && loginProviders.includes(b.dataset.provider)) {
    rememberLoginReturn();
    await busy(b, app.querySelector('.auth .feedback'), () => loginWithProvider(b.dataset.provider));
    return;
  }
  if(b.dataset.project){
    const p=state.projects.find(p=>p.id===b.dataset.project);if(!p)return;
    detailId=p.id;lastFocus=b;dialog.setAttribute('aria-labelledby','dialog-title');dialog.innerHTML=view.projectDetail(p);
    dialog.showModal();document.body.classList.add('dialog-open');return;
  }
  if(b.dataset.kind){updateFilter(b.dataset.kind);return;}
  switch(b.dataset.action){
    case 'copy-questions':await copyQuestions(b);break;
    case 'close':closeDialog();break;
    case 'language':rememberDraft();state.lang=state.lang==='ru'?'en':'ru';safeWrite(localStorage,'invest-flow-lang',state.lang);render();app.querySelector('[data-action="language"]')?.focus({preventScroll:true});break;
    case 'top':window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});break;
    case 'clear':state.query='';updateFilter('all');if(state.route==='investors')applySearch('','all');break;
    case 'retry':await refreshProjects();break;
    case 'logout':if(db)await busy(b,b.parentElement.querySelector('.feedback'),async()=>{const {error}=await db.auth.signOut({scope:'local'});if(error)throw error;state.user=null;go('/');});break;
    case 'premium':if(db&&state.user)await busy(b,b.parentElement.querySelector('.feedback'),async()=>{await requestPremium(state.user.id);b.hidden=true;showMessage(b.parentElement.querySelector('.feedback'),view.t('Ваша заявка на ранний доступ сохранена.','Your early-access request has been saved.'));});break;
  }
});
document.addEventListener('submit',async e=>{
  const form=e.target;if(!(form instanceof HTMLFormElement))return;
  e.preventDefault();const data=new FormData(form);
  if(form.id==='hero-search'||form.id==='index-search'){applySearch(String(data.get('q')||''),form.id==='hero-search'?String(data.get('type')||'all'):state.kind);return;}
  if(!db&&form.id==='listing-form'){
    const lines=[];
    for(const field of form.querySelectorAll('[name]')){
      const label=field.closest('label').childNodes[0].textContent.trim();
      const value=field instanceof HTMLSelectElement?field.selectedOptions[0].textContent:field.value.trim();
      lines.push(label+' — '+value);
    }
    const blob=new Blob([lines.join('\n\n')+'\n'],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='invest-flow-project.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
    showMessage(form.querySelector('.feedback'),view.t('Карточка подготовлена к скачиванию.','Your listing is ready to download.'));return;
  }
  if(!db)return;
  const button=form.querySelector('button[type="submit"], button.btn');const feedback=form.querySelector('.feedback');
  if(form.id==='login-form'){
    await busy(button,feedback,async()=>{
      rememberLoginReturn();
      await requestLogin(String(data.get('email')).trim());
      showMessage(feedback,view.t('Ссылка отправлена. Откройте письмо в этом браузере.','Link sent. Open the email in this browser.'));
    });
  }else if(form.id==='listing-form'){
    rememberDraft();
    if(!state.user){go('/account?next=developers');return;}
    const payload=Object.fromEntries(Array.from(data,([k,v])=>[k,String(v).trim()]));
    payload.min_rub=Number(payload.min_rub);payload.term_months=Number(payload.term_months);
    await busy(button,feedback,async()=>{await publishListing(payload,state.user.id);form.reset();safeWrite(sessionStorage,'invest-flow-draft',null);await refreshProjects();go('/investors');});
  }
});
window.addEventListener('popstate',()=>{closeDialog();state.route=routeFor();readFilters();render();});
readFilters();render();
if(db){
  if (state.route === 'account' && (search().has('code') || search().has('login_error'))) {
    db.auth.initialize().then(({error}) => {
      state.loginFailed ||= Boolean(error);
      if (state.route !== 'account') return;
      const cleaned = new URL(location.href);
      for (const key of ['code', 'login_error']) cleaned.searchParams.delete(key);
      if (cleaned.hash === '#_') cleaned.hash = '';
      history.replaceState(null, '', cleaned);
      render();
    });
  }
  getLoginProviders().then(providers => {
    loginProviders = providers;
    renderLoginProviders();
  }).catch(() => {});
  db.auth.onAuthStateChange((event,session)=>{
    const user=session?.user||null;
    const changed=state.user?.id!==user?.id;
    state.user=user;
    const next=safeRead(localStorage,'invest-flow-return');
    if(user&&state.route==='account'&&allowedReturn.has(next)){safeWrite(localStorage,'invest-flow-return',null);go('/'+next,true);}
    else if(changed){rememberDraft();render();}
  });
  refreshProjects();
}
