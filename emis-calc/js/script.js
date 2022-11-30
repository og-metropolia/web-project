let originLatitude = '60.235874355209376';
let originLongitude = '24.816348085940856';
let destinationLatitude = '60.22420883178711';
let destinationLongitude = '24.756818771362305';

const API_KEY = 'AIzaSyCLeW9dofrYcuHtUEYNpC2xydSTB9ud3zM';
const MAPS_URL = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLatitude}%2C${originLongitude}&destinations=${destinationLatitude}%2C${destinationLongitude}&key=${API_KEY}`;
const SEARCH_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(MAPS_URL)}`;

const getData = async (url) => {
  const response = await fetch(url);
  const json = await response.json();
  return json;
};

function getDistance(data) {
  // return data.contents;
  return JSON.parse(data.contents).rows[0].elements[0].distance.value; // returns in meters
}

function getDuration(data) {
  return JSON.parse(data.contents).rows[0].elements[0].duration.value; // returns in seconds
}

try {
  const outData = await getData(SEARCH_URL);
  console.log(getDistance(outData));
  console.log(getDuration(outData));
} catch (error) {
  console.log(error.message);
}