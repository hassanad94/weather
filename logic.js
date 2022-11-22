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

_.weatherApi = {};

_.weatherApi.key = "46d4b7c5d34fa20f4e66d522546c5d5f";

_.weatherApi.get = function () {};

_.weatherApi.getLocation = function (city) {
  const query = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${_.weatherApi.key}`;

  $.ajax({
    url: query,
    dataType: "json",
  }).done(function (response) {
    console.log(response);
  });
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
  });

// $.ajax({

//     url: 'https://randomuser.me/api/',
//     dataType: 'json'

// }).done( function( response ){

//     response = response[ "results" ];

//     var requiredUserData = [];

//     /*Arra külön védelmet nem állítottam fel, hogy mi van ha hiányos az adat.
//     Naivan arra spekulálok, hogy az API jól müködik. Természetesen ha kell
//     nagyon szívesen vizsgálom, hogy minden a helyén van e, de gondoltam nem bonyolítom.*/

//     for( var i = 0 ; i < response.length; i++ ){

//         var currentResponse = response[ i ];

//         var usefullData = {

//             name : currentResponse.name.first + " " + currentResponse.name.last,
//             gender : currentResponse.gender,
//             age : currentResponse.dob.age,
//             email : currentResponse.email,
//             city : currentResponse.location.city,
//             country : currentResponse.location.country,
//             salt : currentResponse.login.salt,
//             password : currentResponse.login.sha256,
//             picture : currentResponse.picture.large

//         }

//         requiredUserData.push( usefullData );

//     }

//     uploadToDataBase( requiredUserData );

// });
