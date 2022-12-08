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
