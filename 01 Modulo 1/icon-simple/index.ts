
function initMap(): void {
  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      zoom: 4,
      center: { lat: -33, lng: 151 },
    }
  );

  const image = "https://upload.wikimedia.org/wikipedia/commons/f/fc/Icono_Usuario.png"
  //const image = "https://www.clker.com/cliparts/U/q/x/n/U/c/location-icon-md.png"
  //const image = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
  const beachMarker = new google.maps.Marker({
    position: { lat: -33.89, lng: 151.274 },
    map,
    icon: image,
  });
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export { };
