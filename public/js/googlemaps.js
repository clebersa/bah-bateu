var map, heatmap, markers, markerCluster, accidentsPoints, infoWindow, accidentsInfo;

var accidentInfoBoxDefaultTitle = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
var accidentInfoBoxDefaultBody = "<br/><br/><br/>";
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
    console.log("loading map");
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
    var infoWindowBaseContent = '<div class="box box-solid no-margin">'
            + '<div class="box-header">'
            + '  <h3 class="box-title" id="accidentsInfoBoxTitle">' + accidentInfoBoxDefaultTitle + '</h3>'
            + '</div>'
            + '<div class="box-body no-padding" id="accidentsInfoBoxBody">' + accidentInfoBoxDefaultBody + '</div>'
            + '<div class="overlay" id="accidentsInfoBoxOverlay">'
            + '  <i class="fa fa-refresh fa-spin"></i>'
            + '</div>';
    infoWindow = new google.maps.InfoWindow({
        content: infoWindowBaseContent
    });
    markers = accidentsPoints.map(function (location, i) {
        var marker = new google.maps.Marker({
            position: {lat: location.latitude, lng: location.longitude},
            label: String(location.total)
        });
        marker.addListener('click', function () {
            if (typeof infoWindow !== 'undefined') {
                infoWindow.close();
            }
            infoWindow.open(map, marker);
            retrieveInfoWindowContent(location.latitude, location.longitude)
        });
        return marker;
    });
    // Add a marker clusterer to manage the markers.
    markerCluster = new MarkerClusterer(map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
}
function retrieveInfoWindowContent(latitude, longitude) {
    $("#accidentsInfoBoxOverlay").removeClass('hidden');
    $("#accidentsInfoBoxTitle").html(accidentInfoBoxDefaultTitle);
    $("#accidentsInfoBoxBody").html(accidentInfoBoxDefaultBody);
    $.ajax({url: '/bah-bateu/',
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            chart: 'infowindow',
            latitude: latitude,
            longitude: longitude
        },
        dataType: 'JSON',
        success: function (result) {
            accidentsInfo = result;
            var accidentInfoBoxTitle = "";
            var dateOptions = {
                year: "2-digit", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit"
            };
            if (accidentsInfo.length > 1) {
                accidentInfoBoxTitle += '<div class="form-group no-margin form-inline">'
                        + 'Accident: <select class="form-control" onchange="updateAccidentDetailsBox($(this).find(\':selected\').val())">';
                $.each(accidentsInfo, function (index, accidentInfo) {
                    accidentInfoBoxTitle += '<option value="' + index + '">#' + (index + 1) + ' - ' + (new Date(accidentInfo.moment)
                            .toLocaleTimeString("en-us", dateOptions)) + '</option>';
                });
                accidentInfoBoxTitle += '</select></div>';
            } else if (accidentsInfo.length === 1) {
                accidentInfoBoxTitle = "Accident Details";
            }
            $("#accidentsInfoBoxTitle").html(accidentInfoBoxTitle);
            updateAccidentDetailsBox(0);
            $("#accidentsInfoBoxOverlay").addClass('hidden');
        }});
}

function updateAccidentDetailsBox(index) {
    var accidentInfo = accidentsInfo[index];

    var dateOptions = {
        weekday: "long", year: "numeric", month: "long", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
    };

    var content =
            '<table class="table">'
            + '<tr>'
            + '  <th>ID: ' + accidentInfo.id + '</th>'
            + '  <td><b>Report:</b> ' + (((accidentInfo.report_id.trim()) === "") ? "-" : accidentInfo.report_id) + '</td>'
            + '</tr>'
            + '<tr>'
            + '  <td colspan="2"><b>Moment:</b> ' + (new Date(accidentInfo.moment)
                    .toLocaleTimeString("en-us", dateOptions)) + '</td>'
            + '</tr>'
            + '<tr>'
            + '  <td colspan="2"><b>Place:</b> ' + accidentInfo.location + '</td>'
            + '</tr>';

    if (accidentInfo.consortium !== null) {
        content += '<tr>'
                + '  <td colspan="2"><b>Consortium:</b> ' + accidentInfo.consortium + '</td>'
                + '</tr>'
                + '</table>';
    }

    $("#accidentsInfoBoxBody").html(content);
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
    return points;
}