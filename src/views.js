import {buildings} from './buildings.js';
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
  const href = (path, label, cls='') => `<a href="${path}" class="${cls}" data-nav>${label}</a>`;
  const tag = text => `<span class="kicker"><i></i>${text}</span>`;
  const amount = n => n >= 1000000 && n % 100000 === 0
    ? `${new Intl.NumberFormat(lang,{maximumFractionDigits:1}).format(n/1000000)} ${t('млн ₽','M ₽')}`
    : `${new Intl.NumberFormat(lang).format(n)} ₽`;
  const term = n => `${n} ${t('мес.','mo.')}`;
  function hero() {
    return `<section class="hero scan-hero" aria-labelledby="hero-heading"><div class="hero-backdrop" aria-hidden="true"><div class="sky"></div></div>
      <div class="hero-inner"><h1 id="hero-heading">${t('Что узнать о проекте до звонка девелоперу?','What should you ask before calling a developer?')}</h1>
      <p>${t('Выберите жилой комплекс, узнайте, кому он подойдёт, и сохраните вопросы для разговора с девелопером.','Explore a residential project, see who it suits and save questions for your conversation with the developer.')}</p>
      <form class="glass-search" id="hero-search" role="search">
        <label class="glass-input">${icon('search')}<input type="search" name="q" autocomplete="off" aria-label="${t('Название проекта или город','Project name or city')}" placeholder="${t('Название проекта или город','Project name or city')}"></label>
        <div class="glass-search-actions"><fieldset><legend class="sr-only">${t('Тип проекта','Property type')}</legend>
        ${[['all',t('Все','All')],...Object.entries(kinds).map(([id,label])=>[id,label[lang]])].map(([key,label])=>`<label class="search-mode"><input type="radio" name="type" value="${key}" ${key==='all'?'checked':''}><span>${label}</span></label>`).join('')}</fieldset>
        <button class="btn primary" type="submit">${t('Найти проекты','Find projects')} ${icon('arrow')}</button></div></form>
      <div class="hero-links"><button class="hero-link" type="button" data-project="donstroy-ostrov">${t('Посмотреть разбор ЖК «Остров»','Explore the Ostrov project guide')} ${icon('arrow')}</button>
      ${href('/developers',t('Разместить свой проект','List your project')+' '+icon('arrow'),'hero-link')}</div></div></section>`;
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
  function comparisonBody() {
    const projects = state.projects.filter(p => p.source && profiles[p.id]);
    const pair = state.compareIds.map(id => projects.find(project => project.id === id));
    const selector = (project, index) => {
      const label = index === 0 ? t('Первый ЖК','First project') : t('Второй ЖК','Second project');
      return `<label>${label}<select data-compare-index="${index}">${projects.map(p =>
        `<option value="${escape(p.id)}" ${p.id === project.id ? 'selected' : ''} ${p.id === pair[1-index].id ? 'disabled' : ''}>${l(p.title)} · ${l(p.city)}</option>`
      ).join('')}</select></label>`;
    };
    const missing = t('Нет данных', 'No data');
    const selected = project => {
      const options = buildings[project.id] || [];
      return options.find(item => item.id === state.buildingIds[project.id]) || options[0];
    };
    const date = value => value ? new Intl.DateTimeFormat(lang, {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(value + 'T00:00:00Z')) : missing;
    const buildingSelector = project => {
      const options = buildings[project.id] || [];
      if (!options.length) return missing;
      const label = t('Дом по ЕИСЖС', 'Building in the housing registry');
      return `<label>${label}<select data-building-project="${escape(project.id)}" aria-label="${label} · ${l(project.title)}">${options.map(item =>
        `<option value="${item.id}" ${item === selected(project) ? 'selected' : ''}>ID ${item.id}</option>`
      ).join('')}</select></label>`;
    };
    const rows = [
      [t('Плановый ввод в эксплуатацию', 'Planned commissioning'), p => {
        const item = selected(p);
        if (!item?.quarter || !item.year) return missing;
        return t(`${item.quarter} кв. ${item.year}`, `Q${item.quarter} ${item.year}`);
      }],
      [t('Передача ключей по плану', 'Planned key handover'), p => date(selected(p)?.handover)],
      [t('Данные о доме', 'Building record'), p => {
        const item = selected(p);
        if (!item) return missing;
        return `<a href="${escape(item.source)}" target="_blank" rel="noopener noreferrer">${t('Карточка ЕИСЖС', 'Housing registry record')} · ID ${item.id} ↗</a><br>${t('Сведения от', 'Record dated')} ${date(item.published)}`;
      }],
      [t('Цена квартиры', 'Apartment price'), p => `<a href="${escape(p.source)}" target="_blank" rel="noopener noreferrer">${t('Предложения по ЖК у девелопера', 'Development-wide listings from the developer')} ↗</a>`],
      [t('Кому подойдёт','Who it suits'), p => l(profiles[p.id].audience)],
      [t('От чего зависит выгода','What determines value'), p => l(profiles[p.id].value)],
      [t('Что уточнить','What to ask'), p => `<ul>${profiles[p.id].checks.map(q => `<li>${l(q)}</li>`).join('')}</ul>`],
      [t('Первоисточник','Source'), p => `<a href="${escape(p.source)}" target="_blank" rel="noopener noreferrer">${l(p.company)} ↗</a>`]
    ];
    return `<div class="compare-selects">${pair.map(selector).join('')}</div><div class="compare-selects">${pair.map(buildingSelector).join('')}</div>${rows.map(([title, cell]) =>
      `<section class="compare-row"><h3>${title}</h3><div>${pair.map(p => `<div><strong>${l(p.title)}</strong>${cell(p)}</div>`).join('')}</div></section>`
    ).join('')}`;
  }
  function catalogue(standalone=false) {
    return `<section class="catalogue wrap" id="catalogue" aria-labelledby="catalogue-heading"><div class="catalog-head"><div>${tag(t('Для инвесторов','For investors'))}
      <${standalone?'h1':'h2'} id="catalogue-heading">${t('Каталог проектов','Project catalogue')}</${standalone?'h1':'h2'}></div>
      ${standalone?'':href('/investors',t('Все проекты','All projects')+' '+icon('arrow'),'outline-link')}</div>
      ${standalone?`<form class="index-search" id="index-search" role="search"><label>${icon('search')}<input type="search" name="q" value="${escape(state.query)}" placeholder="${t('Название проекта или город','Project name or city')}" aria-label="${t('Поиск проектов','Search projects')}"></label><button class="btn primary">${t('Найти','Search')}</button></form>`:''}
      <div class="filters" aria-label="${t('Тип проекта','Project type')}">${[['all',t('Все проекты','All projects')],...Object.entries(kinds).map(([k,v])=>[k,v[lang]])].map(([k,v])=>`<button data-kind="${k}" aria-pressed="${k===state.kind}">${v}</button>`).join('')}<span class="result-count"></span></div>
      ${standalone ? `<details class="compare-panel" ${state.compareOpen ? 'open' : ''}><summary>${t('Сравнить два жилых комплекса','Compare two residential projects')}</summary><div id="comparison">${comparisonBody()}</div></details>` : ''}
      <div id="results">${results()}</div></section>`;
  }
  function bottom() {
    const faqs=[
      [t('Какие проекты можно разместить?','Which projects can be listed?'),t('Жилые, офисные и гостиничные проекты на стадии участка, концепции или проектирования. В карточке указываются город, команда, срок проекта и минимальная сумма входа.','Residential, office and hotel projects at the land, concept or design stage. Each listing includes a city, team, term and minimum ticket.')],
      [t('Как связаться с девелопером?','How do I contact a developer?'),t('В справочной карточке нажмите «Сайт проекта». В объявлениях от девелоперов доступна кнопка «Написать девелоперу». У демонстрационных карточек нет контактного адреса.','Choose “Official project website” in a directory entry or “Email the developer” in a developer listing. Demo projects do not have a contact address.')],
      [t('Когда появится Premium?','When will Premium launch?'),t('Подписка готовится к запуску. В разделе Premium можно оставить заявку на ранний доступ.','The subscription is in development. You can request early access on the Premium page.')]
    ];
    return `<section class="wrap feature"><div class="feature-image" role="img" aria-label="${t('Фасад современного здания','Contemporary building facade')}"></div><div>${tag(t('Для девелоперов','For developers'))}<h2>${t('Представьте свой проект инвесторам','Present your project to investors')}</h2><p>${t('Расскажите о площадке, стадии и необходимом капитале. Инвесторы смогут изучить условия и связаться с вами напрямую.','Describe your site, stage and capital requirements. Investors can explore the details and contact you directly.')}</p>${href('/developers',t('Разместить проект','List a project')+' '+icon('arrow'),'btn primary')}</div></section>
      <section id="faq" class="faq wrap"><h2>${t('Частые вопросы','Frequently asked questions')}</h2><div>${faqs.map(([q,a])=>`<details><summary>${q}${icon('down')}</summary><p>${a}</p></details>`).join('')}</div></section>`;
  }
  function analysisSections(info) {
    if (!info) return '';
    return `<section class="profile-section"><h3>${t('Кому подойдёт','Who it suits')}</h3><p>${l(info.audience)}</p></section>
      <section class="profile-section"><h3>${t('От чего зависит выгода','What determines value')}</h3><p>${l(info.value)}</p></section>
      <section class="profile-section"><h3>${t('Вопросы перед решением','Questions before deciding')}</h3><ul class="project-questions">${info.checks.map(item=>`<li>${l(item)}</li>`).join('')}</ul>
      <button type="button" class="btn secondary" data-action="copy-questions">${t('Скопировать вопросы','Copy questions')}</button>
      <p class="copy-status" role="status"></p></section>`;
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
    `<p>${t('Invest Flow использует аккаунты Noxarix. При первом входе аккаунт создаётся автоматически.','Invest Flow uses Noxarix accounts. Your first sign-in creates an account.')} </p><div class="login-providers"></div><p>${t('Получить ссылку для входа по email','Get a sign-in link by email')}</p><form id="login-form">${field('email','Email','type="email" maxlength="254" autocomplete="email" placeholder="you@example.com"')}${notice()}<button class="btn primary" ${db?'':'disabled'}>${t('Получить ссылку','Send sign-in link')} ${icon('arrow')}</button><p class="feedback" role="status">${state.loginFailed?t('Вход не завершён. Попробуйте снова в том же браузере.','Sign-in was not completed. Try again in the same browser.'):''}</p></form>`}
    </div></section>`;
  }
  const pages={home:()=>hero()+catalogue()+bottom(),investors:()=>catalogue(true),developers,premium,account,missing:()=>`<section class="wrap intro-copy"><h1>404</h1>${href('/',t('На главную','Back home'),'btn primary')}</section>`};
  return {content:pages[state.route],projectDetail,comparisonBody,results,filtered,t};
}
