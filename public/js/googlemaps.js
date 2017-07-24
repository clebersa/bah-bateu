var map, heatmap, markers, markerCluster, accidentsPoints, infowindow;

$.ajax({url: '/bah-bateu/',
    type: 'POST',
    data: {
        _token: $('meta[name="csrf-token"]').attr('content'),
        chart: 'googlemaps'
    },
    dataType: 'JSON',
    success: function (result) {
        accidentsPoints = result;
        maxLatitude = Math.max.apply(Math, accidentsPoints.map(function (coordinate) {
            return coordinate.latitude;
        }));
        minLatitude = Math.min.apply(Math, accidentsPoints.map(function (coordinate) {
            return coordinate.latitude;
        }));
        maxLongitude = Math.max.apply(Math, accidentsPoints.map(function (coordinate) {
            return coordinate.longitude;
        }));
        minLongitude = Math.min.apply(Math, accidentsPoints.map(function (coordinate) {
            return coordinate.longitude;
        }));
        centralLatitude = (maxLatitude + minLatitude) / 2;
        centralLongitude = (maxLongitude + minLongitude) / 2;

        loadMap({lat: centralLatitude, lng: centralLongitude}, convertPoints(accidentsPoints));
        loadLayers();
        $("#heatmapRadio").prop("checked", true).change();
    }});

$("input[type=radio][name=mapInfoRadios]").change(function () {
    console.log(this.value);
    if (this.value === 'heatmap') {
        markerCluster.clearMarkers();
        heatmap.setMap(map);
    } else {
        heatmap.setMap(null);
        if (markerCluster.getMarkers().length === 0) {
            markerCluster.addMarkers(markers);
            markerCluster.redraw();
        }
    }
});
function initMap() {
    loadMap({lat: -30.033056, lng: -51.23}, []);
}

function loadMap(center) {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
}

function loadLayers() {
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: convertPoints(accidentsPoints),
        map: map,
        opacity: 0.75
    });

    markers = accidentsPoints.map(function (location, i) {
        var marker = new google.maps.Marker({
            position: {lat: location.latitude, lng: location.longitude}
        });
        marker.addListener('click', function () {
            if (typeof infowindow !== 'undefined') {
                infowindow.close();
            }
            infowindow = new google.maps.InfoWindow({
                content: generateInfoWindowContent(location.latitude, location.longitude)
            });
            infowindow.open(map, marker);
        });
        return marker;
    });

    // Add a marker clusterer to manage the markers.
    markerCluster = new MarkerClusterer(map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
}
function generateInfoWindowContent(latitude, longitude) {
    
    return 'test';
}

function convertPoints(accidents) {
    points = []
    $.each(accidents, function (index) {
        points.push({
            location: new google.maps.LatLng(
                    accidents[index].latitude,
                    accidents[index].longitude),
            weight: accidents[index].total
        });
    });
    console.log(points.length)
    return points;
}