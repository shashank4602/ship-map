import shipDataFirstHalf from './first_half.json';
import shipDataSecondHalf from './second_half.json';
const shipData = [...shipDataFirstHalf, ...shipDataSecondHalf];
const customShipFilter = (shipName, date) => {

  return ({ site_name, location_longitude, location_latitude, heading, ec_timestamp }) => {
    return site_name === shipName && new Date(ec_timestamp).toDateString() === new Date(date).toDateString();
  }
}
export const getShipNames = () => {
  const uniqueShipNames = new Set();
  shipData.forEach(({ site_name }) => {
    uniqueShipNames.add(site_name);
  })
  const shipNames = [...uniqueShipNames];
  return shipNames;
}
export const getParticularShipGeoData = (shipName, date) => {
  // to get the data of the ship based on ship Name
  const particularShipData = shipData.filter(customShipFilter(shipName, date));
  // Geo Data is a format which MapBox need to draw line
  const particularShipGeoData = {
    type: "Feature",
    properties: {
      title: shipName
    },
    geometry: {
      coordinates: [],
      type: "LineString"
    }
  
  }
  for (let i = 0; i < particularShipData.length; i++){
    const { site_name, location_longitude, location_latitude, heading, ec_timestamp } = particularShipData[i];
    particularShipGeoData.geometry.coordinates.push([location_longitude, location_latitude]);
  };
  return particularShipGeoData;

}

//TO-do - improve function working - 
export const getShipNamesPassedThroughPort = (portData) => {
  const { title, latitude: port_latitude, longitude: port_longitude } = portData;
  const uniqueShips = new Set();
  shipData.forEach(({ site_name: shipName, location_longitude, location_latitude, heading, ec_timestamp }) => {
    const latitude_diff = Math.abs(location_latitude - port_latitude);
    const longitude_diff = Math.abs(location_longitude - port_longitude);
    const precision = 2;
    if (latitude_diff <= precision && longitude_diff <= precision)
      uniqueShips.add(shipName);
  })
  return [...uniqueShips];
}



export const getLatestLocationOfShips = () => {
  const map = new Map();
  shipData.forEach(({ site_name, location_longitude, location_latitude, ec_timestamp }) => {
    if (!map.has(site_name))
      map.set(site_name, { location_latitude, location_longitude, time: Date(ec_timestamp) });
    else if (map.get(site_name).time < Date(ec_timestamp))
      map.set(site_name, { location_latitude, location_longitude, time: Date(ec_timestamp) });
  })
  const latestLocationOfShips = [];
  map.forEach((value, key) => {
    latestLocationOfShips.push({
      type: "Feature",
      properties: {
        title: key
      },
      geometry: {
        coordinates: [value.location_longitude, value.location_latitude],
        type: "Point",
      }
    })
  })
  return latestLocationOfShips;
}






// export const shipGeoJson = shipData.filter(shipFilter).map(({ site_name, location_longitude, location_latitude, heading, ec_timestamp }) => {
//   return {
//     type: "Feature",
//     properties: {
//       title: site_name,
//     },
//     geometry: {
//       coordinates: [location_longitude, location_latitude],
//       type: "Point"
//     }
//   }
// })
