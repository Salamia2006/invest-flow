export const textPair = (ru, en) => ({ru, en});
const t = textPair;
export const kinds = {
  residential: t('Жильё', 'Residential'),
  office: t('Офисы', 'Offices'),
  hotel: t('Отели', 'Hotels')
};
export const stages = {
  land: t('Участок', 'Land acquisition'),
  concept: t('Концепция', 'Concept'),
  design: t('Проектирование', 'Design')
};
export const images = {residential: '/images/river.webp', office: '/images/office.webp', hotel: '/images/forest.webp'};
export const samples = [
  {id:'river', kind:'residential', stage:'concept', title:t('Квартал «Берег»', 'Riverside Quarter'), city:t('Казань', 'Kazan'), company:t('Команда «Берег»','Riverside team'), amount:3000000, term:30,
   description:t('Жилой квартал у воды с пешеходной набережной и двором без машин. Команда прорабатывает планировку участка и общественные пространства.', 'A residential quarter by the water with a pedestrian promenade and a car-free courtyard. The team is developing the site plan and shared spaces.')},
  {id:'office', kind:'office', stage:'design', title:t('Деловой центр «Линия»', 'Linea Business Centre'), city:t('Москва', 'Moscow'), company:t('Команда «Линия»','Linea team'), amount:5000000, term:24,
   description:t('Деловой центр с гибкими офисными этажами и открытым первым этажом. На стадии проектирования уточняются инженерные решения и планировки.', 'An urban business centre with flexible office floors and an open ground floor. Engineering and layouts are being developed at the design stage.')},
  {id:'forest', kind:'hotel', stage:'land', title:t('Лесной отель «Сосны»', 'Pinewood Retreat'), city:t('Карелия', 'Karelia'), company:t('Команда «Сосны»','Pinewood team'), amount:2000000, term:18,
   description:t('Небольшой загородный отель с деревянными корпусами в сосновом лесу. Команда изучает участок, транспортную доступность и возможности подключения к сетям.', 'A small country hotel with timber buildings in a pine forest. The team is assessing the site, road access and utilities.')}
].map(p => ({...p, demo:true}));
const moscow = t('Москва', 'Moscow');
const ekaterinburg = t('Екатеринбург', 'Yekaterinburg');
const donstroy = t('Донстрой', 'Donstroy');
const brusnika = t('Брусника', 'Brusnika');

const directoryProjects = [
  {
    id: 'donstroy-ostrov', title: t('Остров', 'Ostrov'), city: moscow, company: donstroy,
    description: t('Жилые кварталы в Мнёвниковской пойме, рядом с метро «Терехово». На сайте доступны панорамы отдельных кварталов и планировки квартир.', 'Residential quarters in the Mnyovniki floodplain near Terekhovo metro. The developer provides panoramic views of individual quarters and apartment floor plans.'),
    source: 'https://donstroy.moscow/objects/ostrov/'
  },
  {
    id: 'donstroy-simvol', title: t('Символ', 'Simvol'), city: moscow, company: donstroy,
    description: t('Жилой комплекс в Лефортове с парком «Зелёная река». У девелопера можно посмотреть интерактивную карту кварталов и 3D-туры по квартирам.', 'A residential development in Lefortovo with Green River Park. The developer offers an interactive map of the quarters and virtual apartment tours.'),
    source: 'https://donstroy.moscow/objects/simvol/'
  },
  {
    id: 'donstroy-sobytie', title: t('Событие', 'Sobytie'), city: moscow, company: donstroy,
    description: t('Жилой комплекс на Мосфильмовской улице в Раменках, рядом с парком «Событие». На странице проекта есть панорамы и буклеты по очередям строительства.', 'A residential development on Mosfilmovskaya Street in Ramenki, beside Sobytie Park. The project page includes panoramic views and brochures for individual phases.'),
    source: 'https://donstroy.moscow/objects/sobytie/'
  },
  {
    id: 'brusnika-shishimskaya-gorka', title: t('Шишимская горка', 'Shishimskaya Gorka'), city: ekaterinburg, company: brusnika,
    description: t('Микрорайон на склонах Уктуса. На генплане можно найти дома, парк «Каньон» и соседский центр.', 'A residential district on the slopes of Uktus. The developer’s master plan shows the homes, Canyon Park and the neighbourhood centre.'),
    source: 'https://ekaterinburg.brusnika.ru/projects/shishimskaya-gorka/'
  },
  {
    id: 'brusnika-south', title: t('Южные кварталы', 'Yuzhnye Kvartaly'), city: ekaterinburg, company: brusnika,
    description: t('Жилые кварталы в Екатеринбурге. Девелопер публикует документы отдельно по домам: можно выбрать корпус и открыть его проектную декларацию или разрешение на строительство.', 'A residential development in Yekaterinburg. The developer groups documents by building, so visitors can find a specific building’s project declaration or construction permit.'),
    source: 'https://ekaterinburg.brusnika.ru/projects/south/'
  }
].map(project => ({...project, kind: 'residential'}));

export const catalogueProjects = [...directoryProjects, ...samples];

export function fromDatabase(row) {
  return {id:row.id, kind:row.kind, stage:row.stage, title:t(row.title,row.title), city:t(row.city,row.city), company:t(row.company,row.company), amount:row.min_rub, term:row.term_months, description:t(row.description,row.description), email:row.contact_email, demo:false};
}
