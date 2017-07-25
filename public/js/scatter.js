console.log("scatter");

var marginScatter = {top: 10, right: 2, bottom: 10, left: 45},
        minWidth = 350,
        widthScatter,
        heightScatter,
        domainwidth,
        domainheight,
        svg,
        xRange,
        yRange,
        g, scatterPlotData = null;

function drawScatterPlot() {
    console.log('redrawing');
    console.log('width: ' + $('div .scatter').width());
    if($('div .scatter').width() < minWidth){
        $('div .scatter').addClass('pre-scrollable');
        return false;
    } else {
        $('div .scatter').removeClass('pre-scrollable');
    }
    widthScatter = Math.max($('div .scatter').width(), minWidth) - marginScatter.left - marginScatter.right;
    heightScatter = $('div .scatter').height() - marginScatter.top - marginScatter.bottom;
    domainwidth = widthScatter - marginScatter.left - marginScatter.right;
    domainheight = heightScatter - marginScatter.top - marginScatter.bottom;

    $('div .scatter').children().remove();

    svg = d3.select("div .scatter").append("svg")
            .attr("width", widthScatter + marginScatter.left + marginScatter.right)
            .attr("height", heightScatter + marginScatter.top + marginScatter.bottom)
            .append("g")
            .attr("transform", "translate(" + marginScatter.left + "," + marginScatter.top + ")");

    xRange = d3.scaleLinear().range([0, domainwidth]);
    yRange = d3.scalePoint().range([domainheight, 0]);

    g = svg.append("g")
            .attr("transform", "translate(" + marginScatter.left + "," + marginScatter.top + ")");
    g.append("rect")
            .attr("width", domainwidth)
            .attr("height", domainheight)
            .attr("fill", "#ffffff");
    return true;
}

drawScatterPlot();

function buildScatterPlot() {
    if(scatterPlotData === null) return;
    xRange.domain([0, d3.max(scatterPlotData, function (d) {
            return d.amount;
        }) + 0.2]);
    yDomain = d3.map(scatterPlotData, function (d) {
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
            .domain(d3.extent(scatterPlotData, function (d) {
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
            .data(scatterPlotData)
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
            scatterPlotData = result;
            buildScatterPlot();
        }});
});

new ResizeSensor(jQuery('div .scatterContainer'), function () {
    if(drawScatterPlot()){
        buildScatterPlot();
    }
});