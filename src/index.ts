import * as $ from "jquery";

$('[data-toggle=modal]').on('click', function(e){
  var source = $(e.currentTarget).data("source");
  gtag("event", "contact-click", {event_category: "contact", event_label: source});
});

$('[data-link]').on('click', function (e) {
  var selector = $(e.target).data('link');
  var el = $(selector).get(0);
  if (el && el.scrollIntoView) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth' });
  }
});