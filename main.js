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
          html += `<button type="button" data-id="${signal.id}" class="signal icon btn btn-outline-dark"><svg style="width:1em;height:1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3.55,18.54L4.96,19.95L6.76,18.16L5.34,16.74M11,22.45C11.32,22.45 13,22.45 13,22.45V19.5H11M12,5.5A6,6 0 0,0 6,11.5A6,6 0 0,0 12,17.5A6,6 0 0,0 18,11.5C18,8.18 15.31,5.5 12,5.5M20,12.5H23V10.5H20M17.24,18.16L19.04,19.95L20.45,18.54L18.66,16.74M20.45,4.46L19.04,3.05L17.24,4.84L18.66,6.26M13,0.55H11V3.5H13M4,10.5H1V12.5H4M6.76,4.84L4.96,3.05L3.55,4.46L5.34,6.26L6.76,4.84Z" />
      </svg></button>`;
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
