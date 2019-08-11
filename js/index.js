var formatBrowser = function (response) {
  var out = response.browserName;
  if (response.browserVersion) {
    out += " " + response.browserVersion;
  }
  if (response.os) {
    out += " on " + response.os;
  }
  if (response.osVersion) {
    out += " (" + response.osVersion + ")";
  }
  if (response.device && response.device != "Unknown" && response.device != "Other") {
    out += (", " + response.device);
  }
  return out;
}
var formatLocation = function (response) {
  var loc = response.ipLocation;
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
var showDemo = function () {
  $('#demo-call').attr("disabled", true);
  $('#demo-call-progress').text("In progress...");
  FP.send({ callbackData: true }).then(function (response) {
    $("#demo-call").remove();
    $(".demo-visitorid").html(response.visitorId);
    $(".demo-location").html(formatLocation(response));
    $(".demo-browser").html(formatBrowser(response));
    $(".demo-card").show().get(0).scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () {
      $(".demo-hint").removeClass("invisible");
    }, 4000);
  });
}
$('[data-toggle=modal]').on('click', function(e){
  var source = $(e.currentTarget).data("source");
  gtag("event", "contact-click", {event_category: "contact", event_label: source});
});
$('#contact-modal').on('shown.bs.modal', function (e) {
  setTimeout(function () {
    $("#contact-website").focus();
  }, 300);
});
$("#demo-call").on("click", function (e) {
  gtag("event", "demo-run", {event_category: "demo"});
  showDemo();
});

$('[data-link]').on('click', function (e) {
  var selector = $(e.target).data('link');
  var el = $(selector).get(0);
  if (el && el.scrollIntoView) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth' });
  }
});