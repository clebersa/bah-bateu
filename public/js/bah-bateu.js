const VIEWS = {
    //OVERVIEW: 1,
    DAY_HEATMAP: 2,
    VEHICLE: 3,
    MAPS: 4,
}
var filters = {

    //filters from overview
    startDate: null,
    endDate: null,

    //filters from google maps
    latitude: null,
    longitude: null
}
var accidentsTimeSerie = new AccidentsTimeSerie();

var weekDayTimeHeatmap = new WeekDayTimeHeatmap();

var vehicleScatterPlot = new VehicleScatterPlot();

var accidentsMap = new AccidentsMap();

accidentsTimeSerie.drawBase();
weekDayTimeHeatmap.drawBase();
vehicleScatterPlot.drawBase();
accidentsTimeSerie.init();

console.log("done");

function updateCharts(ignore) {
    if (!ignore) {
        ignore = [];
    }

    console.log("update charts");
    console.log(this.filters);

    if (ignore.indexOf(VIEWS.DAY_HEATMAP) === -1) {
        console.log("updating DAY HEATMAP");
        this.weekDayTimeHeatmap.updateChart();
    }
    if (ignore.indexOf(VIEWS.VEHICLE) === -1) {
        console.log("updating SCATTER PLOT");
        this.vehicleScatterPlot.updateChart();
    }
    if (ignore.indexOf(VIEWS.MAPS) === -1) {
        console.log("updating MAPS");
        this.accidentsMap.retrieveData();
    }
}