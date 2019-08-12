import * as $ from "jquery";
import 'bootstrap/js/dist/modal';
$('#contact-form').on('submit', (e) => {
  gtag("event", "lead-submit", { event_category: "lead", event_label: "attempt" });
  e.preventDefault();
  var payload = {
    website: $('#contact-website').val(),
    email: $('#contact-email').val(),
    name: $('#contact-name').val(),
    comment: $('#contact-comment').val()
  };
  $.ajax({
    url: process.env.FPJS_LEAD_URL,
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(payload)
  }).catch(() => {
    gtag("event", "lead-submit", { event_category: "lead", event_label: "error" });
    alert("Error occurred, contact us at: support@fpjs.io");
  }).then((response: any) => {
    var $errorsDiv = $('#contact-form-errors');
    if (response.errors && response.errors.length > 0) {
      gtag("event", "lead-submit", { event_category: "lead", event_label: "validation-fail" });
      var errorsHTML = "";
      for (var i = 0; i < response.errors.length; i++) {
        errorsHTML += "<div>" + response.errors[i] + "</div>";
      }
      $errorsDiv.html(errorsHTML);
      $errorsDiv.show();
    } else {
      gtag("event", "lead-submit", { event_category: "lead", event_label: "success" });
      $errorsDiv.empty();
      $errorsDiv.hide();
      $('#contact-modal').modal('hide');
      setTimeout(() => { alert('Thanks, we received your data') }, 300);
    }
  });
});