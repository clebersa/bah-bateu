console.log("scatter");

var svg = d3.select("#scatter"),
        marginScatter = {top: 20, right: 20, bottom: 30, left: 80},
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

function buildScatterPlot(data){
    xRange.domain([0, d3.max(data, function (d) {
            return d.amount;
        })]);
    yRange.domain(d3.map(data, function (d) {
        return d.type;
    }).keys());

    g.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", function (d) {
                return Math.log(d.accidents) + 3;
            })
            .attr("cx", function (d) {
                return xRange(d.amount);
            })
            .attr("cy", function (d) {
                return yRange(d.type);
            })
            .style("fill", function (d) {
                return "#A72D73";
            });

    g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + domainheight + ")")
            .call(d3.axisBottom(xRange));

    g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yRange));
}

$("#reloaderBtn2").click(function(){
    $.ajax({url: '/bah-bateu/',
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            chart: 'scatter'
        },
        dataType: 'JSON',
        success: function(result){
            console.log(result);
            buildScatterPlot(result);
            //heatmapChart(result);
    }});
});