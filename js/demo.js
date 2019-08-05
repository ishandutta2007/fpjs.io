mapboxgl.accessToken = 'pk.eyJ1IjoidmFsdmUxIiwiYSI6ImNqeXUwdHlnejA5YzMzaHBnN3R4OXF1czEifQ.4-Wne3WDiafdfFGLSTkFiQ';

function Visit(response){
  this.response = response;
  this.time = response.time;
  this.incognito = response.incognito;
  this.formattedIncognito = formatBool(response.incognito);
  this.ip = response.ip;
  this.fullLocation = formatIpLocation(response.ipLocation);
  this.fullBrowser = formatBrowser(response.browserDetails);
  this.timeAgo = timeago().format(response.time);
}

var formatIpLocation = function (ipLocation) {
  var loc = ipLocation;
  var locParts = [];
  if (loc.city && loc.city.name) {
    locParts.push(loc.city.name);
  }
  if (loc.subdivisions && loc.subdivisions.length > 0) {
    for (var i = 0; i < loc.subdivisions.length; i++) {
      var sub = loc.subdivisions[i];
      if (sub && sub.name) {
        locParts.push(sub.name);
      }
    }
  }
  if (loc.country && loc.country.name) {
    locParts.push(loc.country.name);
  }
  if (loc.postalCode) {
    locParts.push(loc.postalCode);
  }
  var out = locParts.join(", ");
  if (loc.latitude && loc.longitude) {
    out += " (" + loc.latitude + ", " + loc.longitude + ")";
  }
  return out;
}
var formatBrowser = function (browser) {
  var out = browser.browserName;
  if (browser.browserVersion || browser.browserFullVersion) {
    out += " " + (browser.browserVersion || browser.browserFullVersion);
  }
  if (browser.os) {
    out += " on " + browser.os;
  }
  if (browser.osVersion) {
    out += " (" + browser.osVersion + ")";
  }
  if (browser.device && browser.device != "Unknown" && browser.device != "Other") {
    out += (", " + browser.device);
  }
  return out;
}

var formatBool = function(value) {
  return value ? "YES" : "NO";
}

function fpLoaded(fp) {
  fp.send({ ip: 'full', callbackData: true }).then(function (res) {
    initApp(res);
  });
}

function initApp(response) {
  var app = new Vue({
    el: "#demo",
    data: {
      visitorId: response.visitorId,
      response: response,
      visits: []
    },
    methods: {
      fullLocation: function () {
        return formatIpLocation(this.response.ipLocation);
      },
      fullBrowser: function () {
        return formatBrowser(this.response);
      },
      incognito: function () {
        return this.response.incognito;
      },
      fullIncognito: function () {
        return formatBool(this.response.incognito);
      },
      bot: function () {
        if (this.response.botProbability < 0.6) {
          return "NO";
        } else if (this.response.botProbability < 0.8) {
          return "Probably";
        } else {
          return "YES"
        }
      },
      ipAddress: function () {
        return this.response.ip;
      },
      deviceId: function () {
        return "Coming soon...";
      },
      showDemoHistory: function () {
        if (this.response.visitorFound) {
          return !this.response.visitorFound;
        }
        return false;
      },
      showHistory: function () {
        return this.visits.length > 0;
      }
    }
  });
  if (response.visitorFound) {
    var url = "https://v2.api.fpjs.io/visitors/" + response.visitorId + "/?token=sandbox-api-key&limit=5";
    $.getJSON(url, function (visitsResponse) {
      for(var i = 1; i < visitsResponse.visits.length; i++){
        app.visits.push(new Visit(visitsResponse.visits[i]));
      }
    });
  }
  var coords = {
    lng: response.ipLocation.longitude,
    lat: response.ipLocation.latitude
  };
  initMap(coords);
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
    // map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    // map.addLayer({
    //   "id": "points",
    //   "type": "symbol",
    //   "source": {
    //     "type": "geojson",
    //     "data": {
    //       "type": "FeatureCollection",
    //       "features": [{
    //         "type": "Feature",
    //         "geometry": {
    //           "type": "Point",
    //           "coordinates": [coords.lng, coords.lat]
    //         }
    //       }]
    //     }
    //   },
    //   "layout": {
    //     "icon-image": "pulsing-dot"
    //   }
    // });
  });
};