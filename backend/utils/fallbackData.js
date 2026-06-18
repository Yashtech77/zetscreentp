const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

function loadJsonData(fileName, fallback) {
  try {
    const filePath = path.join(dataDir, fileName);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function normalizeSeedRoom(room) {
  return {
    ...room,
    enabled: room.enabled !== false,
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
    photos: Array.isArray(room.photos) ? room.photos : [],
  };
}

function normalizeSeedBuilding(building) {
  return {
    ...building,
    enabled: building.enabled !== false,
    amenities: Array.isArray(building.amenities) ? building.amenities : [],
    photos: Array.isArray(building.photos) ? building.photos : [],
    roomTypes: Array.isArray(building.roomTypes)
      ? building.roomTypes.map(normalizeSeedRoom)
      : [],
  };
}

function normalizeSeedLocation(location, enabledBuildingsOnly = false) {
  const buildings = Array.isArray(location.buildings) ? location.buildings : [];
  const filteredBuildings = enabledBuildingsOnly
    ? buildings.filter(building => building.enabled !== false)
    : buildings;

  return {
    id: location.id,
    name: location.name,
    slug: location.slug,
    enabled: location.enabled !== false,
    order: location.order ?? location.display_order ?? 1,
    phone: location.phone || '',
    whatsapp: location.whatsapp || '',
    mapEmbed: location.mapEmbed || location.map_embed || '',
    buildings: filteredBuildings.map(normalizeSeedBuilding),
  };
}

function loadSeedLocations({ enabledLocationsOnly = false, enabledBuildingsOnly = false } = {}) {
  const raw = loadJsonData('locations.json', []);
  const locations = Array.isArray(raw) ? raw : [];
  const filteredLocations = enabledLocationsOnly
    ? locations.filter(location => location.enabled !== false)
    : locations;

  return filteredLocations
    .map(location => normalizeSeedLocation(location, enabledBuildingsOnly))
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

module.exports = {
  loadJsonData,
  loadSeedLocations,
};
