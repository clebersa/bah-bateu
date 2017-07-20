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

d3.json("data.json", function (error, data) {
    if (error)
        throw error;

    data.forEach(function (d) {
        d.consequence = +d.consequence;
        //d.value = +d.value;
    });

    xRange.domain([0, d3.max(data, function (d) {
            return d.consequence;
        })]);
    yRange.domain(['Some answer', 'Another answer', 'Third answer']);

    g.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", function (d) {
                return d.value * 5;
            })
            .attr("cx", function (d) {
                return xRange(d.consequence);
            })
            .attr("cy", function (d) {
                return yRange(d.answer);
            })
            .style("fill", function (d) {
                if (d.answer == "Another answer") {
                    return "#60B19C"
                } else if (d.answer == "Some answer") {
                    return "#8EC9DC"
                } else {
                    return "#A72D73"
                }
            });

    g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + domainheight + ")")
            .call(d3.axisBottom(xRange));

    g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yRange));
});