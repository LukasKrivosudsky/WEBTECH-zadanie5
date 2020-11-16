//initializing needed variables here, because they would be unreachable is initialzed elsewhere
var feiCoordinates = {lat: 48.151776, lng: 17.073353};
var newPlaceLatitude,newPlaceLongitude;
var directionsDisplay, directionsService;
var map;
var marker, markerDot;
function initMap() {
    // creating Map with FEI coordinates
    map = new google.maps.Map(document.getElementById("map"), {
      center: feiCoordinates,
      zoom: 18,
      mapTypeId: "roadmap",
    });
    
    // creating Streetmap with FEI coordinates
    const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano"),
        {
          position: feiCoordinates,
          pov: {
            heading: 15,
            pitch: 0,
          },
        }
    );
    map.setStreetView(panorama);   

    //creating first marker to point to FEI STU 
    marker = new google.maps.Marker({
        position: feiCoordinates,
        map: map,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          labelOrigin: new google.maps.Point(50, 32),
          size: new google.maps.Size(32,32),
          anchor: new google.maps.Point(16,32)
        },
        label: {
          text: "FEI STU",
          color: "#C70E20",
          fontWeight: "bold"
        }
    });

    // creatint dot to customize marker
    markerDot = new google.maps.Marker({
        position: feiCoordinates,
        map: map,
        icon: {
          url: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle.png",
          size: new google.maps.Size(7, 7),
          anchor: new google.maps.Point(4, 4)
        }
    });

    //pop up window for marker info
    var infowindow = new google.maps.InfoWindow({
        content:"Slovenská technická univerzita v Bratislave<br>Fakulta Elektrotechniky a Informatiky<br>48°15'17.7N<br> 17°07'33.5E"
    });
    google.maps.event.addListener(marker,'click', ()=> {
        infowindow.open(map,marker);
    });
    //initializing new display and service for next use
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();

}

function loadInput(){
    //loading input from web to variables and autocompleting its value
    const input = document.getElementById("pac-input");
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo("bounds", map);
    //setting new coordinates from web
    autocomplete.addListener("place_changed", () => {
    place = autocomplete.getPlace();
    newPlaceLatitude = place.geometry.location.lat();
    newPlaceLongitude = place.geometry.location.lng();
  });

}

function showRouteToFei(){
    //Setting map initializing the route start point and disabling existing markers
    directionsDisplay.setMap(map);
    var start;
    marker.setVisible(false);
    markerDot.setVisible(false);
    //checking if the loaded new coordinates are existing, if not default coordinates are set to my hometown
    if (newPlaceLatitude == null || newPlaceLongitude == null){
        document.getElementById('pac-input').placeholder = "Sereď";
        start = new google.maps.LatLng(48.284979, 17.733866);
    }
    else{
        start = new google.maps.LatLng(newPlaceLatitude, newPlaceLongitude);
    }
    
    //creating request for directionService
    var request = {
        origin: start,
        destination: feiCoordinates,
        //gettin travel mode needed for directionService
        travelMode: travelM()
    };
    
    //setting new route from start to fei
    directionsService.route(request, function(response, status) {
        //chcecking if there is existing route between start and fei
        if (status == 'OK') {
            directionsDisplay.setDirections(response);
            //route length calculated 
            //https://developers.google.com/maps/documentation/javascript/directions#Routes close description on each command I used
            document.getElementById("routeDistance").innerHTML = "Vzdialenost: " + response.routes[0].legs[0].distance.value/1000 + " km";
            document.getElementById("routeDistance").style.display = "block";
        } else {
            document.getElementById("routeDistance").style.display = "none";
            alert("There is no route existing: Status error: " + status);
        }
    });
    google.maps.event.addDomListener(window, "load", initMap);
}


function travelM(){
    //there are only 2 modes so checking if one of them is true and return the right one
    var tMode = document.getElementById('car');
    if(tMode.checked){
        return tMode.value;
    }
    else{
        return document.getElementById('walk').value;
    }    
}

function busStop(){
    //setting right zoom and center map where the transit stops are
    map.setZoom(15);
    map.setCenter(feiCoordinates);
    //creating new service needed to find all nearby transit stops
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({location:feiCoordinates, radius:1000, type: ['transit_station']} ,callback);
}

function callback(result){
    //creating marker for every found stop
    for(var i=0; i<result.length;i++){
        createMarker(result[i]);
    }
}

function createMarker(transitStop)
{   //creating exact marker for 1 transit stop
    var location = transitStop.geometry.location;
    new google.maps.Marker({
        position: location,
        map,
        title: "Transit location marker",
        icon: {
            url: "https://icons-for-free.com/iconfiles/png/512/public+transportation+icon-1320085755567511345.png",
            scaledSize: new google.maps.Size(25,25),  
        }
    });

}



