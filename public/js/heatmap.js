function WeekDayTimeHeatmap() {
    this.margin = {top: 20, right: 0, bottom: 100, left: 30};
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
}

WeekDayTimeHeatmap.prototype.drawBase = function () {
    const minWidth = 350;
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const times = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

    if ($('div .heatmap').width() < minWidth) {
        $('div .heatmap').addClass('pre-scrollable');
        return false;
    } else {
        $('div .heatmap').removeClass('pre-scrollable');
    }
    var widthHeatmap = Math.max($('div .heatmap').width(), minWidth) - this.margin.left - this.margin.right
    this.heightHeatmap = $('div .heatmap').height() - this.margin.top - this.margin.bottom;
    this.domainwidth = widthHeatmap - this.margin.left - this.margin.right;
    this.domainheight = this.heightHeatmap - this.margin.top - this.margin.bottom;

    $('div .heatmap').children().remove();

    this.svgHeatmap = d3.select("div .heatmap").append("svg")
            .attr("width", widthHeatmap + this.margin.left + this.margin.right)
            .attr("height", this.heightHeatmap + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.gridSize = Math.floor(widthHeatmap / 24);
    this.legendElementWidth = this.gridSize * 2;

    var dayLabels = this.svgHeatmap.selectAll(".dayLabel")
            .data(days)
            .enter().append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", 0)
            .attr("y", (d, i) => i * this.gridSize)
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + this.gridSize / 1.5 + ")")
            .attr("class", (d, i) => ((i >= 1 && i <= 5) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"));

    var timeLabels = this.svgHeatmap.selectAll(".timeLabel")
            .data(times)
            .enter().append("text")
            .text((d) => d)
            .attr("x", (d, i) => i * this.gridSize)
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + this.gridSize / 2 + ", -6)")
            .attr("class", (d, i) => ((i >= 6 && i <= 17) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"));
    return true;
}

WeekDayTimeHeatmap.prototype.loadData = function () {
    if (this.chartData === null)
        return;

    const colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]
    const colorScaleHeatmap = d3.scaleQuantile()
            .domain(d3.extent(this.chartData, (d) => d.total))
            .range(colors);
    const cardsHeatmap = this.svgHeatmap.selectAll(".hour")
            .data(this.chartData, (d) => d.dow + ':' + d.hour);

    cardsHeatmap.append("title");

    cardsHeatmap.enter().append("rect")
            .attr("x", (d) => (d.hour) * this.gridSize)
            .attr("y", (d) => (d.dow - 1) * this.gridSize)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", this.gridSize)
            .attr("height", this.gridSize)
            .style("fill", colors[0])
            .merge(cardsHeatmap)
            .transition()
            .duration(1000)
            .style("fill", (d) => colorScaleHeatmap(d.total));

    cardsHeatmap.select("title").text((d) => d.total);

    cardsHeatmap.exit().remove();

    const legend = this.svgHeatmap.selectAll(".legend")
            .data([0].concat(colorScaleHeatmap.quantiles()), (d) => d);

    const legend_g = legend.enter().append("g")
            .attr("class", "legend");

    legend_g.append("rect")
            .attr("x", (d, i) => this.legendElementWidth * i)
            .attr("y", this.heightHeatmap)
            .attr("width", this.legendElementWidth)
            .attr("height", this.gridSize / 2)
            .style("fill", (d, i) => colors[i]);

    legend_g.append("text")
            .attr("class", "mono")
            .text((d) => "≥ " + Math.round(d))
            .attr("x", (d, i) => this.legendElementWidth * i)
            .attr("y", this.heightHeatmap + this.gridSize);

    legend.exit().remove();
}

var weekDayTimeHeatmap = new WeekDayTimeHeatmap();
weekDayTimeHeatmap.drawBase();