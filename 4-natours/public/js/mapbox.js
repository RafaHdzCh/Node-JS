
export const DisplayMap = locations =>
{
  mapboxgl.accessToken = 'pk.eyJ1IjoicmFmYXVuaWF0IiwiYSI6ImNsdjEybnZ6aDAybTYya25zZ2R2emxncHkifQ._dK9Ir1TvEnnEFKHUi1LmQ';
  var map = new mapboxgl.Map(
  {
    container: 'map',
    style: 'mapbox://styles/rafauniat/clv14yyju017g01pkcs8i8vmw',
    //center: [-118.119960, 34.079776],
    //zoom: 6,
    //interactive: false
  });
  const newLocations = JSON.parse(document.getElementById('map').dataset.locations);
  const bounds = new mapboxgl.LngLatBounds();
  newLocations.forEach(location => {
    // Add marker
    const element = document.createElement("div");
    element.className = "marker";
    new mapboxgl.Marker({
      element,
      anchor: "bottom"
    })
    .setLngLat(location.coordinates)
    .addTo(map);
    new mapboxgl.Popup({offset: 30})
                .setLngLat(location.coordinates)
                .setHTML(`<p> Day ${location.day}: ${location.description} </p>`)
                .addTo(map);
    //Extend the map bounds
    bounds.extend(location.coordinates);
    //console.log(newLocations);
  });
  map.fitBounds(bounds,
  {
    padding:
    {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    } 
  });
}