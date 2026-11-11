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
export function fromDatabase(row) {
  return {id:row.id, kind:row.kind, stage:row.stage, title:t(row.title,row.title), city:t(row.city,row.city), company:t(row.company,row.company), amount:row.min_rub, term:row.term_months, description:t(row.description,row.description), email:row.contact_email, demo:false};
}
