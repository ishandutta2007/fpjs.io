export var ipLocation = (ipLocation: any) => {
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

export var browser = function (browser: any) {
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

export var bool = function (value: boolean) {
  return value ? "YES" : "NO";
}

export var formatBot = function (value: number) {
  if (value < 0.6) {
    return "NO";
  } else if (value < 0.8) {
    return "Probably";
  } else {
    return "YES"
  }
};
