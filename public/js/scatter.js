function VehicleScatterPlot() {
    this.margin = {top: 10, right: 10, bottom: 30, left: 10};
    this.chartData = null;

    var self = this;

    new ResizeSensor(jQuery('div .scatterContainer'), function () {
        if (self.drawBase()) {
            self.loadData();
        }
    });

    $('div .scatter').height(280);

    $("#clearFilterScatter").click(function () {
        var shouldClear = false;
        Object.keys(filters.vehicles).forEach(function (v) {
            Object.keys(filters.vehicles[v]).forEach(function (q) {
                if (filters.vehicles[v][q]) {
                    shouldClear = true;
                    return;
                }
            });
            if (shouldClear) {
                return;
            }
        })
        if (shouldClear) {
            filters.vehicles = {};
            updateCharts();
        }
    });
}

VehicleScatterPlot.prototype.updateChart = function () {
    var self = this;
    $("#overlay-scatter").removeClass("hidden");
    $.ajax({url: '/bah-bateu/',
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            chart: 'scatter',
            filters: JSON.stringify(filters)
        },
        dataType: 'JSON',
        success: function (result) {
            self.chartData = result;
            $("#overlay-scatter").addClass("hidden");
            $("#errorLabelScatter").addClass("hidden");
            self.loadData();
        },
        error: function (d) {
            $("#errorLabelScatter").removeClass("hidden");
        }
    });
}

VehicleScatterPlot.prototype.drawBase = function () {
    const minWidth = 350;

    if ($('div .scatter').width() < minWidth) {
        $('div .scatter').addClass('pre-scrollable');
        return false;
    } else {
        $('div .scatter').removeClass('pre-scrollable');
    }
    var chartWidth = Math.max($('div .scatter').width(), minWidth) - this.margin.left - this.margin.right;
    var chartHeight = $('div .scatter').height() - this.margin.top - this.margin.bottom;
    this.domainWidth = chartWidth - this.margin.left - this.margin.right;
    this.domainHeight = chartHeight - this.margin.top - this.margin.bottom;

    $('div .scatter').children().remove();

    this.svg = d3.select("div .scatter").append("svg")
            .attr("width", chartWidth + this.margin.left + this.margin.right)
            .attr("height", chartHeight + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.xRange = d3.scalePoint().range([0, this.domainWidth]);
    this.yRange = d3.scaleLinear().range([this.domainHeight, 0]);

    this.g = this.svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.g.append("rect")
            .attr("class", "circles")
            .attr("width", this.domainWidth)
            .attr("height", this.domainHeight);

    //Grid
    this.g.append("g")
            .attr("class", "x grid");
    this.g.append("g")
            .attr("class", "y grid");

    //Axis
    this.g.append("g")
            .attr("class", "y axis");
    this.g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.domainHeight + ")");

    return true;
}

VehicleScatterPlot.prototype.loadData = function () {
    if (this.chartData === null)
        return;
    var xDomain = d3.map(this.chartData, function (d) {
        return d.type;
    }).keys().reverse();
    this.yRange.domain([0, d3.max(this.chartData, function (d) {
            return d.amount;
        })]).nice();
    xDomain.unshift("");
    this.xRange.domain(xDomain);

    //Scales
    var vehicleTypeScale = d3.scaleOrdinal()
            .domain(xDomain)
            .range(d3.schemeCategory20);
    var totalAccidentsScaleLog = d3.scaleLog()
            .domain(d3.extent(this.chartData, function (d) {
                return d.accidents;
            }))
            .range([3, 15]);
    var totalAccidentsScaleSqrt = d3.scaleSqrt()
            .domain([3 / Math.PI, 15 / Math.PI])
            .range([3, 15]);

    //Grid
    this.g.select(".y.grid")
            .call(d3.axisLeft(this.yRange)
                    .ticks(this.yRange.domain()[1])
                    .tickSize(-this.domainWidth)
                    .tickFormat("")
                    );
    this.g.select(".x.grid")
            .call(d3.axisBottom(this.xRange)
                    .ticks(this.xRange.domain()[1])
                    .tickSize(this.domainHeight)
                    .tickFormat("")
                    );

    //Axes
    //this.g.select(".y.axis").select("text.axis-label").remove();
    this.g.select(".y.axis").append("text")
            .attr("class", ".axis-label")
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .attr("transform", "translate("+ (this.margin.left) +","+0+")rotate(-90)")
            .text("Amount involved per accident");
    
    this.g.select(".y.axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(this.yRange)
                    .ticks(this.yRange.domain()[1])
                    .tickFormat(d3.format("d"))
                    )
            .selectAll("text")
            .attr("font-size", "9pt");
    
    this.g.select(".x.axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(this.xRange).ticks(this.xRange.domain()[1]))
            .selectAll("text")
            .attr("font-size", "9pt")
            .attr("y", 15)
            .attr("x", 0)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-20)")
            .style("text-anchor", "end");

    //Data
    var self = this;
    this.circleSelection = this.g.selectAll("circle")
            .data(this.chartData);
    this.circleSelection.enter().append("circle")
            .attr("class", "dot")
            .attr("r", 0)
            .attr("cx", function (d) {
                return self.xRange(d.type);
            })
            .attr("cy", function (d) {
                return self.yRange(d.amount);
            })
            .on("mouseout", function () {
                self.tooltip.style("display", "none");
            })
            .on("mousemove", function (d) {
                self.tooltip.style("display", null);
                var tooltipX = Math.max((d3.mouse(this)[0] - 30), 0);
                tooltipX = Math.min(tooltipX, self.domainWidth - 60);
                var tooltipY = Math.max((d3.mouse(this)[1] - 25), 20);
                tooltipY = (tooltipY === 20) ? (20 + d3.mouse(this)[1]) : tooltipY;
                self.tooltip.attr("transform", "translate(" + tooltipX + "," + tooltipY + ")");
                self.tooltip.select("text.label-tooltip-scatter").text(d.accidents);
            })
            .on("click", function (d) {
                if (filters.vehicles[d.type] == null) {
                    filters.vehicles[d.type] = {}
                }
                ;
                filters.vehicles[d.type][d.amount] = !filters.vehicles[d.type][d.amount];
                updateCharts();
                self.tooltip.remove();
            })
            .merge(this.circleSelection)
            .transition()
            .duration(500)
            .style("fill", function (d) {
                return vehicleTypeScale(d.type);
            })
            .attr("stroke", function (d) {
                if (filters.vehicles.hasOwnProperty(d.type)
                        && filters.vehicles[d.type][d.amount]) {
                    return "black";
                } else {
                    return "none";
                }
            })
            .attr("stroke-width", 2)
            .attr("cx", function (d) {
                return self.xRange(d.type);
            })
            .attr("cy", function (d) {
                return self.yRange(d.amount);
            })
            .attr("r", function (d) {
                return totalAccidentsScaleSqrt(totalAccidentsScaleLog(d.accidents) / Math.PI);
            });
    this.circleSelection.exit().remove();

    self.tooltip = this.g.append("g")
            .attr("class", "tooltip")
            .style("opacity", 1)
            .style("display", "none");

    self.tooltip.append("rect")
            .attr("width", 60)
            .attr("height", 20)
            .attr("fill", "#ccc")
            .style("opacity", 0.75);

    self.tooltip.append("text")
            .attr("x", 30)
            .attr("y", 0)
            .attr("class", "label-tooltip-scatter")
            .text("-")
            .attr("fill", "black")
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .attr("font-weight", "bold");
}
