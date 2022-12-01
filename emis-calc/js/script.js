const btn = document.querySelector('#search-button');

btn.addEventListener('click', async (event) => {
  const sourceSearchField = document.querySelector('#source-address');
  const destinationSearchField = document.querySelector('#destination-address');
  const packageWeightField = document.querySelector('#package-weight');

  let sourceSearchInput = sourceSearchField.value;
  let destinationSearchInput = destinationSearchField.value;
  let packageWeightInput = packageWeightField.value;

  console.log(`packageWeightInput: ${packageWeightInput} kilograms`);
  
  let sourceAddressPlus = toPlusNotation(sourceSearchInput);
  console.log(`sourceAddressPlus: ${sourceAddressPlus}`);
  let destinationAddressPlus = toPlusNotation(destinationSearchInput);
  console.log(`destinationAddressPlus: ${destinationAddressPlus}`);

  let sourceAddressCoordsJson = await toCoords(sourceAddressPlus);
  console.log(`sourceAddressCoordsJson: ${sourceAddressCoordsJson}`);
  let destinationAddressCoordsJson = await toCoords(destinationAddressPlus);
  console.log(`destinationAddressCoordsJson: ${destinationAddressCoordsJson}`);

  let destinationAddressCoords = getCoords(destinationAddressCoordsJson);
  console.log(`destinationAddressCoords: ${destinationAddressCoords}`);
  let sourceAddressCoords = getCoords(sourceAddressCoordsJson);
  console.log(`sourceAddressCoords: ${sourceAddressCoords}`);

  try {
    console.log(
      `Input coords: ${sourceAddressCoords[0]} | ${sourceAddressCoords[1]} | ${destinationAddressCoords[0]} | ${destinationAddressCoords[1]}`
    );
    let data = await getData(
      sourceAddressCoords[0],
      sourceAddressCoords[1],
      destinationAddressCoords[0],
      destinationAddressCoords[1]
    );

    let distance = await getDistance(data);
    let duration = await getDuration(data);

    let emissions = calculateEmissions(distance, packageWeightInput);

    console.log(`distance: ${distance}`);
    console.log(`duration: ${duration}`);
    console.log(`emissions: ${emissions}`);

    showValues(distance, duration, emissions);


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

  console.log(`url to use: ${QUERY_URL}`);
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

function calculateEmissions(distanceMeters, weightKilograms) {
  const CO2_PER_METER = 6.473684210526316 * 10**(-8);
  return distanceMeters * CO2_PER_METER * weightKilograms;

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
  let lat = JSON.parse(json.contents).results[0].geometry.location.lat;
  let lng = JSON.parse(json.contents).results[0].geometry.location.lng;
  console.log(`lat: ${lat}`);
  console.log(`lng: ${lng}`);

  return [
    JSON.parse(json.contents).results[0].geometry.location.lat,
    JSON.parse(json.contents).results[0].geometry.location.lng,
  ];
}

function validateCoords(lat, lon) {
  const regexLat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
  const regexLon = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;
  let validLat = regexLat.test(lat);
  let validLon = regexLon.test(lon);
  return validLat && validLon;
}

function showValues(distance, duration, emissions) {
  const bodyElem = document.querySelector('body');

  const paraElem1 = document.createElement('p');
  const paraElem2 = document.createElement('p');
  const paraElem3 = document.createElement('p');

  paraElem1.innerHTML = `Matka pisteiden välillä: ${distance} metriä`;
  paraElem2.innerHTML = `Matkaan kuluva aika pisteiden välillä: ${duration} sekuntia`;
  paraElem3.innerHTML = `Päästöt: ${emissions} co2`;

  bodyElem.appendChild(paraElem1);
  bodyElem.appendChild(paraElem2);
  bodyElem.appendChild(paraElem3);
}