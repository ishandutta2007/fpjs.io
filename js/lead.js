$('#contact-form').on('submit', function (e) {
  gtag("event", "lead-submit", { event_category: "lead", event_label: "attempt" });
  e.preventDefault();
  var payload = {
    website: $('#contact-website').val(),
    email: $('#contact-email').val(),
    name: $('#contact-name').val(),
    comment: $('#contact-comment').val()
  };
  jQuery.ajax({
    url: "https://admin.fpjs.io/leads",
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(payload)
  }).catch(function (err) {
    gtag("event", "lead-submit", { event_category: "lead", event_label: "error" });
    alert("Error occurred, contact us at: support@fpjs.io");
  }).then(function (response) {
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
      setTimeout(function () {
        alert('Thanks, we received your data');
      }, 300);
    }
  });
});