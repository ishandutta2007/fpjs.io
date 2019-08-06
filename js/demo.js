mapboxgl.accessToken = 'pk.eyJ1IjoidmFsdmUxIiwiYSI6ImNqeXUwdHlnejA5YzMzaHBnN3R4OXF1czEifQ.4-Wne3WDiafdfFGLSTkFiQ';


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

var formatBool = function (value) {
  return value ? "YES" : "NO";
}
var formatBot = function (value) {
  if (value < 0.6) {
    return "NO";
  } else if (value < 0.8) {
    return "Probably";
  } else {
    return "YES"
  }
};

function Visit(index, response) {
  this.index = index;
  this.visitorId = response.visitorId;
  this.incognito = response.incognito;
  this.formattedIncognito = formatBool(response.incognito);
  this.formattedBot = formatBool(response.botProbability);
  this.ip = response.ip;
  this.formattedLocation = formatIpLocation(response.ipLocation);
  this.formattedBrowser = formatBrowser(response.browserDetails || response);
  var pageViewTime = new Date(response.time);
  this.formattedTimeAgo = timeago().format(response.time) + ", " +
    pageViewTime.toLocaleString();
  this.visitorFound = response.visitorFound;
  this.deviceId = "Coming soon...";
  this.lng = response.ipLocation.longitude;
  this.lat = response.ipLocation.latitude;
  // UI variables
  this.collapsed = true;
  this.mapInitialized = false;
  this.mapContainerId = "map-container-" + index;
}

Visit.prototype = {
  onArrowClick: function () {
    this.collapsed = !this.collapsed;
    if (!this.mapInitialized) {
      var visit = this;
      setTimeout(function(){
        visit.initMap();
      }, 100);
    }
  },
  initMap: function () {
    var styleId = this.incognito ? 'dark-v10' : 'streets-v11';
    var map = new mapboxgl.Map({
      container: this.mapContainerId,
      style: 'mapbox://styles/mapbox/' + styleId,
      center: [this.lng, this.lat], // starting position [lng, lat]
      zoom: 5 // starting zoom
    });
    this.mapInitialized = true;
  }
}

function fpLoaded(fp) {
  fp.send({ ip: 'full', callbackData: true }).then(function (res) {
    initApp(res);
  });
}

function initApp(response) {
  var visit = new Visit(0, response);
  var app = new Vue({
    el: "#demo",
    data: {
      currentVisit: visit,
      visits: []
    },
    methods: {
      showHistory: function () {
        return this.visits.length > 0;
      }
    }
  });
  if (response.visitorFound) {
    var url = "https://v2.api.fpjs.io/visitors/" + response.visitorId + "/?token=sandbox-api-key&limit=6";
    $.getJSON(url, function (visitsResponse) {
      for (var i = 1; i < visitsResponse.visits.length; i++) {
        app.visits.push(new Visit(i, visitsResponse.visits[i]));
      }
    });
  }
  initMap(visit);
}

function initMap(visit) {
  var styleId = visit.incognito ? 'dark-v10' : 'streets-v11';
  var map = new mapboxgl.Map({
    container: 'current-visit-map-container', 
    style: 'mapbox://styles/mapbox/' + styleId,
    center: [visit.lng, visit.lat], 
    zoom: 3 // smaller is wider
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
      [visit.lng - 1, visit.lat - 1],
      [visit.lng + 1, visit.lat + 1]
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