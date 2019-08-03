mapboxgl.accessToken = 'pk.eyJ1IjoidmFsdmUxIiwiYSI6ImNqeXUwdHlnejA5YzMzaHBnN3R4OXF1czEifQ.4-Wne3WDiafdfFGLSTkFiQ';

function fpLoaded(fp) {
  fp.send({ip: 'full', callbackData: true}).then(function(res){
    var coords = {
      lng: res.ipLocation.longitude,
      lat: res.ipLocation.latitude
    };
    initMap(coords);
    var map2 = new mapboxgl.Map({
      container: 'map-container-2', // container id
      style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
      center: [-122.4726193, 37.75], // starting position [lng, lat]
      zoom: 8 // starting zoom
    });
    var map3 = new mapboxgl.Map({
      container: 'map-container-3', // container id
      style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
      center: [-122.4121193, 47.613], // starting position [lng, lat]
      zoom: 8 // starting zoom
    });
  });
}

function initMap(coords) {
  var map = new mapboxgl.Map({
    container: 'map-container', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [coords.lng, coords.lat], // starting position [lng, lat]
    zoom: 5 // starting zoom
  });
  var size = 200;

  var pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd: function () {
      var canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext('2d');
    },

    render: function () {
      var duration = 1000;
      var t = (performance.now() % duration) / duration;

      var radius = size / 2 * 0.3;
      var outerRadius = size / 2 * 0.7 * t + radius;
      var context = this.context;

      // draw outer circle
      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
      context.fill();

      // draw inner circle
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 100, 100, 1)';
      context.strokeStyle = 'white';
      context.lineWidth = 2 + 4 * (1 - t);
      context.fill();
      context.stroke();

      // update this image's data with data from the canvas
      this.data = context.getImageData(0, 0, this.width, this.height).data;

      // keep the map repainting
      map.triggerRepaint();

      // return `true` to let the map know that the image was updated
      return true;
    }
  };
  map.on('load', function () {
    map.fitBounds([
      [coords.lng - 1, coords.lat - 1],
      [coords.lng + 1, coords.lat + 1]
    ]);
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    map.addLayer({
      "id": "points",
      "type": "symbol",
      "source": {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": [{
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [coords.lng, coords.lat]
            }
          }]
        }
      },
      "layout": {
        "icon-image": "pulsing-dot"
      }
    });
  });
};