const API_KEY = 'AIzaSyCLeW9dofrYcuHtUEYNpC2xydSTB9ud3zM';

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

    drawMap(
      sourceAddressCoords[0],
      sourceAddressCoords[1],
      destinationAddressCoords[0],
      destinationAddressCoords[1]
    );

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
  const CO2_PER_METER = 6.5 * 10 ** -8;
  return distanceMeters * CO2_PER_METER * weightKilograms;
}

const toCoords = async (address) => {
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

function toKilometers(meters) {
  return meters / 1000;
}

function toHours(seconds) {
  return seconds / 3600;
}

function showValues(distance, duration, emissions) {
  const outputList = document.querySelector('#output');

  if (document.querySelector('#distance-output')) {
    const distanceOutputElem = document.querySelector('#distance-output');
    distanceOutputElem.innerHTML = `Matka: ${toKilometers(distance).toFixed(
      2
    )} km`;
    outputList.appendChild(distanceOutputElem);
  } else {
    const distanceOutputElem = document.createElement('li');
    distanceOutputElem.setAttribute('id', 'distance-output');
    distanceOutputElem.innerHTML = `Matka: ${toKilometers(distance).toFixed(
      2
    )} km`;
    outputList.appendChild(distanceOutputElem);
  }

  if (document.querySelector('#duration-output')) {
    const durationOutputElem = document.querySelector('#duration-output');
    durationOutputElem.innerHTML = `Kesto: ${toHours(duration).toFixed(2)} h`;
    outputList.appendChild(durationOutputElem);
  } else {
    const durationOutputElem = document.createElement('li');
    durationOutputElem.setAttribute('id', 'duration-output');
    durationOutputElem.innerHTML = `Kesto: ${toHours(duration).toFixed(2)} h`;
    outputList.appendChild(durationOutputElem);
  }

  if (document.querySelector('#emission-output')) {
    const emissionOutputElem = document.querySelector('#emission-output');
    emissionOutputElem.innerHTML = `Päästöt: ${emissions.toFixed(2)} kg CO₂e`;
    outputList.appendChild(emissionOutputElem);
  } else {
    const emissionOutputElem = document.createElement('li');
    emissionOutputElem.setAttribute('id', 'emission-output');
    emissionOutputElem.innerHTML = `Päästöt: ${emissions.toFixed(2)} kg CO₂e`;
    outputList.appendChild(emissionOutputElem);
  }
}

function drawMap(originLat, originLng, destLat, destLng) {
  var pointA = new google.maps.LatLng(originLat, originLng);
  var pointB = new google.maps.LatLng(destLat, destLng),
    myOptions = {
      zoom: 7,
      center: pointA,
    },
    map = new google.maps.Map(document.querySelector('#map-canvas'), myOptions),
    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService(),
    directionsDisplay = new google.maps.DirectionsRenderer({
      map: map,
    }),
    markerA = new google.maps.Marker({
      position: pointA,
      title: 'point A',
      label: 'A',
      map: map,
    }),
    markerB = new google.maps.Marker({
      position: pointB,
      title: 'point B',
      label: 'B',
      map: map,
    });

  // get route from A to B
  calculateAndDisplayRoute(
    directionsService,
    directionsDisplay,
    pointA,
    pointB
  );
}

function calculateAndDisplayRoute(
  directionsService,
  directionsDisplay,
  pointA,
  pointB
) {
  directionsService.route(
    {
      origin: pointA,
      destination: pointB,
      avoidTolls: true,
      avoidHighways: false,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    }
  );
}
