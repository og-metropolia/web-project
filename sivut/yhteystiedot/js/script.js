/**
 * @author Leo H / @4MBL
 */

/* Initializes map of our headquaters. */
function initMap() {
  const hqCoords = { lat: 60.22385, lng: 24.75863 };
  const map = new google.maps.Map(document.querySelector('#map'), {
    zoom: 12,
    center: hqCoords,
  });

  new google.maps.Marker({
    position: hqCoords,
    map,
    title: 'Toimipaikkamme',
  });
}

window.initMap = initMap;

/* Shows a message when user sends contact request. */
window.onload = function () {
  const submitButton = document.querySelector('#submit-button');

  submitButton.addEventListener('click', (event) => {
    alert('Kiitos yhteydenotostasi!');
    console.log('test');
  });
};
