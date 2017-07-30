function VehicleScatterPlot() {
    this.margin = {top: 10, right: 2, bottom: 15, left: 45};
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

    this.xRange = d3.scaleLinear().range([0, this.domainWidth]);
    this.yRange = d3.scalePoint().range([this.domainHeight, 0]);

    this.g = this.svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    this.g.append("rect")
            .attr("width", this.domainWidth)
            .attr("height", this.domainHeight)
            .attr("fill", "#ffffff");
    return true;
}

VehicleScatterPlot.prototype.loadData = function () {
    if (this.chartData === null)
        return;
    this.xRange.domain([0, d3.max(this.chartData, function (d) {
            return d.amount;
        }) + 0.2]);
    var yDomain = d3.map(this.chartData, function (d) {
        return d.type;
    }).keys();
    yDomain.unshift("");
    yDomain.push(" ");
    this.yRange.domain(yDomain);

    //Scales
    var vehicleTypeScale = d3.scaleOrdinal()
            .domain(yDomain)
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
    this.g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(this.yRange)
                    .tickSize(-this.domainWidth)
                    .tickFormat("")
                    );
    this.g.append("g")
            .attr("class", "grid")
            .call(d3.axisBottom(this.xRange)
                    .ticks(this.xRange.domain()[1])
                    .tickSize(this.domainHeight)
                    .tickFormat("")
                    );

    //Axes
    this.g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(this.yRange));
    this.g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.domainHeight + ")")
            .call(d3.axisBottom(this.xRange).ticks(this.xRange.domain()[1]));

    //Data
    var self = this;
    this.g.selectAll("circle")
            .data(this.chartData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", function (d) {
                return totalAccidentsScaleSqrt(totalAccidentsScaleLog(d.accidents) / Math.PI);
            })
            .attr("cx", function (d) {
                return self.xRange(d.amount);
            })
            .attr("cy", function (d) {
                return self.yRange(d.type);
            })
            .style("fill", function (d) {
                return vehicleTypeScale(d.type);
            });
}

var vehicleScatterPlot = new VehicleScatterPlot();
vehicleScatterPlot.drawBase();