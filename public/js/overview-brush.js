function AccidentsTimeSerie() {
    this.height = 250;
    this.zoomedRangeMargin = {top: 80, right: 15, bottom: 60, left: 45};
    this.fullRangeMargin = {top: 10, right: 15, bottom: 205, left: 45};
    this.parseDate = d3.timeParse("%Y-%m-%d");
    this.stackLegendWidth = 120;
    this.data = null;
    this.isDomainDefined = false;
    this.stackMap = {injuried: 'Injuried',
        seriouslyInjuried: 'Seriously Injuried',
        deaths: 'Deaths',
        subsequentDeaths: 'Subsequent Deaths'
    };
    this.stack = d3.stack().keys(Object.keys(this.stackMap));
    this.colorScale = d3.scaleOrdinal(['#1b9e77', '#d95f02', '#7570b3', '#e7298a']);

    this.xZoomRange = d3.scaleTime();
    this.xFullRange = d3.scaleTime();
    this.yZoomRange = d3.scaleLinear();
    this.yFullRange = d3.scaleLinear();

    var self = this;
    new ResizeSensor(jQuery('div .overviewContainer'), function () {
        if (self.drawBase()) {
            self.loadData();
        }
    });

    $('div .overview').height(this.height);
}

AccidentsTimeSerie.prototype.init = function () {
    var self = this;
    $("#overlay-overview").removeClass("hidden");
    $.ajax({url: '/bah-bateu/',
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            chart: 'overview',
            filters: filters
        },
        dataType: 'JSON',
        success: function (result) {
            result.forEach(function (record) {
                record.max_moment = self.parseDate(record.max_moment);
                record.min_moment = self.parseDate(record.min_moment);
                record.totalAccidents = +record.totalAccidents;
                record.injuried = +record.injuried;
                record.seriouslyInjuried = +record.seriouslyInjuried;
                record.deaths = +record.deaths;
                record.subsequentDeaths = +record.subsequentDeaths;
                record.totalPeople = record.injuried + record.seriouslyInjuried + record.deaths + record.subsequentDeaths;
            });

            $("#overlay-overview").addClass("hidden");
            self.data = result;
            if (self.drawBase()) {
                self.loadData();
            }
        }});
}

