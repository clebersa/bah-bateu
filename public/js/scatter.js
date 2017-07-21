console.log("scatter");

var svg = d3.select("#scatter"),
        marginScatter = {top: 20, right: 20, bottom: 30, left: 85},
        widthScatter = +svg.attr("width"),
        heightScatter = +svg.attr("height"),
        domainwidth = widthScatter - marginScatter.left - marginScatter.right,
        domainheight = heightScatter - marginScatter.top - marginScatter.bottom;

var xRange = d3.scaleLinear()
        .range([0, domainwidth]);
var yRange = d3.scalePoint()
        .range([domainheight, 0]);

var g = svg.append("g")
        .attr("transform", "translate(" + marginScatter.left + "," + marginScatter.top + ")");

g.append("rect")
        .attr("width", domainwidth)
        .attr("height", domainheight)
        .attr("fill", "#ffffff");

function buildScatterPlot(data) {
    xRange.domain([0, d3.max(data, function (d) {
            return d.amount;
        }) + 0.2]);
    yDomain = d3.map(data, function (d) {
        return d.type;
    }).keys();
    yDomain.unshift("");
    yDomain.push(" ");
    yRange.domain(yDomain);

    //Scales
    var vehicleTypeScale = d3.scaleOrdinal()
            .domain(yDomain)
            .range(d3.schemeCategory20);
    var totalAccidentsScaleLog = d3.scaleLog()
            .domain(d3.extent(data, function (d) {
                return d.accidents;
            }))
            .range([2, 15]);
    var totalAccidentsScaleSqrt = d3.scaleSqrt()
            .domain([2 / Math.PI, 15 / Math.PI])
            .range([2, 15]);

    //Grid
    g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(yRange)
                    .tickSize(-domainwidth)
                    .tickFormat("")
                    );
    g.append("g")
            .attr("class", "grid")
            .call(d3.axisBottom(xRange)
                    .ticks(xRange.domain()[1])
                    .tickSize(domainheight)
                    .tickFormat("")
                    );

    //Axes
    g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yRange));
    g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + domainheight + ")")
            .call(d3.axisBottom(xRange).ticks(xRange.domain()[1]));

    //Data
    g.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", function (d) {
                return totalAccidentsScaleSqrt(totalAccidentsScaleLog(d.accidents) / Math.PI);
            })
            .attr("cx", function (d) {
                return xRange(d.amount);
            })
            .attr("cy", function (d) {
                return yRange(d.type);
            })
            .style("fill", function (d) {
                return vehicleTypeScale(d.type);
            });


}

$("#reloaderBtn2").click(function () {
    $.ajax({url: '/bah-bateu/',
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            chart: 'scatter'
        },
        dataType: 'JSON',
        success: function (result) {
            buildScatterPlot(result);
        }});
});