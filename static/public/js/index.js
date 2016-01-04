  function to_time(num)
  {
    if (num == 0) {
      return 12 + ":00am"
    } else if (num < 12) {
      return num + ":00am"
    } else if (num == 12) {
      return num + ":00pm"
    } else {
      var new_time = num - 12;
      return new_time + ":00pm"
    }
  }
   function to_time2(num)
  {
    if (num == 0) {
      return 12 + "AM"
    } else if (num < 12) {
      return num + "AM"
    } else if (num == 12) {
      return num + "PM"
    } else {
      var new_time = num - 12;
      return new_time + "PM"
    }
  }
  function to_day(day) {
  	if (day == "Sunday") {
  		return "SUN"
  	} else if (day == "Monday") {
  		return "MON"
  	} else if (day == "Tuesday") {
  		return "TUE"
  	} else if (day == "Wednesday") {
  		return "WED"
  	} else if (day == "Thursday") {
  		return "THUR"
  	} else if (day == "Friday") {
  		return "FRI"
  	} else if (day == "Saturday") {
  		return "SAT"
  	}
  }

function to_latlng(obj)
{
  var latlng1 = L.latLng(obj[0], obj[1])
  var latlng2 = L.latLng(obj[2], obj[3])
  return [latlng1, latlng2]
}

/*resp = httpGet("http://maps.googleapis.com/maps/api/geocode/json?address=wood+avenue+and+metropolitan+avenue,+new+york&sensor=false");
resp_json = JSON.parse(resp);
l = resp_json.results[0].geometry.location;
console.log(l.lat)
console.log(l.lng)*/
var map = L.map('map').setView([40.7127, -74.0059], 12);
function clearMap(m) {
    for(i in m._layers) {
        if(m._layers[i]._path != undefined) {
            try {
                m.removeLayer(m._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + m._layers[i]);
            }
        }
    }
}
function add_to_map(coords_raw)
{ 
  clearMap(map)
  map_id = "eugenet.ln3c806m"
  access_token = "pk.eyJ1IjoiZXVnZW5ldCIsImEiOiJKYUk4UkVnIn0.BgNR3M0vnxDKSek7gd8duA#12"
  L.tileLayer('https://{s}.tiles.mapbox.com/v4/'
        + map_id + '/{z}/{x}/{y}.png?access_token=' + access_token, {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
  }).addTo(map);
  coords = JSON.parse(coords_raw)
  console.log(typeof(coords))
  coords.forEach(function(entry) {
    var c = entry
    //var marker = L.marker([c['l11'], c['l12']]).addTo(map);
    var circle = L.polyline(to_latlng(c), {
        color: 'rgb(0,179,253)',
    }).addTo(map);
    //marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
    circle.bindPopup("Parking available.");
  })
}

  function make_request(t1, t2, day) {
  	var t1_k = to_time2(t1)
  	var t2_k = to_time2(t2)
  	var day_k = to_day(day)
  	req_obj = { start: t1_k, end: t2_k, day: day_k }
    console.log(req_obj)
  	$.ajax( {
      url: "/locations/", 
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify(req_obj),
      traditional: true}).done(
        function( data ) {
          console.log("done")
 	      coords = data
        add_to_map(coords)
	   });
  }
  function get_location(location) {
    req_obj = {location: location}
    $.ajax( {
      url: "/coord/", 
      contentType: 'application/json',
      type: 'POST',
      data: JSON.stringify(req_obj),
      traditional: true}).done(
        function( data ) {
          coords = JSON.parse(data)
          map.panTo(L.latLng(coords[0], coords[1]))
          map.setZoom(15)
     });
  }
  $(function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 24,
      values: [ 8, 17 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( to_time(ui.values[ 0 ]) + " to " + to_time(ui.values[ 1 ]) );
      }
    });
    $("#slider-range").on("slidestop", function(event, ui) {
      var min_time = $( "#slider-range" ).slider( "values", 0 )
      var max_time = $( "#slider-range" ).slider( "values", 1 )
      var day = $("#speed").val()
      make_request(min_time, max_time, day)
    });
    $( "#speed" ).selectmenu({
      change: function() {     var min_time = $( "#slider-range" ).slider( "values", 0 )
      var max_time = $( "#slider-range" ).slider( "values", 1 )
      var day = $("#speed").val()
      console.log(min_time + " " + max_time + " " + day)
      make_request(min_time, max_time, day)}
    });
    $( "#amount" ).val( to_time($( "#slider-range" ).slider( "values", 0 )) +
      " to " + to_time($( "#slider-range" ).slider( "values", 1 )) );
    var min_time = $( "#slider-range" ).slider( "values", 0 )
    var max_time = $( "#slider-range" ).slider( "values", 1 )
    var day = $("#speed").val()
    make_request(min_time, max_time, day)
  });

document.getElementById("location").addEventListener( "keydown", function( e ) {
    var keyCode = e.keyCode || e.which;
    if ( keyCode === 13 ) {
       get_location($("#location").val())
    }
}, false);
// REAL STUFF HERE
function httpGet(theUrl)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}