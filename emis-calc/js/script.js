const btn = document.querySelector('#input-button');

btn.addEventListener('click', async (event) => {
  const searchField = document.querySelector('#input-address');
  let searchInput = searchField.value;
  // console.log(searchInput);


  let addressPlus = toPlusNotation(searchInput);
  console.log(`addressPlus: ${addressPlus}`);

  let addressCoordsJson = await toCoords(addressPlus);
  console.log(`addressCoordsJson: ${addressCoordsJson}`);

  let addressCoords = getCoords(addressCoordsJson);
  console.log(`addressCoords: ${addressCoords}`);

  const hqLat = '60.235874355209376';
  const hqLng = '24.816348085940856';

  try {
    console.log(`Input coords: ${addressCoords[0]} | ${addressCoords[1]} | ${hqLat} | ${hqLng}`);
    let data = await getData(
      addressCoords[0],
      addressCoords[1],
      hqLat,
      hqLng
    );
    
    // let distance = await getDistance(data);
    // let duration = await getDuration(data);


  } catch (error) {
    console.log(error.message);
  }
});

 

const getData = async (oLat, oLng, dLat, dLng) => {
  const API_KEY = 'AIzaSyCLeW9dofrYcuHtUEYNpC2xydSTB9ud3zM';
  const MAPS_URL = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${oLat}%2C${oLng}&destinations=${dLat}%2C${dLng}&key=${API_KEY}`;
  const QUERY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(
    MAPS_URL
  )}`;
  const response = await fetch(QUERY_URL);
  const json = await response.json();
  return json;
};

function getDistance(data) {
  return JSON.parse(data.contents).rows[0].elements[0].distance.value; // returns in meters
}

function getDuration(data) {
  return JSON.parse(data.contents).rows[0].elements[0].duration.value; // returns in seconds
}

function toPlusNotation(text) {
  return text.replaceAll(' ', '+');
}

const toCoords = async (address) => {
  const API_KEY = 'AIzaSyCLeW9dofrYcuHtUEYNpC2xydSTB9ud3zM';
  const MAPS_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`;
  const QUERY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(
    MAPS_URL
  )}`;
  const response = await fetch(QUERY_URL);
  const json = await response.json();
  return json;
};

function getCoords(json) {
  // console.log(JSON.parse(json.contents));
  // console.log(JSON.parse(json.contents).results[0].geometry.bounds.northeast);

  let lat = JSON.parse(json.contents).results[0].geometry.bounds.northeast.lat;
  let lng = JSON.parse(json.contents).results[0].geometry.bounds.northeast.lng;
  console.log(`lat: ${lat}`);
  console.log(`lng: ${lng}`);

  return [
    JSON.parse(json.contents).results[0].geometry.bounds.northeast.lat,
    JSON.parse(json.contents).results[0].geometry.bounds.northeast.lng,
  ];
}


function validateCoords(lat, lon) {
  const regexLat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
  const regexLon = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;
  let validLat = regexLat.test(lat);
  let validLon = regexLon.test(lon);
  return validLat && validLon;
}


// try {
//   const outData = await getData(
//     '60.235874355209376',
//     '24.816348085940856',
//     '60.22420883178711',
//     '24.756818771362305'
//   );
//   console.log(getDistance(outData));
//   console.log(getDuration(outData));
// } catch (error) {
//   console.log(error.message);
// }
