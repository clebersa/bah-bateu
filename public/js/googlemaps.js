var map, heatmap;

$.ajax({url: '/bah-bateu/',
    type: 'POST',
    data: {
        _token: $('meta[name="csrf-token"]').attr('content'),
        chart: 'googlemaps'
    },
    dataType: 'JSON',
    success: function (result) {
        maxLatitude = Math.max.apply(Math, result.map(function (coordinate) {
            return coordinate.latitude;
        }));
        minLatitude = Math.min.apply(Math, result.map(function (coordinate) {
            return coordinate.latitude;
        }));
        maxLongitude = Math.max.apply(Math, result.map(function (coordinate) {
            return coordinate.longitude;
        }));
        minLongitude = Math.min.apply(Math, result.map(function (coordinate) {
            return coordinate.longitude;
        }));
        centralLatitude = (maxLatitude + minLatitude) / 2;
        centralLongitude = (maxLongitude + minLongitude) / 2;

        loadMap({lat: centralLatitude, lng: centralLongitude}, convertPoints(result));
    }});

function initMap() {
    loadMap({lat: -30.033056, lng: -51.23}, []);
}

function loadMap(center, points) {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    if (points.length !== 0) {
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: points,
            map: map,
            opacity: 0.75
        });
    }
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