AccidentsTimeSerie.prototype.drawBase = function () {
    const minWidth = Math.max((this.stackLegendWidth * 4) + this.zoomedRangeMargin.left, 400);
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

    this.xZoomRange.range([0, this.zoomedRangeWidth]);
    this.xFullRange.range([0, this.fullRangeWidth]);
    this.yZoomRange.range([this.zoomedRangeHeight, 0]);
    this.yFullRange.range([this.fullRangeHeight, 0]);

    this.xAxisZoom = d3.axisBottom(this.xZoomRange);
    this.xAxisFull = d3.axisBottom(this.xFullRange);
    this.yAxisZoom = d3.axisLeft(this.yZoomRange)
            .ticks()
            .tickSize(-this.zoomedRangeWidth, 0, 0);

    var self = this;
    this.brush = d3.brushX()
            .extent([[0, 0], [this.fullRangeWidth, this.fullRangeHeight]])
            .on("brush end", function () {
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom")
                    return; // ignore brush-by-zoom
                console.log('+++++ brushed +++++');
                var s = d3.event.selection || self.xFullRange.range();
                self.xZoomRange.domain(s.map(self.xFullRange.invert, self.xFullRange));

                if (filters.startDate == null || filters.endDate == null) {
                    shouldUpdate = true;
                    filters.startDate = self.xZoomRange.domain()[0];
                    filters.endDate = self.xZoomRange.domain()[1];
                    console.log("updateStartDate")
                    updateCharts();
                }

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
                var shouldUpdate = false;
                if (filters.startDate.getTime() != self.xZoomRange.domain()[0].getTime()) {
                    shouldUpdate = true;
                    filters.startDate = self.xZoomRange.domain()[0];
                    console.log("updateStartDate")
                }
                if (filters.endDate.getTime() != self.xZoomRange.domain()[1].getTime()) {
                    shouldUpdate = true;
                    filters.endDate = self.xZoomRange.domain()[1];
                    console.log("updateStartDate")
                }

                if (shouldUpdate) {
//                    updateCharts([VIEWS.MAPS, VIEWS.DAY_HEATMAP, VIEWS.VEHICLE]);
                    updateCharts();
                }
                self.redrawStack();
                self.focusGraphic.select(".lineTotal").attr("d", self.totalAccidentsLineZoom);
                self.focusGraphic.select(".axis--x").call(self.xAxisZoom);
                self.context.select(".brush").call(self.brush.move, self.xFullRange.range().map(t.invertX, t));
            });

    this.totalAccidentsLineFull = d3.line()
            .x(function (d) {
                return self.xFullRange(new Date(d.min_moment.getTime() + (d.max_moment - d.min_moment) / 2));
            })
            .y(function (d) {
                return self.yFullRange(d.totalAccidents);
            })
            .defined(function (d) {
                return d;
            });

    this.totalAccidentsLineZoom = d3.line()
            .x(function (d) {
                return self.xZoomRange(new Date(d.min_moment.getTime() + (d.max_moment - d.min_moment) / 2));
            })
            .y(function (d) {
                return self.yZoomRange(d.totalAccidents);
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

    self.focusGraphic.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + self.zoomedRangeHeight + ")");

    self.focusGraphic.append("g")
            .attr("class", "axis axis--y");

    return true;
}

AccidentsTimeSerie.prototype.loadData = function () {
    var self = this;
    if (!this.data) {
        console.log("data was not retrieved yet.");
        return;
    }
    var data = self.data;
    self.zoom.scaleExtent([1, data.length]);
    if (!self.isDomainDefined) {
        self.xZoomRange.domain([d3.min(data, function (d) {
                return d.min_moment;
            }), d3.max(data, function (d) {
                return d.max_moment;
            })]).nice();

        self.yZoomRange.domain([0, d3.max(data, function (d) {
                return Math.max(d.totalAccidents, d.totalPeople);
            })]).nice();
        self.isDomainDefined = true;
    }
    self.xFullRange.domain([d3.min(data, function (d) {
            return d.min_moment;
        }), d3.max(data, function (d) {
            return d.max_moment;
        })]);

    self.yFullRange.domain(self.yZoomRange.domain()).nice();

    self.involvedPeopleHistogram
            .domain(self.xFullRange.domain())
            .thresholds(self.xFullRange.ticks(data.length));

    self.focusGraphic.select(".axis.axis--x")
            .call(self.xAxisZoom).selectAll("text").attr("font-size", "9pt");


    self.focusGraphic.select(".axis.axis--y").select("text.axis-label").remove();
    self.focusGraphic.select(".axis.axis--y")
            .call(self.yAxisZoom.ticks(7)).selectAll("text").attr("font-size", "9pt");
self.focusGraphic.select(".axis.axis--y")
            .append("text")
            .attr("class", ".axis-label")
            .attr("fill", "black")
            .attr("opacity", "1")
            .attr("text-anchor", "end")
            .attr("transform", "translate(-30,0)rotate(-90)")
            .text("Amount")
            .attr("font-size", "9pt");
    self.redrawStack();

    self.focusGraphic.append("path")
            .datum(data)
            .attr("class", "lineTotal")
            .attr("fill", "none")
            .attr("stroke", "#e41a1c")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1)
            .attr("d", self.totalAccidentsLineZoom);

    var bar = self.context.selectAll(".histogram")
            .data(data)
            .enter().append("g")
            .attr("class", "histogram")
            .attr("transform", function (d) {
                return "translate(" + self.xFullRange(d.min_moment) + "," + self.yFullRange(d.totalPeople) + ")";
            });

    var histogramThresholds = self.involvedPeopleHistogram(data);
    bar.append("rect")
            .attr("x", 1)
            .attr("width", function (d, i) {
                if (histogramThresholds[i] == null) {
                    return 0;
                } else {
                    return self.xFullRange(histogramThresholds[i].x1)
                            - self.xFullRange(histogramThresholds[i].x0);
                }
            })
            .attr("height", function (d) {
                return self.fullRangeHeight - self.yFullRange(d.totalPeople);
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
            .call(self.xAxisFull).selectAll("text").attr("font-size", "9pt");

    self.context.append("g")
            .attr("class", "brush")
            .call(self.brush)
            .call(self.brush.move, self.xZoomRange.domain().map(self.xFullRange, self.xZoomRange.domain()));

    self.svg.append("rect")
            .attr("class", "zoom")
            .attr("width", self.zoomedRangeWidth)
            .attr("height", self.zoomedRangeHeight)
            .attr("transform", "translate(" + self.zoomedRangeMargin.left + "," + self.zoomedRangeMargin.top + ")")
            .on("mousedown", function (d) {
                self.tooltip.style("display", "none");
                self.dotTotalAccidents.style("display", "none");
            })
            .on("mouseout", function () {
                self.tooltip.style("display", "none");
                self.dotTotalAccidents.style("display", "none");
            })
            .on("mousemove", function (d) {
                var date = self.xZoomRange.invert(d3.mouse(this)[0]);
                var record = null;
                self.tooltip.style("display", null);
                self.dotTotalAccidents.style("display", null);
                if (record === null || date.getTime() < record.min_moment.getTime() || date.getTime() > record.max_moment.getTime()) {
                    self.data.forEach(function (element) {
                        if (date.getTime() >= element.min_moment.getTime() && date.getTime() <= element.max_moment.getTime()) {
                            record = element;
                            return;
                        }
                    });
                }
                if (record !== null) {
                    var tooltipX = Math.max((d3.mouse(this)[0] - 15), 0);
                    tooltipX = Math.min(tooltipX, self.zoomedRangeWidth - 30);
                    var tooltipY = Math.max((d3.mouse(this)[1] - 65), 0);
                    self.tooltip.attr("transform", "translate(" + tooltipX + "," + tooltipY + ")");
                    Object.keys(self.stackMap).forEach(function (key) {
                        self.tooltip.select("text.label-tooltip-" + key).text(record[key]);
                    });
                    self.dotTotalAccidents.attr("cx", self.xZoomRange(new Date(record.min_moment.getTime() + (record.max_moment - record.min_moment) / 2)));
                    self.dotTotalAccidents.attr("cy", self.yZoomRange(record.totalAccidents));
                } else {
                    self.tooltip.style("display", "none");
                    self.dotTotalAccidents.style("display", "none");
                }
            })
            .call(self.zoom);

    self.dotTotalAccidents = self.focusGraphic.append("circle")
            .attr("r", 3)
            .attr("cx", 0)
            .attr("cy", 0)
            .style("fill", "#e41a1c")
            .style("display", "none");

    self.tooltip = self.focusGraphic.append("g")
            .attr("class", "tooltip")
            .style("opacity", 1)
            .style("display", "none");

    self.tooltip.append("rect")
            .attr("width", 30)
            .attr("height", 60)
            .attr("fill", "white")
            .style("opacity", 0.75);

    self.tooltip.selectAll("text")
            .data(Object.keys(self.stackMap).reverse()).enter()
            .append("text")
            .attr("x", 15)
            .attr("y", function (d, i) {
                return i * 15;
            })
            .text("-")
            .attr("class", function (d) {
                return "label-tooltip-" + d;
            })
            .attr("fill", self.colorScale)
            .attr("dy", "1.0em")
            .style("text-anchor", "middle")
            .attr("font-weight", "bold");

    var legend = self.focusGraphic.append("g")
            //.attr("text-anchor", "center")
            .selectAll("g")
            .data(Object.keys(self.stackMap))
            .enter().append("g")
            .attr("transform", function (d, i, data) {
                return "translate(" + ((self.zoomedRangeWidth / 2) + ((i - data.length / 2) * self.stackLegendWidth)) + ", " + (self.zoomedRangeHeight + 30) + ")";
            })
            .attr("font-size", "9pt");

    legend.append("rect")
            .attr("x", -10)
            .attr("y", -5)
            .attr("width", (Object.keys(self.stackMap).length / 2) * self.stackLegendWidth - 95)
            .attr("height", 25)
            .attr("opacity", "0.75")
            .attr("fill", "white");

    legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", self.colorScale);

    legend.append("text")
            .attr("x", 20)
            .attr("y", 7.5)
            .attr("dy", "0.32em")
            .text(function (d) {
                return self.stackMap[d];
            });
}

AccidentsTimeSerie.prototype.redrawStack = function () {
    var self = this;

    var stacksSelection = self.focusGraphic.selectAll(".serie")
            .data(self.stack(self.data));
    stacksSelection.enter().append("g")
            .merge(stacksSelection)
            .attr("class", "serie")
            .attr("fill", function (d) {
                return self.colorScale(d.key);
            });
    stacksSelection.exit().remove();

    var stackSelection = stacksSelection.selectAll("rect")
            .data(function (d) {
                return d;
            });

    stackSelection.enter().append("rect")
            .merge(stackSelection)
            .attr("x", function (d) {
                return self.xZoomRange(d.data.min_moment);
            })
            .attr("y", function (d) {
                return self.yZoomRange(d[1]);
            })
            .attr("height", function (d) {
                return self.yZoomRange(d[0]) - self.yZoomRange(d[1]);
            })
            .attr("width", function (d) {
                return (self.xZoomRange(d.data.max_moment) - self.xZoomRange(d.data.min_moment)) * 0.95;
            });
    stackSelection.exit().remove();
}
