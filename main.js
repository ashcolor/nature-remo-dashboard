const baseUrl = "https://api.nature.global/1/";
let token;

$(function () {
  setInterval("setClock()", 1000);
  token = localStorage.getItem("token");
  if (token === false) {
    $("#token-modal").modal();
  } else {
    init();
  }
  setInterval("setInfo()", 60 * 1000);
  $("#token-reload").on("click", function () {
    token = $("#token-input").val();
    localStorage.setItem("token", token);
    init();
  });
});

function init() {
  setInfo();
  setAppliances();
}

function setClock() {
  const date = new Date();
  const hour = zeroPadding(date.getHours());
  const min = zeroPadding(date.getMinutes());
  const sec = zeroPadding(date.getSeconds());
  $("#hour").html(`${hour}:${min}`);
  $("#second").html(`${sec}`);
  function zeroPadding(num) {
    return num.toString().padStart(2, "0");
  }
}

function setInfo() {
  if (token === null) return;
  $.ajax({
    url: `${baseUrl}devices`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .done(function (data) {
      console.log(data);
      sensorData = data[0];
      const hu = data[0].newest_events.hu.val;
      const te = data[0].newest_events.te.val;
      $("#humidity").html(Math.round(hu));
      $("#temparture").html(Math.round(te));
    })
    .fail(function (data) {
      console.log("error");
    });
}

function setAppliances() {
  if (token === null) return;
  $.ajax({
    url: `${baseUrl}appliances`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .done(function (data) {
      console.log(data);

      data.forEach((appliance) => {
        if (appliance.signals.length === 0) return true;
        let html = "";
        html += `<div class="col"><p>${appliance.nickname}</p>`;
        appliance.signals.forEach((signal) => {
          html += `<button type="button" data-id="${signal.id}" class="signal icon btn btn-outline-dark">${signal.name}</button>`;
        });
        html += `</div>`;
        $("#appliances").append(html);
      });
      $(".signal").on("click", function () {
        const id = $(this).data("id");
        console.log(id);
        $.ajax({
          type: "post",
          url: `${baseUrl}signals/${id}/send`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .done(function (data) {
            console.log("success");
          })
          .fail(function (data) {
            console.log("error");
          });
      });
    })
    .fail(function (data) {
      console.log("error");
    });
}
