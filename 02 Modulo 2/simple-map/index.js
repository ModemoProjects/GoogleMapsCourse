let map;
async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    map = new Map(document.getElementById("map"), {
        center: { lat: 21.1230729, lng: -101.6650775 },
        zoom: 11,
    });
}
initMap();