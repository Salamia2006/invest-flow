// Dates refer to the linked registry snapshot for each individual building.
function registryBuilding(id, slug, quarter, year, handover, published) {
  return {
    id, quarter, year, handover, published,
    source: `https://наш.дом.рф/проверка-новостроек/жк-${slug}-${id}/`
  };
}

export const buildings = {
  'donstroy-ostrov': [
    registryBuilding('54917', 'остров', 4, 2026, '2027-03-31', '2026-10-03'),
    registryBuilding('55644', 'остров', 2, 2027, '2027-09-30', '2026-10-03')
  ],
  'donstroy-simvol': [
    registryBuilding('61422', 'символ', 4, 2027, '2028-08-26', '2026-09-12'),
    registryBuilding('67067', 'символ', 2, 2029, '2029-12-31', '2026-09-30')
  ],
  'donstroy-sobytie': [
    registryBuilding('56910', 'событие', 2, 2027, '2027-10-20', '2026-09-05')
  ],
  'brusnika-shishimskaya-gorka': [
    registryBuilding('65579', 'шишимская-горка', 4, 2027, '2028-06-30', '2026-09-06')
  ],
  'brusnika-south': [
    registryBuilding('59867', 'южные-кварталы', 4, 2026, '2027-06-30', '2026-10-03')
  ]
};
