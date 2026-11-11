import * as React from 'react';
import {createRoot} from 'react-dom/client';
import LiquidNavbar from './liquid-glass-navbar';
import HalftoneWordmarkFooter from './halftone-wordmark-footer';
import footer from './Footer.module.css';
import {icon} from '../views.js';

const labels = {
  ru: {
    investors:'Инвесторам', developers:'Девелоперам', premium:'Premium', main:'Главное меню', personal:'Аккаунт и язык', account:'Аккаунт', signIn:'Войти', catalog:'Каталог проектов', all:'Все проекты', types:['Жильё','Офисы','Отели'],
    list:'Разместить проект', form:'Заполнить карточку', terms:'Условия подписки', faq:'Частые вопросы', help:'Сервис', top:'Наверх', subject:'Маркетплейс недвижимости', groups:'Навигация в подвале',
    intros:['Сравните расположение, формат и условия проектов.','Подготовьте карточку для каталога Invest Flow.','Узнайте, какие возможности появятся в подписке.']
  },
  en: {
    investors:'Investors', developers:'Developers', premium:'Premium', main:'Main navigation', personal:'Account and language', account:'Account', signIn:'Sign in', catalog:'Project catalogue', all:'All projects', types:['Residential','Offices','Hotels'],
    list:'List a project', form:'Complete a listing', terms:'Subscription details', faq:'Frequently asked questions', help:'Service', top:'Back to top', subject:'Real estate marketplace', groups:'Footer navigation',
    intros:['Compare project locations, property types and terms.','Prepare a project listing for the Invest Flow catalogue.','Explore the features planned for the subscription.']
  }
};
function sections(lang) {
  const s=labels[lang];
  return [
    {key:'investors',label:s.investors,icon:'trend',title:s.catalog,links:[[s.all,'/investors'],...['residential','office','hotel'].map((key,i)=>[s.types[i],'/investors?type='+key])]},
    {key:'developers',label:s.developers,icon:'building',title:s.list,links:[[s.list,'/developers'],[s.form,'/developers#listing-form']]},
    {key:'premium',label:s.premium,icon:'sparkle',title:'Invest Flow Premium',links:[[s.terms,'/premium'],[s.faq,'/#faq']]}
  ];
}
function Icon({name}) {
  return <span className="shell-icon" aria-hidden="true" dangerouslySetInnerHTML={{__html:icon(name)}} />;
}
function Header({lang,route,hasUser,locationKey}) {
  const s=labels[lang], groups=sections(lang);
  const [panel,setPanel]=React.useState(null);
  const ref=React.useRef(null);
  const pageKey=locationKey+'|'+lang;
  const previousPage=React.useRef(pageKey);
  React.useEffect(()=>{
    if(previousPage.current===pageKey)return;
    previousPage.current=pageKey;
    setPanel(null);
  },[pageKey]);
  React.useEffect(()=>{
    if(panel===null)return;
    const outside=e=>{if(!ref.current?.contains(e.target))setPanel(null);};
    const escape=e=>{if(e.key==='Escape'){ref.current?.querySelector('[aria-controls="menu-'+panel+'"]')?.focus();setPanel(null);}};
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[panel]);
  const active=panel??(route==='home'?0:groups.findIndex(g=>g.key===route));
  return <div ref={ref} className="header-inner" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setPanel(null);}}>
    <a className="brand glass-brand" href="/" data-nav>INVEST FLOW</a>
    <div className="waterline-menu" onKeyDown={e=>{
      if(e.key!=='ArrowDown')return;
      const value=e.target.closest('button')?.getAttribute('aria-controls');
      if(!value)return;
      e.preventDefault();setPanel(Number(value.slice(5)));requestAnimationFrame(()=>document.getElementById(value)?.querySelector('a')?.focus());
    }}>
      <LiquidNavbar tone="dark" compact={false} ariaLabel={s.main} active={active}
        onChange={i=>setPanel(previous=>previous===i?null:i)}
        items={groups.map((g,i)=>({label:g.label,icon:<Icon name={g.icon}/>,fx:'glow',expanded:panel===i,controls:'menu-'+i}))}/>
      {groups.map((g,i)=><div key={g.key} id={'menu-'+i} hidden={panel!==i} className="waterline-panel">
        <div className="menu-intro"><Icon name={g.icon}/><h2>{g.title}</h2><p>{s.intros[i]}</p></div>
        <div className="menu-links">{g.links.map(([label,url])=><a key={url} href={url} data-nav onClick={()=>setPanel(null)}>{label}<Icon name="arrow"/></a>)}</div>
      </div>)}
    </div>
    <div className="capsule personal" role="group" aria-label={s.personal}>
      <a href="/account" className="account-link" data-nav aria-label={hasUser?s.account:s.signIn}><Icon name="user"/><span className="personal-text">{hasUser?s.account:s.signIn}</span></a>
      <i aria-hidden="true"/><button type="button" data-action="language" aria-label={lang==='ru'?'Switch to English':'Переключить на русский'}><Icon name="globe"/><span className="personal-text">{lang.toUpperCase()}</span></button>
    </div>
  </div>;
}
function Footer({lang}) {
  const s=labels[lang], [investors,developers]=sections(lang);
  const groups=[investors,developers,{label:s.help,links:[['Premium','/premium'],[s.account,'/account'],[s.faq,'/#faq']]}];
  return <footer className={footer.footer}>
    <div className={footer.sky} aria-hidden="true"><div className={footer.stars}/>{Array.from({length:6},(_,i)=><span key={i} className={footer.meteor}/>)}</div>
    <div className={footer.content}>
      <div className={footer.brand}><strong><a href="/" data-nav>Invest Flow</a></strong><span>© {new Date().getFullYear()} · {s.subject}</span></div>
      <nav className="footer-navigation" aria-label={s.groups}>{groups.map(g=><div key={g.label}><h2 className="footer-group-title">{g.label}</h2><ul>{g.links.map(([label,url])=><li key={url}><a className="footer-link" href={url} data-nav>{label}</a></li>)}</ul></div>)}</nav>
      <div className={footer.rule}><button className={footer.up} type="button" data-action="top">{s.top} ↑</button></div>
    </div>
    <HalftoneWordmarkFooter wordmark="invest flow"/>
  </footer>;
}
export function createChrome(headerHost,footerHost) {
  const headerRoot=createRoot(headerHost), footerRoot=createRoot(footerHost);
  const onScroll=()=>headerHost.classList.toggle('is-scrolled',window.scrollY>12);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  return state=>{
    headerRoot.render(<Header lang={state.lang} route={state.route} hasUser={Boolean(state.user)} locationKey={location.href}/>);
    footerRoot.render(<Footer lang={state.lang}/>);
  };
}
