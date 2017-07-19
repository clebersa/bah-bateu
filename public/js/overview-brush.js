console.log("overview-brush");

var svg = d3.select("div .overview").append("svg")
        .attr("width", 600)
        .attr("height", 250),
        zoomedRangeMargin = {top: 90, right: 10, bottom: 20, left: 40},
        fullRangeMargin = {top: 10, right: 10, bottom: 190, left: 40},
        rangeWidth = +svg.attr("width") - zoomedRangeMargin.left - zoomedRangeMargin.right,
        zoomedRangeHeight = +svg.attr("height") - zoomedRangeMargin.top - zoomedRangeMargin.bottom,
        fullRangeHeight = +svg.attr("height") - fullRangeMargin.top - fullRangeMargin.bottom;

var parseDate = d3.timeParse("%b %Y");

var xZoomRange = d3.scaleTime().range([0, rangeWidth]),
        xFullRange = d3.scaleTime().range([0, rangeWidth]),
        yZoomRange = d3.scaleLinear().range([zoomedRangeHeight, 0]),
        yFullRange = d3.scaleLinear().range([fullRangeHeight, 0]);

var xAxisZoom = d3.axisBottom(xZoomRange),
        xAxisFull = d3.axisBottom(xFullRange),
        yAxisZoom = d3.axisLeft(yZoomRange);

var brush = d3.brushX()
        .extent([[0, 0], [rangeWidth, fullRangeHeight]])
        .on("brush end", brushed);

var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [rangeWidth, zoomedRangeHeight]])
        .extent([[0, 0], [rangeWidth, zoomedRangeHeight]])
        .on("zoom", zoomed);

var totalAccidentsLine = d3.line()
        .x(function (d) {
            return xZoomRange(d.date);
        })
        .y(function (d) {
            return yZoomRange(d.price);
        });

var areaZoom = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return xZoomRange(d.date);
        })
        .y0(zoomedRangeHeight)
        .y1(function (d) {
            return yZoomRange(d.price);
        });

var areaFull = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function (d) {
            return xFullRange(d.date);
        })
        .y0(fullRangeHeight)
        .y1(function (d) {
            return yFullRange(d.price);
        });

svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", rangeWidth)
        .attr("height", zoomedRangeHeight);

var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + zoomedRangeMargin.left + "," + zoomedRangeMargin.top + ")");

var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + fullRangeMargin.left + "," + fullRangeMargin.top + ")");

d3.csv("sp500.csv", type, function (error, data) {
    if (error)
        throw error;

    xZoomRange.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    yZoomRange.domain([0, d3.max(data, function (d) {
            return d.price;
        })]);
    xFullRange.domain(xZoomRange.domain());
    yFullRange.domain(yZoomRange.domain());

    focus.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", areaZoom);

    focus.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", totalAccidentsLine);

    focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + zoomedRangeHeight + ")")
            .call(xAxisZoom);

    focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxisZoom);

    context.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", areaFull);

    context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + fullRangeHeight + ")")
            .call(xAxisFull);

    context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, xZoomRange.range());

    svg.append("rect")
            .attr("class", "zoom")
            .attr("width", rangeWidth)
            .attr("height", zoomedRangeHeight)
            .attr("transform", "translate(" + zoomedRangeMargin.left + "," + zoomedRangeMargin.top + ")")
            .call(zoom);
});

function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom")
        return; // ignore brush-by-zoom
    var s = d3.event.selection || xFullRange.range();
    xZoomRange.domain(s.map(xFullRange.invert, xFullRange));
    focus.select(".area").attr("d", areaZoom);
    focus.select(".line").attr("d", totalAccidentsLine);
    focus.select(".axis--x").call(xAxisZoom);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            .scale(rangeWidth / (s[1] - s[0]))
            .translate(-s[0], 0));
}

function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush")
        return; // ignore zoom-by-brush
    var t = d3.event.transform;
    xZoomRange.domain(t.rescaleX(xFullRange).domain());
    focus.select(".area").attr("d", areaZoom);
    focus.select(".line").attr("d", totalAccidentsLine);
    focus.select(".axis--x").call(xAxisZoom);
    context.select(".brush").call(brush.move, xZoomRange.range().map(t.invertX, t));
}

function type(d) {
    d.date = parseDate(d.date);
    d.price = +d.price;
    return d;
}