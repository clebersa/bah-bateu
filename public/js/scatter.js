function VehicleScatterPlot() {
    this.margin = {top: 10, right: 10, bottom: 30, left: 10};
    this.chartData = null;

    var self = this;

    new ResizeSensor(jQuery('div .scatterContainer'), function () {
        if (self.drawBase()) {
            self.loadData();
        }
    });

    $('div .scatter').height(300);
}

VehicleScatterPlot.prototype.updateChart = function () {
    var self = this;
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
            self.loadData();
        }});
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
//    xDomain.push(" ");
    this.xRange.domain(xDomain);

    //Scales
    var vehicleTypeScale = d3.scaleOrdinal()
            .domain(xDomain)
            .range(d3.schemeCategory20);
    var totalAccidentsScaleLog = d3.scaleLog()
            .domain(d3.extent(this.chartData, function (d) {
                return d.accidents;
            }))
            .range([2, 15]);
    var totalAccidentsScaleSqrt = d3.scaleSqrt()
            .domain([2 / Math.PI, 15 / Math.PI])
            .range([2, 15]);

    //Grid
    this.g.select(".y.grid")
            .call(d3.axisLeft(this.yRange)
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
    this.g.select(".y.axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(this.yRange)
                    .tickFormat(d3.format("d"))
            );
    this.g.select(".x.axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(this.xRange).ticks(this.xRange.domain()[1]));
    this.g.select(".x.axis")
            .selectAll("text")
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
            .merge(this.circleSelection)
            .transition()
            .duration(500)
            .style("fill", function (d) {
                return vehicleTypeScale(d.type);
            })
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
}
