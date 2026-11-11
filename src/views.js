import {profiles, demoNotes} from './project-profiles.js';
import {kinds, stages, images} from './data.js';
import {db} from './backend.js';

export function escape(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
const paths = {
  trend:'<path d="M3 17l6-6 4 4 8-10m-6 0h6v6"/>',
  building:'<path d="M4 21h16M6 21V8l6-3v16M12 10h6v11M8.5 10v1m0 3v1m6-2h1m-1 3h1"/>',
  sparkle:'<path d="m12 3 2.4 6.7L21 12l-6.6 2.3L12 21l-2.4-6.7L3 12l6.6-2.3z"/>',
  user:'<circle cx="12" cy="8" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  up:'<path d="M6 18 18 6M7 6h11v11"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  check:'<path d="m5 12 4 4 10-10"/>',
  key:'<circle cx="8" cy="10" r="4"/><path d="m11 13 7 7 3-3-2-2m-3 1 2-2"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'
};
export const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;

export function makeView(state) {
  const lang = state.lang;
  const t = (ru,en) => lang === 'en' ? en : ru;
  const l = value => escape(value[lang]);
  const routes = [['investors','trend',t('Инвесторам','Investors')],['developers','building',t('Девелоперам','Developers')],['premium','sparkle','Premium']];
  const href = (path, label, cls='') => `<a href="${path}" class="${cls}" data-nav>${label}</a>`;
  const tag = text => `<span class="kicker"><i></i>${text}</span>`;
  const amount = n => n >= 1000000 && n % 100000 === 0
    ? `${new Intl.NumberFormat(lang,{maximumFractionDigits:1}).format(n/1000000)} ${t('млн ₽','M ₽')}`
    : `${new Intl.NumberFormat(lang).format(n)} ₽`;
  const term = n => `${n} ${t('мес.','mo.')}`;
  function header() {
    return `<a class="skip" href="#main">${t('К содержанию','Skip to content')}</a>
    <header class="header"><div class="header-inner">
      ${href('/','INVEST FLOW','brand')}
      <nav class="capsule nav" aria-label="${t('Главное меню','Main navigation')}">${routes.map(([path,i,label])=>`<a data-nav href="/${path}" ${state.route===path?'aria-current="page"':''}>${icon(i)}<span>${label}</span></a>`).join('')}</nav>
      <div class="capsule personal"><a data-nav class="account-link" href="/account" aria-label="${t('Аккаунт','Account')}">${icon('user')}<span>${state.user?t('Аккаунт','Account'):t('Войти','Sign in')}</span></a>
      <i></i><button data-action="language" aria-label="${t('Switch to English','Переключить на русский')}">${icon('globe')}<span>${lang.toUpperCase()}</span></button></div>
    </div></header>`;
  }
  function footer() {
    return `<footer class="footer"><div class="wrap footer-inner">${href('/','INVEST FLOW','brand')}<nav>${routes.map(([path,,label])=>href('/'+path,label)).join('')}</nav><button data-action="top">${t('Наверх','Back to top')} ↑</button></div></footer>`;
  }
  function hero() {
    return `<section class="hero"><div class="hero-photo" aria-hidden="true"></div><div class="sky" aria-hidden="true"></div>
      <div class="hero-inner">${tag(t('Маркетплейс недвижимости','Real estate marketplace'))}
      <h1>${t('Инвестиции в недвижимость','Real estate investment')}<br><em>${t('на ранней стадии','from the ground up')}</em></h1>
      <p>${t('Находите девелоперские проекты на этапе земли и концепции. Изучайте условия и выходите на связь с командой.','Discover development projects at the land and concept stages. Explore the terms and get in touch with the team.')}</p>
      <form class="hero-search" id="hero-search" role="search"><label class="search-line">${icon('search')}<input type="search" name="q" autocomplete="off" aria-label="${t('Поиск проектов','Search projects')}" placeholder="${t('Название проекта или город','Project name or city')}"></label>
      <button class="btn primary" type="submit">${t('Найти проекты','Find projects')} ${icon('arrow')}</button></form>
      ${href('/developers',t('Разместить свой проект','List your project')+' '+icon('up'),'hero-link')}
      </div></section>`;
  }
  function card(p) {
    if (p.source) {
      const photo=profiles[p.id]?.photos[0];
      return `<article class="card"><button class="card-link" data-project="${escape(p.id)}" aria-label="${t('Открыть проект','Open project')} ${l(p.title)}">
        ${photo?`<div class="card-visual"><img src="${escape(photo.url)}" alt="${l(photo.caption)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"></div>`:''}
        <div class="card-copy"><div class="card-meta">${l(kinds[p.kind])}<b>·</b>${icon('pin')} ${l(p.city)}</div>
        <h3>${l(p.title)}</h3><p class="small">${l(p.description)}</p>
        <div class="card-bottom"><div><span>${t('Девелопер','Developer')}</span><strong>${l(p.company)}</strong></div><b class="round-arrow">${icon('up')}</b></div></div>
        </button></article>`;
    }
    return `<article class="card"><button class="card-link" data-project="${escape(p.id)}" aria-label="${t('Открыть проект','Open project')} ${l(p.title)}">
      <div class="card-visual"><img src="${images[p.kind]}" alt="" loading="lazy"><span class="stage"><i></i>${l(stages[p.stage])}</span></div>
      <div class="card-copy"><div class="card-meta">${l(kinds[p.kind])}<b>·</b>${icon('pin')} ${l(p.city)} ${p.demo?`<small>${t('Пример','Demo')}</small>`:''}</div>
      <h3>${l(p.title)}</h3><div class="card-bottom"><div><span>${t('Мин. вход','Min. ticket')}</span><strong>${amount(p.amount)}</strong></div>
      <div><span>${t('Срок проекта','Project term')}</span><strong>${term(p.term)}</strong></div><b class="round-arrow">${icon('up')}</b></div></div></button></article>`;
  }
  function filtered() {
    const q=state.query.toLocaleLowerCase().trim().replace(/ё/g,'е');
    return state.projects.filter(p=>(state.kind==='all'||p.kind===state.kind)&&
      (!q||[p.title.ru,p.title.en,p.city.ru,p.city.en,p.company.ru,p.company.en,kinds[p.kind].ru,kinds[p.kind].en,stages[p.stage]?.ru,stages[p.stage]?.en].join(' ').toLocaleLowerCase().replace(/ё/g,'е').includes(q)));
  }
  function results() {
    const items=filtered();
    const warning=state.catalogError?`<p class="message" role="status">${t('Не удалось загрузить новые объявления.','Could not load new listings.')} <button class="link" data-action="retry">${t('Повторить','Retry')}</button></p>`:'';
    return warning+(items.length?`<div class="cards">${items.map(card).join('')}</div>`:`<div class="empty"><h3>${t('Проекты не найдены','No matching projects')}</h3><button data-action="clear" class="btn secondary">${t('Сбросить фильтры','Clear filters')}</button></div>`);
  }
  function catalogue(standalone=false) {
    return `<section class="catalogue wrap" id="catalogue" aria-labelledby="catalogue-heading"><div class="catalog-head"><div>${tag(t('Для инвесторов','For investors'))}
      <${standalone?'h1':'h2'} id="catalogue-heading">${t('Каталог проектов','Project catalogue')}</${standalone?'h1':'h2'}></div>
      ${standalone?'':href('/investors',t('Все проекты','All projects')+' '+icon('arrow'),'outline-link')}</div>
      ${standalone?`<form class="index-search" id="index-search" role="search"><label>${icon('search')}<input type="search" name="q" value="${escape(state.query)}" placeholder="${t('Название проекта или город','Project name or city')}" aria-label="${t('Поиск проектов','Search projects')}"></label><button class="btn primary">${t('Найти','Search')}</button></form>`:''}
      <div class="filters" aria-label="${t('Тип проекта','Project type')}">${[['all',t('Все проекты','All projects')],...Object.entries(kinds).map(([k,v])=>[k,v[lang]])].map(([k,v])=>`<button data-kind="${k}" aria-pressed="${k===state.kind}">${v}</button>`).join('')}<span class="result-count"></span></div>
      <div id="results">${results()}</div></section>`;
  }
  function bottom() {
    const faqs=[
      [t('Какие проекты можно разместить?','Which projects can be listed?'),t('Жилые, офисные и гостиничные проекты на стадии участка, концепции или проектирования. В карточке указываются город, команда, срок проекта и минимальная сумма входа.','Residential, office and hotel projects at the land, concept or design stage. Each listing includes a city, team, term and minimum ticket.')],
      [t('Как связаться с девелопером?','How do I contact a developer?'),t('В справочной карточке нажмите «Сайт проекта». В объявлениях от девелоперов доступна кнопка «Написать девелоперу». У демонстрационных карточек нет контактного адреса.','Choose “Official project website” in a directory entry or “Email the developer” in a developer listing. Demo projects do not have a contact address.')],
      [t('Когда появится Premium?','When will Premium launch?'),t('Подписка готовится к запуску. В разделе Premium можно оставить заявку на ранний доступ.','The subscription is in development. You can request early access on the Premium page.')]
    ];
    return `<section class="wrap feature"><div class="feature-image" role="img" aria-label="${t('Фасад современного здания','Contemporary building facade')}"></div><div>${tag(t('Для девелоперов','For developers'))}<h2>${t('Представьте свой проект инвесторам','Present your project to investors')}</h2><p>${t('Расскажите о площадке, стадии и необходимом капитале. Инвесторы смогут изучить условия и связаться с вами напрямую.','Describe your site, stage and capital requirements. Investors can explore the details and contact you directly.')}</p>${href('/developers',t('Разместить проект','List a project')+' '+icon('arrow'),'btn primary')}</div></section>
      <section class="faq wrap"><h2>${t('Частые вопросы','Frequently asked questions')}</h2><div>${faqs.map(([q,a])=>`<details><summary>${q}${icon('down')}</summary><p>${a}</p></details>`).join('')}</div></section>`;
  }
  function analysisSections(info) {
    if (!info) return '';
    return `<section class="profile-section"><h3>${t('Кому подойдёт','Who it suits')}</h3><p>${l(info.audience)}</p></section>
      <section class="profile-section"><h3>${t('От чего зависит выгода','What determines value')}</h3><p>${l(info.value)}</p></section>
      <section class="profile-section"><h3>${t('Вопросы перед решением','Questions before deciding')}</h3><ul>${info.checks.map(item=>`<li>${l(item)}</li>`).join('')}</ul></section>`;
  }
  function projectDetail(p) {
    const profile=profiles[p.id];
    if (profile && p.source) {
      const sourceLink=(url,label)=>`<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label} ${icon('up')}</a>`;
      const picture=(photo)=>`<figure>${sourceLink(photo.url,`<img src="${escape(photo.url)}" alt="${l(photo.caption)}" decoding="async" referrerpolicy="no-referrer">`)}<figcaption>${l(photo.caption)}</figcaption></figure>`;
      return `<article class="project-profile">
        <button class="x-button" data-action="close" aria-label="${t('Закрыть','Close')}">${icon('close')}</button>
        <div class="profile-gallery">${profile.photos.map(picture).join('')}</div>
        <div class="dialog-copy">${tag(t('Справочная карточка','Project directory'))}
        <h2 id="dialog-title">${l(p.title)}</h2>
        <p class="meta-line">${icon('pin')} ${l(p.city)} <b>·</b> ${l(p.company)}</p>
        <p>${l(p.description)}</p>
        <dl class="profile-facts">${profile.facts.map(f=>`<div><dt>${l(f.label)}</dt><dd>${l(f.value)}</dd></div>`).join('')}</dl>
        <section class="profile-section"><h3>${t('Район и архитектура','Setting and architecture')}</h3><p>${l(profile.place)}</p></section>
        ${analysisSections(profile)}
        <section class="profile-section profile-links"><h3>${t('Источники и материалы','Sources and further material')}</h3>
        ${sourceLink(p.source,t('Официальная страница проекта','Official project page'))}
        ${profile.links.map(item=>sourceLink(item.url,l(item.label))).join('')}</section></div></article>`;
    }
    return `<button class="x-button" data-action="close" aria-label="${t('Закрыть','Close')}">${icon('close')}</button>
      <img class="dialog-image" src="${images[p.kind]}" alt=""><div class="dialog-copy">${tag(p.demo?t('Демонстрационный проект','Demo project'):l(kinds[p.kind]))}
      <h2 id="dialog-title">${l(p.title)}</h2><p class="meta-line">${icon('pin')} ${l(p.city)} <b>·</b> ${l(stages[p.stage])}</p><p>${l(p.description)}</p>
      <dl class="metrics"><div><dt>${t('Мин. вход','Min. ticket')}</dt><dd>${amount(p.amount)}</dd></div><div><dt>${t('Срок проекта','Project term')}</dt><dd>${term(p.term)}</dd></div></dl>
      <p class="small">${p.demo?t('Пример карточки. Название, условия и суммы иллюстративны.','Example listing. The name, terms and amounts are illustrative.'):l(p.company)}</p>
      ${p.demo?analysisSections(demoNotes[p.id]):''}
      ${p.demo?`<button class="btn secondary" data-action="close">${t('Вернуться в каталог','Back to catalogue')}</button>`:`<a class="btn primary" href="mailto:${escape(encodeURIComponent(p.email))}">${icon('mail')} ${t('Написать девелоперу','Email the developer')}</a>`}</div>`;
  }
  const field=(name,title,attrs='type="text" minlength="2" maxlength="100"')=>`<label>${title}<input name="${name}" required ${attrs}></label>`;
  const select=(name,title,items)=>`<label>${title}<select name="${name}">${Object.entries(items).map(([key,v])=>`<option value="${key}">${l(v)}</option>`).join('')}</select></label>`;
  const notice=()=>db?'':`<p class="small config-note">${t('Регистрация и приём заявок скоро откроются.','Sign-in and submissions are coming soon.')}</p>`;
  const signIn=(back)=>href('/account?next='+back,t('Войти в аккаунт','Sign in')+' '+icon('arrow'),'btn primary');
  function developers() {
    return `<section class="wrap split-page"><div class="intro-copy">${tag(t('Девелоперам','For developers'))}<h1>${t('Разместите свой проект','List your project')}</h1><p>${t('Подготовьте краткую карточку проекта. После публикации она появится в каталоге, а инвесторы смогут написать вам напрямую.','Prepare a brief project listing. Once published, it appears in the catalogue and investors can contact you directly.')}</p><img class="side-image" src="/images/studio.webp" alt=""></div>
      <form class="panel" id="listing-form"><h2>${t('Карточка проекта','Project listing')}</h2>
      ${field('title',t('Название проекта','Project name'))}<div class="field-row">${field('city',t('Город или регион','City or region'),'maxlength="80" minlength="2"')}${field('company',t('Девелопер / компания','Developer / company'))}</div>
      <div class="field-row">${select('kind',t('Тип недвижимости','Property type'),kinds)}${select('stage',t('Стадия','Stage'),stages)}</div>
      <div class="field-row">${field('min_rub',t('Мин. вход, ₽','Min. ticket, ₽'),'type="number" min="1" max="2147483647" step="1"')}${field('term_months',t('Срок, мес.','Term, months'),'type="number" min="1" max="240" step="1"')}</div>
      <label>${t('О проекте','About the project')}<textarea name="description" minlength="20" maxlength="1800" required rows="3"></textarea></label>
      ${field('contact_email',t('Email для публикации в каталоге','Public contact email'),'type="email" maxlength="254"')}
      ${db?'':'<p class="small config-note">'+t('Каталог открыт для просмотра. Заполненную карточку можно скачать.','The catalogue is open for browsing. Download a copy of your completed listing.')+'</p>'}<button class="btn primary" type="submit">${!db?t('Скачать карточку','Download listing'):state.user?t('Опубликовать проект','Publish project'):t('Войти для публикации','Sign in to publish')} ${icon('arrow')}</button><p class="feedback" role="status"></p></form></section>`;
  }
  function premium() {
    return `<section class="wrap split-page compact-page"><div class="intro-copy">${tag(t('Подписка','Subscription'))}<h1>Invest Flow <em>Premium</em></h1><p>${t('Для инвесторов, которые регулярно сравнивают девелоперские проекты и следят за рынком.','For investors who regularly compare development projects and follow the market.')}</p></div>
      <article class="panel premium"><div class="premium-mark">${icon('sparkle')}</div><span class="status-pill">${t('Скоро','Coming soon')}</span><h2>${t('Ранний доступ','Early access')}</h2><p>${t('Мы готовим расширенные фильтры, подборки проектов и уведомления о новых предложениях.','Advanced filters, project collections and new-listing alerts are in development.')}</p>
      <p class="small">${t('Стоимость и условия появятся к запуску. Заявка бесплатна.','Pricing and terms will be available at launch. Requesting access is free.')}</p>
      ${notice()}${!db?`<button class="btn primary" disabled>${t('Приём заявок скоро','Requests open soon')}</button>`:state.user?`<button data-action="premium" class="btn primary">${t('Оставить заявку','Request access')} ${icon('arrow')}</button>`:signIn('premium')}<p class="feedback" role="status"></p></article></section>`;
  }
  function account() {
    return `<section class="account-page"><div class="panel auth"><div class="premium-mark">${icon(state.user?'user':'key')}</div><h1>${state.user?t('Ваш аккаунт','Your account'):t('Вход в аккаунт','Sign in')}</h1>
    ${state.user?`<p>${escape(state.user.email)}</p><a href="/investors" data-nav class="btn primary">${t('К проектам','Explore projects')} ${icon('arrow')}</a><button class="btn secondary" data-action="logout">${t('Выйти','Sign out')}</button>`:
    `<p>${t('Введите email. Мы отправим одноразовую ссылку для входа.','Enter your email to receive a one-time sign-in link.')}</p><form id="login-form">${field('email','Email','type="email" maxlength="254" autocomplete="email" placeholder="you@example.com"')}${notice()}<button class="btn primary" ${db?'':'disabled'}>${t('Получить ссылку','Send sign-in link')} ${icon('arrow')}</button><p class="feedback" role="status"></p></form>`}
    </div></section>`;
  }
  const pages={home:()=>hero()+catalogue()+bottom(),investors:()=>catalogue(true),developers,premium,account,missing:()=>`<section class="wrap intro-copy"><h1>404</h1>${href('/',t('На главную','Back home'),'btn primary')}</section>`};
  return {header,footer,content:pages[state.route],projectDetail,results,filtered,t};
}
