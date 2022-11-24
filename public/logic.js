if (typeof _ === "undefined")
  window._ = {
    body: $("body"),
    html: $("html"),
    document: $(document),
    window: $(window),
    viewport: { x: 0, y: 0 },
  };

_.scroll = {};

_.scroll.to = function (to) {
  const topOffset = $(to).last().offset().top;
  return _.window.scrollTop(topOffset);
};

Date.prototype.hunFormat = function () {
  const date = this;

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  const dateTimeFormat = new Intl.DateTimeFormat("hu-HU", options);

  return dateTimeFormat.format(date);
};

_.weatherApi = {};

_.weatherApi.requestTime = null;

_.weatherApi.requestedCity;

_.weatherApi.$ResultContainer = $(".weather .info-container");

_.weatherApi.key = "46d4b7c5d34fa20f4e66d522546c5d5f";

_.weatherApi.get = function (lon, lat) {
  const query = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${_.weatherApi.key}`;

  $.ajax({
    url: query,
    dataType: "json",
  }).done(function (response) {
    _.weatherApi.drawResult(response);
  });
};

_.weatherApi.getbyLocation = function (city) {
  const query = `https://api.openweathermap.org/geo/1.0/direct?q=${city},hu&limit=5&appid=${_.weatherApi.key}`;

  _.weatherApi.requestTime = new Date().hunFormat();

  _.weatherApi.requestedCity = city;

  _.weatherApi.resultPrototypeClone = $(".infos.prototype")
    .clone()
    .removeClass("prototype");

  _.weatherApi.$ResultContainer.find(".infos").remove();

  _.weatherApi.$ResultContainer.append(_.weatherApi.resultPrototypeClone);

  $.ajax({
    url: query,
    dataType: "json",
  }).done(function (response) {
    if (response.length === 0) {
      _.weatherApi.resultPrototypeClone.html(
        `<b><i>'${_.weatherApi.requestedCity.toUpperCase()}</i></b>' is not a correct city, please try and other one`
      );
      return false;
    }

    response = response[0];

    const { lon, lat } = response;

    _.weatherApi.get(lon, lat);
  });
};

_.weatherApi.drawResult = function (result) {
  const { lon, lat } = result.coord;

  const { temp, pressure, humidity } = result.main;

  const { icon: weatherIcon } = result.weather[0];

  const { deg: windDeg, speed: windSpeed } = result.wind;

  const rain = result.rain;

  const { all: cloudsAll } = result.clouds.all;

  //time
  _.weatherApi.resultPrototypeClone
    .find(".request-time .value")
    .html(_.weatherApi.requestTime);

  //city
  _.weatherApi.resultPrototypeClone
    .find(".city .value")
    .html(_.weatherApi.requestedCity);

  //coords
  _.weatherApi.resultPrototypeClone.find(".lat .value").html(Math.floor(lat));
  _.weatherApi.resultPrototypeClone.find(".lon .value").html(Math.floor(lon));

  //temp
  _.weatherApi.resultPrototypeClone.find(".current-temp .value").html(temp);
  _.weatherApi.resultPrototypeClone
    .find(".current-temp img")
    .attr("src", `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`);

  //pressure
  _.weatherApi.resultPrototypeClone.find(".pressure .value").html(pressure);

  //humidity
  _.weatherApi.resultPrototypeClone.find(".humidity .value").html(humidity);

  //wind
  _.weatherApi.resultPrototypeClone.find(".wind .speed.value").html(windSpeed);
  _.weatherApi.resultPrototypeClone
    .find(".wind .direction.value")
    .html(windDeg);

  //rain
  if (typeof rain !== "undefined") {
    _.weatherApi.resultPrototypeClone
      .find(".rain")
      .removeClass("hidden")
      .find("value")
      .html(rain["1h"]);
  }

  //cloud
  _.weatherApi.resultPrototypeClone.find(".cloud .value").html(cloudsAll);

  clearTimeout(_.weatherApi.remoLoadingTimeout);

  _.weatherApi.remoLoadingTimeout = setTimeout(function () {
    _.weatherApi.$ResultContainer.find(".loading").removeClass("loading");
  }, 700);
};

String.prototype.json = function () {
  try {
    return $.parseJSON(this);
  } catch (e) {
    return false;
  }
};

/*Nem saját szimplán szeretem használni.*/

String.prototype.post = function (Data, l) {
  /*

        Usage : 		Posts an Async query with the parameters object S, and fetches the file output as response

        "index.php".post({ foo : "bar" }).done( function( r ){ alert( r );

         } );

    */

  var url = this;

  try {
    if (typeof Data === "object" && typeof Data.do !== "undefined") {
      var host = url;

      var concatChar = host.indexOf("?") > -1 ? "&" : "?";

      var request = Data.do;

      url = host + concatChar + request;
    }
  } catch (exception) {
    exception;
  }

  var postData = $.ajax({
    type: "POST",
    url: url,
    data: Data,
  });

  // Live declaration kills development messages of async queries

  if (typeof _.live === "undefined") _.live = false;
  if (typeof l === "undefined") l = true;

  if (!_.live && l) {
    console.groupCollapsed("-> Sent POST data to %c" + url, "color:#82b;");
    console.log("\r\n Data sent: ", Data);
    console.groupEnd();
  }

  (function (t) {
    postData.done(function (response) {
      if (!_.live && l) {
        console.groupCollapsed(
          "%c" + t + "%c's <- Raw response",
          "color:#82b;",
          "color:#000;"
        );
        console.log(response);
        console.groupEnd();
      }

      try {
        if (!_.live && l) {
          console.groupCollapsed(
            "%c" + t + "%c's <- Compiled response",
            "color:#82b;",
            "color:#000;"
          );
          console.log(response.json());
          console.groupEnd();
        }
      } catch (exception) {
        exception;
      }
    });
  })(url);

  return postData;
};

_.document
  .on("ready", function () {})
  .on("click", "[data-scroll-to]", function () {
    const button = $(this);

    const selectedElementClassName = `.${button.attr("data-scroll-to")}`;

    _.scroll.to(selectedElementClassName);
  })
  .on("click", ".weather .form .submit", function () {
    const button = $(this);

    const searchInput = button.siblings(".search");

    const searchedCity = searchInput.val().trim();

    if (searchedCity.length <= 2) {
      return false;
    }

    _.scroll.to(".info-container");

    _.weatherApi.getbyLocation(searchedCity);
  })
  .on("keydown", ".weather .form .search", function (event) {
    const key = event.which;

    if (key !== 13) {
      return;
    }

    $(".weather .form .submit").trigger("click");
  });
