function AccidentsTimeSerie() {
    this.height = 250;
    this.zoomedRangeMargin = {top: 75, right: 0, bottom: 25, left: 35};
    this.fullRangeMargin = {top: 0, right: 0, bottom: 200, left: 35};
    this.parseDate = d3.timeParse("%b %Y");
    this.data = null;
    this.stack = null;
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory20);

    var self = this;
    new ResizeSensor(jQuery('div .overviewContainer'), function () {
        if (self.drawBase()) {
            self.loadData();
        }
    });

    $('div .overview').height(this.height);
}

AccidentsTimeSerie.prototype.drawBase = function () {
    const minWidth = 400;
    if ($('div .overview').width() < minWidth) {
        $('div .overview').addClass('pre-scrollable');
        return false;
    } else {
        $('div .overview').removeClass('pre-scrollable');
    }
    this.width = Math.max($('div .overview').width(), minWidth);
    this.zoomedRangeWidth = this.width - this.zoomedRangeMargin.left - this.zoomedRangeMargin.right;
    this.zoomedRangeHeight = this.height - this.zoomedRangeMargin.top - this.zoomedRangeMargin.bottom;
    this.fullRangeWidth = this.width - this.fullRangeMargin.left - this.fullRangeMargin.right;
    this.fullRangeHeight = this.height - this.fullRangeMargin.top - this.fullRangeMargin.bottom;

    $('div .overview').children().remove();

    this.svg = d3.select("div .overview").append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

    this.xZoomRange = d3.scaleTime().range([0, this.zoomedRangeWidth]);
    this.xFullRange = d3.scaleTime().range([0, this.fullRangeWidth]);
    this.yZoomRange = d3.scaleLinear().range([this.zoomedRangeHeight, 0]);
    this.yFullRange = d3.scaleLinear().range([this.fullRangeHeight, 0]);

    this.xAxisZoom = d3.axisBottom(this.xZoomRange);
    this.xAxisFull = d3.axisBottom(this.xFullRange);
    this.yAxisZoom = d3.axisLeft(this.yZoomRange);

    var self = this;
    this.brush = d3.brushX()
            .extent([[0, 0], [this.fullRangeWidth, this.fullRangeHeight]])
            .on("brush end", function () {
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom")
                    return; // ignore brush-by-zoom
                console.log('brushed');
                var s = d3.event.selection || self.xFullRange.range();
                self.xZoomRange.domain(s.map(self.xFullRange.invert, self.xFullRange));
                self.focusGraphic.select(".area").attr("d", self.areaZoom);
                self.redrawStack();
                self.focusGraphic.select(".lineTotal").attr("d", self.totalAccidentsLineZoom);
                self.focusGraphic.select(".axis--x").call(self.xAxisZoom);
                self.svg.select(".zoom").call(self.zoom.transform, d3.zoomIdentity
                        .scale(self.fullRangeWidth / (s[1] - s[0]))
                        .translate(-s[0], 0));
            });

    this.zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [this.fullRangeWidth, this.fullRangeHeight]])
            .extent([[0, 0], [this.fullRangeWidth, this.fullRangeHeight]])
            .on("zoom", function () {
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush")
                    return; // ignore zoom-by-brush
                console.log('--- zoomed ---');
                var t = d3.event.transform;
                self.xZoomRange.domain(t.rescaleX(self.xFullRange).domain());
                self.focusGraphic.select(".area").attr("d", self.areaZoom);
                self.redrawStack();
                self.focusGraphic.select(".lineTotal").attr("d", self.totalAccidentsLineZoom);
                self.focusGraphic.select(".axis--x").call(self.xAxisZoom);
                self.context.select(".brush").call(self.brush.move, self.xFullRange.range().map(t.invertX, t));
            });

    this.totalAccidentsLineFull = d3.line()
            .x(function (d) {
                return self.xFullRange(d.date);
            })
            .y(function (d) {
                return self.yFullRange(d.total);
            });

    this.areaZoom = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function (d) {
                return self.xZoomRange(d.date);
            })
            .y0(this.zoomedRangeHeight)
            .y1(function (d) {
                return self.yZoomRange(d.total);
            });

    this.totalAccidentsLineZoom = d3.line()
            .x(function (d) {
                return self.xZoomRange(d.date);
            })
            .y(function (d) {
                return self.yZoomRange(d.total);
            });

    this.involvedPeopleHistogram = d3.histogram();

    this.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", this.zoomedRangeWidth)
            .attr("height", this.zoomedRangeHeight);

    this.focusGraphic = this.svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + this.zoomedRangeMargin.left + "," + this.zoomedRangeMargin.top + ")");

    this.context = this.svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + this.fullRangeMargin.left + "," + this.fullRangeMargin.top + ")");
    return true;
}

