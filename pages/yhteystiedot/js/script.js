function initMap() {
    const hqCoords = { lat: 60.2174316, lng: 24.8112144 };
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

