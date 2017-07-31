function AccidentsMap() {
    this.accidentsInfo = null;
    this.accidentsLocations = null;
    this.heatMapLayer = null;
    this.callbackFunctionName = null;
    this.accidentInfoBoxDefaultTitle = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    this.accidentInfoBoxDefaultBody = "<br/><br/><br/>"

    $("#map").height(550);

    var self = this;
    $("#heatMapButton").click(function () {
        self.showHeatMap();
    });
    $("#pointsButton").click(function () {
        self.showPoints();
    });
}

AccidentsMap.prototype.retrieveData = function () {
    var self = this;
    $("#overlay-maps").removeClass("hidden");
    $.ajax({url: '/bah-bateu/',
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            chart: 'googlemaps',
            filters: JSON.stringify(filters)
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

            self.map.fitBounds(new google.maps.LatLngBounds(
                    new google.maps.LatLng(minLatitude, minLongitude),
                    new google.maps.LatLng(maxLatitude, maxLongitude)));
            
            $("#overlay-maps").addClass("hidden");
            $("#errorLabelMaps").addClass("hidden");
            self.loadLayers();
            
            if (self.callbackFunctionName === null) {
                self.showHeatMap();
            } else {
                self[self.callbackFunctionName]();
            }
        },
        error: function (result) {
            console.log("error for google maps");
            console.log(result);
            $("#overlay-maps").addClass("hidden");
            $("#errorLabelMaps").removeClass("hidden");
        }
    });
}

AccidentsMap.prototype.showHeatMap = function () {
    this.callbackFunctionName = "showHeatMap";
    if (this.accidentsLocations === null) {
        this.retrieveData();
    } else {
        $("#pointsButton").removeClass("text-bold");
        $("#heatMapButton").addClass("text-bold");
        this.markerCluster.clearMarkers();
        this.heatMapLayer.setMap(this.map);
    }
}

AccidentsMap.prototype.showPoints = function () {
    this.callbackFunctionName = "showPoints";
    if (this.accidentsLocations === null) {
        this.retrieveData();
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
        zoom: 11,
        center: {lat: -30.033056, lng: -51.23},
        mapTypeId: google.maps.MapTypeId.ROADMAP
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
    this.infoWindow.opened = false;
    google.maps.InfoWindow.prototype.customOpen = function (map, anchor) {
        this.opened = true;
        this.open(map, anchor);
    }
    google.maps.InfoWindow.prototype.customClose = function () {
        if (this.getMap() !== null && typeof this.getMap() !== "undefined") {
            this.close();
        }
        if (this.opened) {
            this.opened = false;
            filters.latitude = null;
            filters.longitude = null;
            updateCharts([VIEWS.MAPS]);
        }

    }
    google.maps.InfoWindow.prototype.isOpen = function () {
        var map = this.getMap();
        return (map !== null && typeof map !== "undefined");
    }
    this.infoWindow.addListener("closeclick", function () {
        this.customClose();
    });

    var self = this;
    google.maps.event.addListener(this.map, "click", function (event) {
        self.infoWindow.customClose();
    });
}

AccidentsMap.prototype.loadLayers = function () {
    if (this.heatMapLayer == null) {
        this.heatMapLayer = new google.maps.visualization.HeatmapLayer({
            data: new google.maps.MVCArray(),
            map: this.map,
            opacity: 0.75
        });
    }
    this.heatMapLayer.getData().clear();

    var self = this;
    $.each(this.accidentsLocations, function (index, accidentLocation) {
        self.heatMapLayer.getData().push({
            location: new google.maps.LatLng(
                    accidentLocation.latitude,
                    accidentLocation.longitude),
            weight: accidentLocation.total
        });
    });

    this.markers = this.accidentsLocations.map(function (location, i) {
        var marker = new google.maps.Marker({
            position: {lat: location.latitude, lng: location.longitude},
            label: String(location.total)
        });
        marker.addListener('click', function () {
            if (typeof self.infoWindow !== 'undefined') {
                self.infoWindow.close();
            }
            self.infoWindow.customOpen(self.map, marker);
            filters.latitude = location.latitude;
            filters.longitude = location.longitude;
            updateCharts([VIEWS.MAPS]);
            self.retrieveInfoWindowContent();
        });
        return marker;
    });
    if (this.markerCluster == null) {
        // Add a marker clusterer to manage the markers.
        this.markerCluster = new MarkerClusterer(this.map, this.markers,
                {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
        this.markerCluster.setMaxZoom(20);
    }
    this.markerCluster.clearMarkers();
    this.markerCluster.addMarkers(this.markers);
}

AccidentsMap.prototype.retrieveInfoWindowContent = function () {
    $("#accidentsInfoBoxOverlay").removeClass('hidden');
    $("#accidentsInfoBoxTitle").html(this.accidentInfoBoxDefaultTitle);
    $("#accidentsInfoBoxBody").html(this.accidentInfoBoxDefaultBody);

    var self = this;
    $.ajax({url: '/bah-bateu/',
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            chart: 'infowindow',
            filters: JSON.stringify(filters)
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
    this.infoWindow.customOpen(this.map, this.infoWindow.anchor);
}
