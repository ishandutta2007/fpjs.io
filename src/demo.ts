/*!
  * fpjs.io demo.js
  * Copyright 2019 https://fpjs.io
  */
import * as $ from "jquery";
import Vue from "vue";
import * as mapboxgl from "mapbox-gl";
import * as format from "./format";
import { ago } from "./timeago";
import './lead-form';

export function fpLoaded(fp: any) {
  fp.send({ ip: 'full', callbackData: true }).then(function (res: any) {
    initApp(res);
  });
}


// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/23467
(mapboxgl as any).accessToken = process.env.MAPBOX_ACCESS_TOKEN;

class Visit {
  private readonly index: number;
  private readonly response: any;
  private readonly visitorId: string;
  private readonly botProbability: number;
  private readonly ip: string;
  private readonly ipLocation: any;
  private readonly browserDetails: any;
  private readonly time: Date;
  private readonly visitorFound: boolean;

  public readonly incognito: boolean;
  public readonly lng: number;
  public readonly lat: number;

  // UI variables
  public readonly mapContainerId: string;
  public collapsed = true;
  public mapInitialized = false;

  constructor(index: number, response: any) {
    this.index = index;
    this.response = response;
    this.visitorId = response.visitorId;
    this.incognito = response.incognito;
    this.botProbability = response.botProbability;
    this.ip = response.ip;
    this.ipLocation = response.ipLocation;
    this.lng = this.ipLocation.longitude;
    this.lat = this.ipLocation.latitude;
    this.browserDetails = response.browserDetails;
    this.time = new Date(response.time);
    this.visitorFound = response.visitorFound;
    // UI variables
    this.mapContainerId = "map-container-" + index;
  }

  formattedIncognito() {
    return format.bool(this.incognito);
  }

  formattedBot() {
    return format.bot(this.botProbability);
  }

  formattedLocation() {
    return format.ipLocation(this.ipLocation);
  }

  formattedBrowser() {
    return format.browser(this.browserDetails || this.response);
  }

  formattedTimeAgo() {
    return ago(this.time) + ", " + this.time.toLocaleString();
  }

  formattedDeviceId() {
    return "Coming soon...";
  }
  onArrowClick() {
    this.collapsed = !this.collapsed;
    if (!this.mapInitialized) {
      var visit = this;
      setTimeout(function () {
        visit.initMap();
      }, 100);
    }
  }
  initMap() {
    var styleId = this.incognito ? 'dark-v10' : 'streets-v11';
    var map = new mapboxgl.Map({
      container: this.mapContainerId,
      style: 'mapbox://styles/mapbox/' + styleId,
      center: [this.lng, this.lat], // starting position [lng, lat]
      zoom: 5 // starting zoom
    });
    var markerImg = document.createElement("img");
    markerImg.src = "img/reddot.svg";
    markerImg.width = 20;
    markerImg.height = 20;
    new mapboxgl.Marker(markerImg).setLngLat([this.lng, this.lat]).addTo(map);
    this.mapInitialized = true;
  }
}

function initApp(response: any) {
  var currentVisit = new Visit(0, response);
  var app = new Vue({
    el: "#demo",
    data: {
      currentVisit: currentVisit,
      visits: [] as Visit[]
    },
    methods: {
      showHistory: function () {
        return this.visits.length > 0;
      },
      refresh: function () {
        location.reload();
      }
    }
  });
  if (response.visitorFound) {
    var url = "https://v2.api.fpjs.io/visitors/";
    url += response.visitorId;
    url += "/?token=" + process.env.FPJS_API_TOKEN;
    url += "&limit=6";
    $.getJSON(url, function (visitsResponse) {
      for (var i = 1; i < visitsResponse.visits.length; i++) {
        var visit = new Visit(i, visitsResponse.visits[i]);
        app.visits.push(visit);
      }
    });
  }
  initCurrentVisitMap(currentVisit);
}

function initCurrentVisitMap(visit: Visit) {
  var styleId = visit.incognito ? 'dark-v10' : 'streets-v11';
  var map = new mapboxgl.Map({
    container: 'current-visit-map-container',
    style: 'mapbox://styles/mapbox/' + styleId,
    center: [visit.lng, visit.lat],
    zoom: 3 // smaller is wider
  });
  var size = 150;

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
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    map.addLayer({
      id: "points",
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [visit.lng, visit.lat]
            }
          }]
        }
      },
      layout: {
        "icon-image": "pulsing-dot"
      }
    });
  });
};