AccidentsTimeSerie.prototype.loadData = function () {
    var self = this;
    var type = null;
    if (this.data === null) {
        type = function (d) {
            d.date = self.parseDate(d.date);
            d.total = +d.price;
            d.injuried = Math.random() * (d.total);
            d.seriouslyInjured = Math.random() * (d.total - d.injuried);
            d.death = Math.random() * (d.total - d.injuried);
            d.subsequentDeath = Math.random() * (d.total - d.injuried - d.death);
            d.totalInvolved = d.injuried + d.seriouslyInjured + d.death + d.subsequentDeath;
            return d;
        }
    }
    d3.csv("sp500.csv", type, function (error, data) {
        if (error)
            throw error;
        if (self.data === null) {
            self.data = data;
        } else {
            data = self.data;
        }

        self.zoom.scaleExtent([1, data.length]);
        self.xZoomRange.domain(d3.extent(data, function (d) {
            return d.date;
        }));
        self.yZoomRange.domain([0, d3.max(data, function (d) {
                return Math.max(d.total, d.injuried + d.seriouslyInjured + d.death + d.subsequentDeath);
            })]).nice();
        self.xFullRange.domain(self.xZoomRange.domain());
        self.yFullRange.domain(self.yZoomRange.domain()).nice();

        self.involvedPeopleHistogram
                .domain(self.xFullRange.domain())
                .thresholds(self.xFullRange.ticks(data.length));

        self.stack = d3.stack().keys(['injuried', 'seriouslyInjured', 'death', 'subsequentDeath']);
        self.redrawStack();

        self.focusGraphic.append("path")
                .datum(data)
                .attr("class", "lineTotal")
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 2)
                .attr("d", self.totalAccidentsLineZoom);

        self.focusGraphic.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + self.zoomedRangeHeight + ")")
                .call(self.xAxisZoom);

        self.focusGraphic.append("g")
                .attr("class", "axis axis--y")
                .call(self.yAxisZoom);

        var bar = self.context.selectAll(".histogram")
                .data(data)
                .enter().append("g")
                .attr("class", "histogram")
                .attr("transform", function (d) {
                    return "translate(" + self.xFullRange(d.date) + "," + self.yFullRange(d.injuried + d.seriouslyInjured + d.death + d.subsequentDeath) + ")";
                });

        var histogramBarWidth = self.xFullRange(self.involvedPeopleHistogram(data)[0].x1)
                - self.xFullRange(self.involvedPeopleHistogram(data)[0].x0);
        bar.append("rect")
                .attr("x", 1)
                .attr("width", histogramBarWidth)
                .attr("height", function (d) {
                    return self.fullRangeHeight - self.yFullRange(d.injuried + d.seriouslyInjured + d.death + d.subsequentDeath);
                });

        self.context.append("path")
                .datum(data)
                .attr("class", "lineTotalFull")
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 1)
                .attr("d", self.totalAccidentsLineFull);

        self.context.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + self.fullRangeHeight + ")")
                .call(self.xAxisFull);

        self.context.append("g")
                .attr("class", "brush")
                .call(self.brush)
                .call(self.brush.move, self.xFullRange.range());

        self.svg.append("rect")
                .attr("class", "zoom")
                .attr("width", self.zoomedRangeWidth)
                .attr("height", self.zoomedRangeHeight)
                .attr("transform", "translate(" + self.zoomedRangeMargin.left + "," + self.zoomedRangeMargin.top + ")")
                .call(self.zoom);
    });
}

AccidentsTimeSerie.prototype.redrawStack = function () {
    console.log("redrawStack");
    var self = this;
    console.log(self.xZoomRange.domain());
    self.focusGraphic.selectAll(".serie").remove();
    self.focusGraphic.selectAll(".serie")
            .data(self.stack(self.data))
            .enter().append("g")
            .attr("class", "serie")
            .attr("fill", function (d) {
                return self.colorScale(d.key);
            })
            .selectAll("rect")
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("x", function (d) {
                return self.xZoomRange(d.data.date);
            })
            .attr("y", function (d) {
                return self.yZoomRange(d[1]);
            })
            .attr("height", function (d) {
                return self.yZoomRange(d[0]) - self.yZoomRange(d[1]);
            })
            .attr("width", (self.xZoomRange.range()[1] / self.data.length) * 0.75);
}

var accidentsTimeSerie = new AccidentsTimeSerie();
accidentsTimeSerie.drawBase();
