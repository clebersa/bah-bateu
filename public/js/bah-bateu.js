var filters = {
    startDate: null,
    endDate: null
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

function updateCharts(){
    console.log("update charts");
    console.log(this.filters);
    this.weekDayTimeHeatmap.updateChart();
    this.vehicleScatterPlot.updateChart();
    this.accidentsMap.retrieveData();
}