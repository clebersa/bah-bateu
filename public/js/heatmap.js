console.log("heatmap");

const margin = {top: 20, right: 0, bottom: 100, left: 30};
const minWidthHeatmap = 350;
var widthHeatmap, heightHeatmap, svgHeatmap, dayLabels, timeLabels, gridSize,
        legendElementWidth, heatmapData;
const buckets = 9,
        colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
        days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        times = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

function drawHeatmap() {
    console.log('redrawing heatmap');
    console.log('width: ' + $('div .heatmap').width());
    if ($('div .heatmap').width() < minWidthHeatmap) {
        $('div .heatmap').addClass('pre-scrollable');
        return false;
    } else {
        $('div .heatmap').removeClass('pre-scrollable');
    }
    widthHeatmap = Math.max($('div .heatmap').width(), minWidthHeatmap) - margin.left - margin.right
    heightHeatmap = $('div .heatmap').height() - margin.top - margin.bottom;
    domainwidth = widthHeatmap - margin.left - margin.right;
    domainheight = heightHeatmap - margin.top - margin.bottom;

    $('div .heatmap').children().remove();

    svgHeatmap = d3.select("div .heatmap").append("svg")
            .attr("width", widthHeatmap + margin.left + margin.right)
            .attr("height", heightHeatmap + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    gridSize = Math.floor(widthHeatmap / 24);
    legendElementWidth = gridSize * 2;

    dayLabels = svgHeatmap.selectAll(".dayLabel")
            .data(days)
            .enter().append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", 0)
            .attr("y", (d, i) => i * gridSize)
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", (d, i) => ((i >= 1 && i <= 5) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"));

    timeLabels = svgHeatmap.selectAll(".timeLabel")
            .data(times)
            .enter().append("text")
            .text((d) => d)
            .attr("x", (d, i) => i * gridSize)
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", (d, i) => ((i >= 6 && i <= 17) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"));
    return true;
}

drawHeatmap();

function heatmapChart() {
    if (heatmapData === null)
        return;
    const colorScaleHeatmap = d3.scaleQuantile()
            .domain(d3.extent(heatmapData, (d) => d.total))
            .range(colors);

    const cardsHeatmap = svgHeatmap.selectAll(".hour")
            .data(heatmapData, (d) => d.dow + ':' + d.hour);

    cardsHeatmap.append("title");

    cardsHeatmap.enter().append("rect")
            .attr("x", (d) => (d.hour) * gridSize)
            .attr("y", (d) => (d.dow - 1) * gridSize)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", colors[0])
            .merge(cardsHeatmap)
            .transition()
            .duration(1000)
            .style("fill", (d) => colorScaleHeatmap(d.total));

    cardsHeatmap.select("title").text((d) => d.total);

    cardsHeatmap.exit().remove();

    const legend = svgHeatmap.selectAll(".legend")
            .data([0].concat(colorScaleHeatmap.quantiles()), (d) => d);

    const legend_g = legend.enter().append("g")
            .attr("class", "legend");

    legend_g.append("rect")
            .attr("x", (d, i) => legendElementWidth * i)
            .attr("y", heightHeatmap)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", (d, i) => colors[i]);

    legend_g.append("text")
            .attr("class", "mono")
            .text((d) => "≥ " + Math.round(d))
            .attr("x", (d, i) => legendElementWidth * i)
            .attr("y", heightHeatmap + gridSize);

    legend.exit().remove();
}
;

$("#reloaderBtn").click(function () {
    $.ajax({url: '/bah-bateu/',
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            chart: 'heatmap'
        },
        dataType: 'JSON',
        success: function (result) {
            heatmapData = result;
            heatmapChart();
        }});
});

new ResizeSensor(jQuery('div .heatmapContainer'), function () {
    if (drawHeatmap()) {
        heatmapChart();
    }
});