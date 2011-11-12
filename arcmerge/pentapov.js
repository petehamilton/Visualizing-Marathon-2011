//Colours for data. Themes 1..5, [1, 0, -1]
var colors = [
    "#000000", "#FFDD89", "#957244",
    "#000000", "#FFDD89", "#957244",
    "#000000", "#FFDD89", "#957244",
    "#000000", "#FFDD89", "#957244",
    "#000000", "#FFDD89", "#957244"
];

//Theme names
var themes = [
    {theme: 1, name: 'Personal Well-Being', ring: 0},
    {theme: 2, name: 'Environment', ring: 1},
    {theme: 3, name: 'Emotions', ring: 2},
    {theme: 4, name: 'Technology/Economy', ring: 3},
    {theme: 5, name: 'Legacy', ring: 4}
]

var valencies = [
    {val: 0, name: 'Negative'},
    {val: 1, name: 'Neutral'},
    {val: 2, name: 'Positive'},
]

var sexes = [
    {'sex': 'both', 'sexName': 'Both'}, 
    {'sex': 'male', 'sexName': 'Male'}, 
    {'sex': 'female', 'sexName': 'Female'}
];

var ages = [
    {'age': 'all',         'ageName': 'All Ages'}, 
    {'age': 'young',     'ageName': '18-29'}, 
    {'age': 'mature',     'ageName': '30-49'}, 
    {'age': 'old',         'ageName': '50-65'}, 
    {'age': 'elderly',     'ageName': '66+'}
];

// Initial Values //////////////////////

var settings = {
    sex: 'both',
    age: 'all'
}

//Maps theme number to ring number
var ring_lookup = {};
themes.map(function(d) { ring_lookup[d.theme] = d.ring; });

// Layout & Page controls //////////////////////////////////////////////////////

// various spacing parameters
var chartW      = 1000;
var chartH      = chartW / 2;
var radius      = chartW / 6;
var background  = 'white';

// main svg for the chart
var chart = d3.select('body')
  .append('div')
  .append('svg:svg')
    .attr('id', 'chart')
    .attr('width', chartW)
    .attr('height', chartH);

// Ring Setup //////////////////////////////////////////////////////////////////

// numbers and colors
var rings = [
    {ring: 0, color: 'Blues'}, 
    {ring: 1, color: 'YlOrRd'},
    {ring: 2, color: 'Greys'},
    {ring: 3, color: 'Greens'}, 
    {ring: 4, color: 'Reds'}
];

// Set the ring positions
rings.map(function(d,i) {
    rings[i]['x'] = (i+1)*radius;
    rings[i]['y'] = ((i%2)+1)*radius;
})

// Functions to simplify things //////////////////////////////////////////

function get_demographic(){
    return settings.sex + "_" + settings.age;
}
function get_proportion(tn, v){
    total = 0;
    var diag;
    valencies.map(function(v){
        diag = tn*valencies.length + v.val;
        total += dataset[get_demographic()][diag][diag];
    });
    console.log(dataset);
    console.log('argh')
    console.log(v)
    console.log(tn*valencies.length + v)
    console.log(tn*valencies.length)
    count = dataset[get_demographic()][tn*valencies.length + v][tn*valencies.length + v];
    return count / total;
}

function get_arc_start_position(tn, v){
    offset = 0;
    valencies.map(function(v2){
        if (v2.val < v){
            offset += get_proportion(tn, v2.val);
        }
    });
    return offset;
}

function get_arc_end_position(tn, v){
    return get_arc_start_position(tn, v) + get_proportion(tn, v);
}

// Load in Data ////////////////////////////////////////////////////////////////

var dataset;

d3.json('data.json', function(json) {

    // save data
    dataset = json['dataset'];

    // make an svg:g for each ring
    ring_group = chart.selectAll('.ring_group')
        .data(d3.range(themes.length))// Theoretically should be values of each theme
        .enter().append('svg:g')
        .attr('class', 'ring_group')
        .attr('transform', function(d) { return 'translate(' + rings[d].x + ',' + rings[d].y + ')'; } );
    
    // arc generator
    arc = d3.svg.arc()
        .innerRadius(radius/2)
        .outerRadius(radius*(7/10))
        .startAngle(function(d) { return get_arc_start_position(d.theme, d.valence) * 2 * Math.PI; })
        .endAngle(function(d) { return get_arc_end_position(d.theme, d.valence) * 2 * Math.PI; });

    // add an arc for each response
    arcs = ring_group.selectAll('.arc')
        .data(function(d){
            return d3.range(valencies.length).map(function(i){
                return {theme: d, valence: i};
            });
        })
        .enter().append('svg:path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return colorbrewer[rings[d.theme].color][4][3-d.valence]; })
        .attr('fill-opacity', .5)
        .attr('stroke', background);
});

////////////////////////////////////////////////////////////////////////////////

/*
var chord = d3.layout.chord()
  .padding(0.05)
  .matrix(matrix);
  
var w = 300;
var h = 300;
var r0 = Math.min(w, h) * .41;
var r1 = r0 * 1.1;

var fill = d3.scale.ordinal()
    .domain(d3.range(15))
    .range(colors);

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
*/

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
