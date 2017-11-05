// Global variable
var map;
var largeInfowindow;
// array for listing markers
var markers = [];
// Global polygon variable to ensure only one polygon is rendered.
var polygon = null;
// Used in multiple functions to have control over the number of places that show
var placeMarkers = [];

// Places to visit markers
// Normally we'd have these in a database instead.
var locations = [

    {
        title: 'Statue of Liberty',
        description: '',
        location: {
            lat: 40.689249,
            lng: -74.0445
        }
    },

    {
        title: 'Guggenheim Museum',
        description: '',
        location: {
            lat: 40.78298,
            lng: -73.958971
        }
    },

    {
        title: 'Central Park',
        description: '',
        location: {
            lat: 40.782865,
            lng: -73.965355
        }
    },

    {
        title: 'New York Public Library',
        description: '',
        location: {
            lat: 40.753182,
            lng: -73.982253
        }
    },

    {
        title: 'St. Patrick Cathedral',
        description: '',
        location: {
            lat: 40.758465,
            lng: -73.975993
        }
    }
];

function initMap() {

    // Styles Array
    var styles = [{
        elementType: 'geometry',
        stylers: [{
            color: '#242f3e'
        }]
    }, {
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#242f3e'
        }]
    }, {
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#746855'
        }]
    }, {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#d59563'
        }]
    }, {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#d59563'
        }]
    }, {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{
            color: '#263c3f'
        }]
    }, {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#6b9a76'
        }]
    }, {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{
            color: '#38414e'
        }]
    }, {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#212a37'
        }]
    }, {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#9ca5b3'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{
            color: '#746855'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#1f2835'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#f3d19c'
        }]
    }, {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{
            color: '#2f3948'
        }]
    }, {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#d59563'
        }]
    }, {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{
            color: '#17263c'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#515c6d'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#17263c'
        }]
    }];

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.748441,
            lng: -73.985664
        },
        zoom: 13,
        styles: styles,
        mapTypeControl: false
    });

    largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // Style Markers
    var defaultIcon = makeMarkerIcon('ef0846');

    // Highlighted location and mouseover
    var highlightedIcon = makeMarkerIcon('00bcd4');

    // Add marker animation
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var description = locations[i].description;

        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            description: locations[i].description,
            id: i
        });


        markers.push(marker);
        marker.addListener('click', mAnimation);
        bounds.extend(marker.position);

        marker.addListener('click', clickMarker);

        marker.addListener('mouseover', mouseOver);

        marker.addListener('mouseout', mouseOut);
    }

    function mAnimation()  {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setAnimation(null);
        }
        toggleBounce(this);
    }

    function clickMarker() {
        populateInfoWindow(this, largeInfowindow);
    }

    function mouseOver() {
        this.setIcon(highlightedIcon);
    }

    function mouseOut() {
        this.setIcon(defaultIcon);
    }

    ko.applyBindings(new ViewModel());

    map.fitBounds(bounds);
}

function populateInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {

        infowindow.setContent('');
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>' + marker.description + '</div>');
        infowindow.open(map, marker);
        
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
            marker.setAnimation(null);


        });


        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';

        $.ajax({
                url: wikiUrl,
                dataType: "jsonp"
            })
            .done(function(response) {
                var article = response[3][0];
                infowindow.setContent('<div><h3>' + marker.title + '</h3><a href="' + article + '" target="blank" style="display: block;">Click here for more information</a></div>');
                infowindow.open(map, marker);
                //make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
            })
            .fail(function() {
                alert("Error Occured..!!");
            });
    }
}

function hideMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

// Creates markers for each place found in either location search
function createMarkersForPlaces(places) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < places.length; i++) {
        var place = places[i];
        var icon = {
            url: place.icon,
            size: new google.maps.Size(35, 35),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 34),
            scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each location.
        var marker = new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location,
            id: place.id
        });

        // Create single infowindow
        var placeInfoWindow = new google.maps.InfoWindow();
        // If marker clicked, do location details
        marker.addListener('click', clickMarkers);

        placeMarkers.push(marker);
        if (place.geometry.viewport) {
            // Only geocodes have viewpoint
            bounds.union(place.geometry.viewport);
        } else {

            bounds.extend(place.geometry.location);
        }
    }

    function clickMarkers() {
        if (placeInfoWindow.marker == this) {
            console.log("This infowindow already is on this marker");
        } else {
            getPlacesDeatails(this, placeInfoWindow);
        }
    }
    map.fitBounds(bounds);

}

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

// Hides all markers outside the polygon, shows only the markers within.
function searchWithinPolygon() {
    for (var i = 0; i < markers.length; i++) {

        if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
            markers[i].setMap(map);
        } else {
            markers[i].setMap(null);
        }
    }
}

// Markers to operate within side bar
var ViewModel = function() {
    var self = this;
    self.placesList = ko.observableArray(locations);

    // Created observable to keep track of open/closed state for list view
    self.open = ko.observable(true);

    self.placesList().forEach(function(location, place) {
        location.marker = markers[place];
    });

    self.query = ko.observable('');
    self.filteredPlaces = ko.computed(function() {
        console.log(location);
        return ko.utils.arrayFilter(self.placesList(), function(location) {
            console.log(location);
            if (location.title.toLowerCase().indexOf(self.query().toLowerCase()) >= 0) {
                location.marker.setVisible(true);
                return true;
            } else {
                location.marker.setVisible(false);
                largeInfowindow.close(); // close infowindow 
                return false;
            }
        });
    }, self);
    self.marker = ko.observableArray(markers);

    self.clickMarker = function(location) {
        populateInfoWindow(location.marker, largeInfowindow);
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
        window.setTimeout(function() {
            location.marker.setAnimation(null);
        }, 1000);
    };

    // Created toggle function to change state of open observable   
    self.listToggle = function() {
        if (self.open()) {
            self.open(false);
        } else {
            self.open(true);
        }
    };
};

function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    var timeout = function() {
        marker.setAnimation(null);
        };
        setTimeout(timeout, 700);
    }  
}

// show and hide places list , resourse "https://codepen.io/g13nn/pen/eHGEF" 
$(document).ready(function() {

    $(".cross").hide();
    $(".options-box").hide();
    $(".hamburger").click(function() {
        $(".options-box").slideToggle("slow", function() {
            $(".hamburger").hide();
            $(".cross").show();
        });
    });

    $(".cross").click(function() {
        $(".options-box").slideToggle("slow", function() {
            $(".cross").hide();
            $(".hamburger").show();
        });
    });

});
// Added function to show alert box when Google Maps request fails 
function error() {
    alert("OOPS !! Map did not load");
}