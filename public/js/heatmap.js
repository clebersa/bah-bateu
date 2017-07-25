function WeekDayTimeHeatmap() {
    this.margin = {top: 40, right: 0, bottom: 60, left: 25};
    this.chartData = null;

    var self = this;
    $("#reloaderBtn").click(function () {
        $.ajax({url: '/bah-bateu/',
            type: 'POST',
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                chart: 'heatmap'
            },
            dataType: 'JSON',
            success: function (result) {
                self.chartData = result;
                self.loadData();
            }});
    });

    new ResizeSensor(jQuery('div .heatmapContainer'), function () {
        if (self.drawBase()) {
            self.loadData();
        }
    });
    
    $('div .heatmap').height(250);
}

WeekDayTimeHeatmap.prototype.drawBase = function () {
    const minWidth = 400;
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const times = ["12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];

    if ($('div .heatmap').width() < minWidth) {
        $('div .heatmap').addClass('pre-scrollable');
        return false;
    } else {
        $('div .heatmap').removeClass('pre-scrollable');
    }
    this.widthHeatmap = Math.max($('div .heatmap').width(), minWidth) - this.margin.left - this.margin.right
    this.heightHeatmap = $('div .heatmap').height() - this.margin.top - this.margin.bottom;
    this.domainwidth = this.widthHeatmap - this.margin.left - this.margin.right;
    this.domainheight = this.heightHeatmap - this.margin.top - this.margin.bottom;

    $('div .heatmap').children().remove();

    this.svgHeatmap = d3.select("div .heatmap").append("svg")
            .attr("width", this.widthHeatmap + this.margin.left + this.margin.right)
            .attr("height", this.heightHeatmap + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.gridSizeX = this.widthHeatmap / 24;
    this.gridSizeY = this.heightHeatmap / 7;

    this.svgHeatmap.selectAll(".dayLabel")
            .data(days)
            .enter().append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", 0)
            .attr("y", (d, i) => i * this.gridSizeY)
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + this.gridSizeY / 1.5 + ")")
            .attr("class", (d, i) => ((i >= 1 && i <= 5) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"));

    var self = this;
    this.svgHeatmap.selectAll(".timeLabel")
            .data(times.map(function (time, index) {
                return (self.widthHeatmap > 600 || index % 2 === 0) ? time : '';
            }))
            .enter().append("text")
            .text((d) => d)
            .attr("x", (d, i) => i * this.gridSizeX)
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + this.gridSizeX / 2 + ", -6)")
            .attr("class", (d, i) => ((i >= 6 && i <= 17) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"));
    this.svgHeatmap.selectAll(".periodLabel")
            .data(times.map(function (time, index) {
                return (self.widthHeatmap > 600 || index % 2 === 0) ? ((index < 6 || index > 17) ? '🌙' : '⛭') : '';
            }))
            .enter().append("text")
            .text((d) => d)
            .attr("x", (d, i) => i * this.gridSizeX)
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + this.gridSizeX / 2 + ", -20)")
            .attr("class", (d, i) => ((i >= 6 && i <= 17) ? "periodLabel mono axis axis-worktime" : "timeLabel mono axis"));
    return true;
}

WeekDayTimeHeatmap.prototype.loadData = function () {
    if (this.chartData === null)
        return;

    const colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]
    const colorScale = d3.scaleQuantile()
            .domain(d3.extent(this.chartData, (d) => d.total))
            .range(colors);
    const cardsHeatmap = this.svgHeatmap.selectAll(".hour")
            .data(this.chartData, (d) => d.dow + ':' + d.hour);

    cardsHeatmap.append("title");

    cardsHeatmap.enter().append("rect")
            .attr("x", (d) => (d.hour) * this.gridSizeX)
            .attr("y", (d) => (d.dow - 1) * this.gridSizeY)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", this.gridSizeX)
            .attr("height", this.gridSizeY)
            .style("fill", colors[0])
            .merge(cardsHeatmap)
            .transition()
            .duration(1000)
            .style("fill", (d) => colorScale(d.total));

    cardsHeatmap.select("title").text((d) => d.total);

    cardsHeatmap.exit().remove();

    const legend = this.svgHeatmap.selectAll(".legend")
            .data([0].concat(colorScale.quantiles()), (d) => d);

    const legend_g = legend.enter().append("g")
            .attr("class", "legend");

    var legendWidth = this.widthHeatmap / colors.length;
    legend_g.append("rect")
            .attr("x", (d, i) => legendWidth * i)
            .attr("y", this.heightHeatmap)
            .attr("width", legendWidth)
            .attr("height", this.gridSizeY / 2)
            .attr("transform", "translate(0, 30)")
            .style("fill", (d, i) => colors[i]);

    legend_g.append("text")
            .attr("class", "mono")
            .text((d) => "≥ " + Math.round(d))
            .attr("x", (d, i) => legendWidth * i)
            .attr("y", this.heightHeatmap + this.gridSizeY);

    legend.exit().remove();
}

var weekDayTimeHeatmap = new WeekDayTimeHeatmap();
weekDayTimeHeatmap.drawBase();