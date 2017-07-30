function AccidentsMap() {
    this.accidentsInfo = null;
    this.accidentsLocations = null;
    this.heatMapLayer = null;
    this.accidentInfoBoxDefaultTitle = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    this.accidentInfoBoxDefaultBody = "<br/><br/><br/>"

    $("#map").height(300);

    var self = this;
    $("#heatMapButton").click(function () {
        self.showHeatMap();
    });
    $("#pointsButton").click(function () {
        self.showPoints();
    });
}

AccidentsMap.prototype.retrieveData = function (callbackFunctionName) {
    var self = this;
    $.ajax({url: '/bah-bateu/',
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            chart: 'googlemaps'
        },
        dataType: 'JSON',
        success: function (result) {
            console.log("success for google maps");
            self.accidentsLocations = result;
            var maxLatitude = Math.max.apply(Math, self.accidentsLocations.map(function (coordinate) {
                return coordinate.latitude;
            }));
            var minLatitude = Math.min.apply(Math, self.accidentsLocations.map(function (coordinate) {
                return coordinate.latitude;
            }));

            var maxLongitude = Math.max.apply(Math, self.accidentsLocations.map(function (coordinate) {
                return coordinate.longitude;
            }));
            var minLongitude = Math.min.apply(Math, self.accidentsLocations.map(function (coordinate) {
                return coordinate.longitude;
            }));

            var centralLatitude = (maxLatitude + minLatitude) / 2;
            var centralLongitude = (maxLongitude + minLongitude) / 2;

            self.map.setCenter({lat: centralLatitude, lng: centralLongitude});

            self.loadLayers();
            self[callbackFunctionName]();
        },
        error: function (result) {
            console.log("error for google maps");
            console.log(result);
        }
    });
}

AccidentsMap.prototype.showHeatMap = function () {
    if (this.accidentsLocations === null) {
        this.retrieveData("showHeatMap");
    } else {
        $("#pointsButton").removeClass("text-bold");
        $("#heatMapButton").addClass("text-bold");
        this.markerCluster.clearMarkers();
        this.heatMapLayer.setMap(this.map);
    }
}

AccidentsMap.prototype.showPoints = function () {
    if (this.accidentsLocations === null) {
        this.retrieveData("showPoints");
    } else {
        $("#heatMapButton").removeClass("text-bold");
        $("#pointsButton").addClass("text-bold");
        this.heatMapLayer.setMap(null);
        if (this.markerCluster.getMarkers().length === 0) {
            this.markerCluster.addMarkers(this.markers);
            this.markerCluster.redraw();
        }
    }
}

AccidentsMap.prototype.initMap = function () {
    console.log("loading map");
    this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: -30.033056, lng: -51.23},
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
}

AccidentsMap.prototype.loadLayers = function () {
    var points = [];
    $.each(this.accidentsLocations, function (index, accidentLocation) {
        points.push({
            location: new google.maps.LatLng(
                    accidentLocation.latitude,
                    accidentLocation.longitude),
            weight: accidentLocation.total
        });
    });

    this.heatMapLayer = new google.maps.visualization.HeatmapLayer({
        data: points,
        map: this.map,
        opacity: 0.75
    });

    var infoWindowBaseContent =
            '<div class="box box-solid no-margin">'
            + '  <div class="box-header">'
            + '    <h3 class="box-title" id="accidentsInfoBoxTitle">' + this.accidentInfoBoxDefaultTitle + '</h3>'
            + '  </div>'
            + '  <div class="box-body no-padding" id="accidentsInfoBoxBody">' + this.accidentInfoBoxDefaultBody + '</div>'
            + '  <div class="overlay" id="accidentsInfoBoxOverlay">'
            + '    <i class="fa fa-refresh fa-spin"></i>'
            + '  </div>'
            + '</div>';
    this.infoWindow = new google.maps.InfoWindow({
        content: infoWindowBaseContent
    });
    var self = this;
    this.markers = this.accidentsLocations.map(function (location, i) {
        var marker = new google.maps.Marker({
            position: {lat: location.latitude, lng: location.longitude},
            label: String(location.total)
        });
        marker.addListener('click', function () {
            if (typeof self.infoWindow !== 'undefined') {
                self.infoWindow.close();
            }
            self.infoWindow.open(self.map, marker);
            self.retrieveInfoWindowContent(location.latitude, location.longitude)
        });
        return marker;
    });
    // Add a marker clusterer to manage the markers.
    this.markerCluster = new MarkerClusterer(this.map, this.markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
}

AccidentsMap.prototype.retrieveInfoWindowContent = function (latitude, longitude) {
    $("#accidentsInfoBoxOverlay").removeClass('hidden');
    $("#accidentsInfoBoxTitle").html(this.accidentInfoBoxDefaultTitle);
    $("#accidentsInfoBoxBody").html(this.accidentInfoBoxDefaultBody);

    var self = this;
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
            self.accidentsInfo = result;
            var accidentInfoBoxTitle = "";
            var dateOptions = {
                year: "2-digit", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit"
            };
            if (self.accidentsInfo.length > 1) {
                accidentInfoBoxTitle += '<div class="form-group no-margin form-inline">'
                        + 'Accident: <select class="form-control" onchange="accidentsMap.updateAccidentDetailsBox($(this).find(\':selected\').val())">';
                $.each(self.accidentsInfo, function (index, accidentInfo) {
                    accidentInfoBoxTitle += '<option value="' + index + '">#' + (index + 1) + ' - ' + (new Date(accidentInfo.moment)
                            .toLocaleTimeString("en-us", dateOptions)) + '</option>';
                });
                accidentInfoBoxTitle += '</select></div>';
            } else if (self.accidentsInfo.length === 1) {
                accidentInfoBoxTitle = "Accident Details";
            }
            $("#accidentsInfoBoxTitle").html(accidentInfoBoxTitle);
            self.updateAccidentDetailsBox(0);
            $("#accidentsInfoBoxOverlay").addClass('hidden');
        }});
}

AccidentsMap.prototype.updateAccidentDetailsBox = function (accidentInfoIndex) {
    var accidentInfo = this.accidentsInfo[accidentInfoIndex];

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
