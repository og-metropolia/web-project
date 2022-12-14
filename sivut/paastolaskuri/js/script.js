/**
 * @author Leo H / @4MBL
 */

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

  let destinationAddressCoords = await toCoords(sourceAddressPlus);
  let sourceAddressCoords = await toCoords(destinationAddressPlus);

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

/**
 * Fetches journey data from Google Maps API.
 *
 * @param {int} originLatitude
 * @param {int} originLongitude
 * @param {int} destinationLatitude
 * @param {int} destinationLongitude
 * @return {json} response data
 */
const getData = async (oLat, oLng, dLat, dLng) => {
  const MAPS_URL = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${oLat}%2C${oLng}&destinations=${dLat}%2C${dLng}&key=${API_KEY}`;
  const ENCODED_URL = encodeURIComponent(MAPS_URL);
  const QUERY_URL = toCorsSave(ENCODED_URL);
  const response = await fetch(QUERY_URL);
  const json = await response.json();
  return json;
};

/**
 * Gets journey distance from the data.
 *
 * @param {json} data from a fetch to the Google Maps API
 * @return {string} distance in meters
 */
function getDistance(data) {
  return data.rows[0].elements[0].distance.value; // returns in meters
}

/**
 * Gets journey duration from the data.
 *
 * @param {json} data from a fetch to the Google Maps API
 * @return {string} duration in seconds
 */
function getDuration(data) {
  return data.rows[0].elements[0].duration.value;
}

/**
 * Changes spaces to plusses.
 *
 * @param {string} text
 * @return {string} plusText
 */
function toPlusNotation(text) {
  return text.replaceAll(' ', '+');
}

/**
 * Calculates emissions based on distance and weight.
 *
 * @param {int} distance in meters
 * @param {int} weight in kilograms
 * @return {int} co2 emissions
 */
function calculateEmissions(distanceMeters, weightKilograms) {
  const CO2_PER_METER = 6.5 * 10 ** -8;
  return distanceMeters * CO2_PER_METER * weightKilograms;
}

/**
 * Converts an address to coordinates using Google Maps API.
 *
 * @param {string} address
 * @return {[latitude, longitude]} coordinates
 */
const toCoords = async (address) => {
  const MAPS_URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`;
  const ENCODED_URL = encodeURIComponent(MAPS_URL);
  const QUERY_URL = toCorsSave(ENCODED_URL);
  const response = await fetch(QUERY_URL);
  const json = await response.json();
  let lat = json.results[0].geometry.location.lat;
  let lng = json.results[0].geometry.location.lng;
  return [lat, lng];
};

/**
 * Validates coordinates.
 *
 * @param {int} latitude
 * @param {int} longitude
 * @return {boolean} whether inputs are coordinates
 */
function validateCoords(lat, lng) {
  const regexLat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
  const regexLng = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;
  let validLat = regexLat.test(lat);
  let validLng = regexLng.test(lng);
  return validLat && validLng;
}

/**
 * Simple meter to kilometer converter.
 *
 * @param {int} meters
 * @return {int} kilometers
 */
function toKilometers(meters) {
  return meters / 1000;
}

/**
 * Simple second to hour converter.
 *
 * @param {int} seconds
 * @return {int} hours
 */
function toHours(seconds) {
  return seconds / 3600;
}

/**
 * Changes decimal separator from a dot (.) to a comma (,).
 *
 * @param {int} number
 * @return {string} number with comma as decimal separator
 */
function toCommaSep(number) {
  return number.toString().replace('.', ',');
}

/**
 * Shows the journey info to the user.
 *
 * @param {int} distance in meters
 * @param {int} duration in seconds
 * @param {int} emissions in kg co2
 */
function showValues(distance, duration, emissions) {
  let outputHeading = document.querySelector('#output-heading');
  outputHeading.style.visibility = 'visible';

  let emissionOutputElem = document.querySelector('#emission-output');
  emissionOutputElem.innerText = `${toCommaSep(emissions.toFixed(2))} kg CO₂e`;
  emissionOutputElem.style.visibility = 'visible';

  let distanceOutputElem = document.querySelector('#distance-output');
  distanceOutputElem.innerText = `${toCommaSep(
    toKilometers(distance).toFixed(2)
  )} km`;
  distanceOutputElem.style.visibility = 'visible';

  let durationOutputElem = document.querySelector('#duration-output');
  durationOutputElem.innerHTML = `${toCommaSep(
    toHours(duration).toFixed(2)
  )} h`;
  durationOutputElem.style.visibility = 'visible';
}

/**
 * Shows journey map to the user.
 *
 * @param {int} originLatitude
 * @param {int} originLongitude
 * @param {int} destinationLatitude
 * @param {int} destinationLongitude
 */
function drawMap(originLat, originLng, destLat, destLng) {
  const mapCanvasElem = document.querySelector('#map-canvas');

  let originPoint = new google.maps.LatLng(originLat, originLng);
  let destPoint = new google.maps.LatLng(destLat, destLng),
    myOptions = {
      zoom: 7,
      center: originPoint,
    },
    map = new google.maps.Map(mapCanvasElem, myOptions),
    directionsService = new google.maps.DirectionsService(),
    directionsDisplay = new google.maps.DirectionsRenderer({
      map: map,
    });

  calculateAndDisplayRoute(
    directionsService,
    directionsDisplay,
    originPoint,
    destPoint
  );

  const headquartersCoords = { lat: 60.22385, lng: 24.75863 };
  let headquartersPosition = new google.maps.LatLng(
    headquartersCoords.lat,
    headquartersCoords.lng
  );

  let headquartersMarker = new google.maps.Marker({
    position: headquartersPosition,
    title: 'OG Logistic Services',
    label: '',
    map: map,
  });

  headquartersMarker.setIcon(
    'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
  );

  const contentString =
    '<h1 id="headquarters-marker-popup">OG Logistic Services</h1>' +
    '<p>Päätoimipaikkamme Espoon Leppävaarassa.</p>';
  const infowindow = new google.maps.InfoWindow({
    content: contentString,
    ariaLabel: 'Uluru',
  });

  headquartersMarker.addListener('click', () => {
    infowindow.open({
      anchor: headquartersMarker,
      map,
    });
  });

  headquartersMarker.setMap(map);
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

/**
 * Makes fetch URL CORS safe by using a proxy.
 *
 * @param {string} url
 * @return {string} cors safe url
 */
function toCorsSave(url) {
  // const PROXY_URL = 'https://api.allorigins.win/get?url=';
  // const PROXY_URL = 'https://cors-proxy.htmldriven.com/?url=';
  // const PROXY_URL = 'https://gobetween.oklabs.org/';
  const PROXY_URL = 'https://users.metropolia.fi/~ilkkamtk/proxy.php?url=';
  return PROXY_URL + url;
}
