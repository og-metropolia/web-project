const API_KEY = 'AIzaSyCLeW9dofrYcuHtUEYNpC2xydSTB9ud3zM';

const btn = document.querySelector('#search-button');

btn.addEventListener('click', async (event) => {
  const sourceSearchField = document.querySelector('#source-address');
  const destinationSearchField = document.querySelector('#destination-address');
  const packageWeightField = document.querySelector('#package-weight');

  let sourceSearchInput = sourceSearchField.value;
  let destinationSearchInput = destinationSearchField.value;
  let packageWeightInput = packageWeightField.value;

  let sourceAddressPlus = toPlusNotation(sourceSearchInput);
  let destinationAddressPlus = toPlusNotation(destinationSearchInput);

  let sourceAddressCoordsJson = await toCoords(sourceAddressPlus);
  let destinationAddressCoordsJson = await toCoords(destinationAddressPlus);

  let destinationAddressCoords = getCoords(destinationAddressCoordsJson);
  let sourceAddressCoords = getCoords(sourceAddressCoordsJson);

  try {
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

    showValues(distance, duration, emissions);
  } catch (error) {
    console.log(error.message);
  }
});

const getData = async (oLat, oLng, dLat, dLng) => {
  const MAPS_URL = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${oLat}%2C${oLng}&destinations=${dLat}%2C${dLng}&key=${API_KEY}`;
  const ENCODED_URL = encodeURIComponent(MAPS_URL);
  const QUERY_URL = toCorsSave(ENCODED_URL);
  const response = await fetch(QUERY_URL);
  const json = await response.json();
  return json;
};

function getDistance(data) {
  return data.rows[0].elements[0].distance.value; // returns in meters
}

function getDuration(data) {
  return data.rows[0].elements[0].duration.value; // returns in seconds
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
  const ENCODED_URL = encodeURIComponent(MAPS_URL);
  const QUERY_URL = toCorsSave(ENCODED_URL);
  const response = await fetch(QUERY_URL);
  const json = await response.json();
  return json;
};

function getCoords(json) {
  let lat = json.results[0].geometry.location.lat;
  let lng = json.results[0].geometry.location.lng;
  return [lat, lng];
}

function validateCoords(lat, lng) {
  const regexLat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
  const regexLng = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;
  let validLat = regexLat.test(lat);
  let validLng = regexLng.test(lng);
  return validLat && validLng;
}

function toKilometers(meters) {
  return meters / 1000;
}

function toHours(seconds) {
  return seconds / 3600;
}

function toCommaSep(number) {
  return number.toString().replace('.', ',');
}

function showValues(distance, duration, emissions) {
  const parentElem = document.querySelector('#input-output');

  let outputHeading;
  document.querySelector('#output-heading')
    ? (outputHeading = document.querySelector('#output-heading'))
    : (outputHeading = document.createElement('p'));
  outputHeading.setAttribute('id', 'output-heading');
  outputHeading.innerHTML = `Kuljetuksen tiedot`;
  parentElem.appendChild(outputHeading);

  let emissionOutputElem;
  document.querySelector('#emission-output')
    ? (emissionOutputElem = document.querySelector('#emission-output'))
    : (emissionOutputElem = document.createElement('p'));
  emissionOutputElem.setAttribute('id', 'emission-output');
  emissionOutputElem.innerHTML = `${toCommaSep(emissions.toFixed(2))} kg CO₂e`;
  parentElem.appendChild(emissionOutputElem);

  let distanceOutputElem;
  document.querySelector('#distance-output')
    ? (distanceOutputElem = document.querySelector('#distance-output'))
    : (distanceOutputElem = document.createElement('p'));
  distanceOutputElem.setAttribute('id', 'distance-output');
  distanceOutputElem.innerHTML = `${toCommaSep(
    toKilometers(distance).toFixed(2)
  )} km`;
  parentElem.appendChild(distanceOutputElem);

  let durationOutputElem;
  document.querySelector('#duration-output')
    ? (durationOutputElem = document.querySelector('#duration-output'))
    : (durationOutputElem = document.createElement('p'));
  durationOutputElem.setAttribute('id', 'duration-output');
  durationOutputElem.innerHTML = `${toCommaSep(
    toHours(duration).toFixed(2)
  )} h`;
  parentElem.appendChild(durationOutputElem);

  // parentElem.style.visibility = 'visible';
}

function drawMap(originLat, originLng, destLat, destLng) {
  const mapCanvasElem = document.querySelector('#map-canvas');

  var originPoint = new google.maps.LatLng(originLat, originLng);
  var destPoint = new google.maps.LatLng(destLat, destLng),
    myOptions = {
      zoom: 7,
      center: originPoint,
    },
    map = new google.maps.Map(mapCanvasElem, myOptions),
    directionsService = new google.maps.DirectionsService(),
    directionsDisplay = new google.maps.DirectionsRenderer({
      map: map,
    }),
    markerA = new google.maps.Marker({
      position: originPoint,
      title: 'lähtöpaikka',
      label: 'A',
      map: map,
    }),
    markerB = new google.maps.Marker({
      position: destPoint,
      title: 'päämäärä',
      label: 'B',
      map: map,
    });

  calculateAndDisplayRoute(
    directionsService,
    directionsDisplay,
    originPoint,
    destPoint
  );
}

function calculateAndDisplayRoute(
  directionsService,
  directionsDisplay,
  originPoint,
  destPoint
) {
  directionsService.route(
    {
      origin: originPoint,
      destination: destPoint,
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

function toCorsSave(url) {
  // const PROXY_URL = 'https://api.allorigins.win/get?url=';
  // const PROXY_URL = 'https://cors-proxy.htmldriven.com/?url=';
  // const PROXY_URL = 'https://gobetween.oklabs.org/';
  const PROXY_URL = 'https://users.metropolia.fi/~ilkkamtk/proxy.php?url=';
  return PROXY_URL + url;
}
