// From http://mkweb.bcgsc.ca/circos/guide/tables/

d3.json("matrixdata.json", function(imports) {
  var matrix = imports["dataset"]["both_all"];

var chord = d3.layout.chord()
  .padding(0.05)
  .matrix(matrix);
var w = 600,
    h = 600,
    r0 = Math.min(w, h) * .41,
    r1 = r0 * 1.1;

var fill = d3.scale.ordinal()
    .domain(d3.range(15))
    .range(["#000000", "#FFDD89", "#957244", "#000000", "#FFDD89",
"#957244", "#000000", "#FFDD89", "#957244", "#000000",
"#FFDD89", "#957244", "#000000", "#FFDD89", "#957244"]);

var svg = d3.select("#chart")
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

svg.append("svg:g")
  .selectAll("path")
    .data(chord.groups)
  .enter().append("svg:path")
    .style("fill", function(d) { return fill(d.index); })
    .style("stroke", function(d) { return fill(d.index); })
    .attr("d", 
      d3.svg.arc()
        .innerRadius(r0)
        .outerRadius(r1)
        .startAngle(getStartAngle)
        .endAngle(getEndAngle))
    .on("mouseover", fade(-1))
    .on("mouseout", fade(1));

function getStartAngle(d) {
  if(d.index % 3 == 0)  
    return (d.startAngle+0.05);
  if(d.index % 3 == 1)
    return d.startAngle;
  if(d.index % 3 == 2)
    return (d.startAngle-0.05);
}

function getEndAngle(d) { 
  if(d.index % 3 == 0)  
    return (d.endAngle+0.05);
  if(d.index % 3 == 1)
    return d.endAngle;
  if(d.index % 3 == 2)
    return (d.endAngle-0.05);
}

var ticks = svg.append("svg:g")
  .selectAll("g")
    .data(chord.groups)
  .enter().append("svg:g")
  .selectAll("g")
    .data(groupTicks)
  .enter().append("svg:g")
    .attr("transform", function(d) {
      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + r1 + ",0)";
    });

svg.append("svg:g")
    .attr("class", "chord")
  .selectAll("path")
    .data(chord.chords)
  .enter().append("svg:path")
    .style("fill", function(d) { return fill(d.target.index); })
    .attr("d", d3.svg.chord().radius(r0).startAngle(getStartAngle).endAngle(getEndAngle))
    .style("opacity", 1);


/** Returns an array of tick angles and labels, given a group. */
function groupTicks(d) {
  var k = (d.endAngle - d.startAngle) / d.value;
  return d3.range(0, d.value, 1000).map(function(v, i) {
    return {
      angle: v * k + d.startAngle,
      label: i % 5 ? null : v / 1000 + "k"
    };
  });
}

/** Returns an event handler for fading a given chord group. */
function fade(opacity) {
  return function(g, i) {
    svg.selectAll("g.chord path")
        .filter(function(d) {
          return d.source.index != i && d.target.index != i;
        })
      .transition()
        .style("opacity", opacity);
  };
}
});
