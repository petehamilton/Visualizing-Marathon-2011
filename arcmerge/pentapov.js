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
    {'age': 'all',      'ageName': 'All Ages'}, 
    {'age': 'young',    'ageName': '18-29'}, 
    {'age': 'mature',   'ageName': '30-49'}, 
    {'age': 'older',    'ageName': '50-65'}, 
    {'age': 'elderly',  'ageName': '66+'}
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

function get_demographic(s, a){
    return s + "_" + a;
}

function get_proportion(tn, v, s, a){
    total = 0;
    var diag;
    valencies.map(function(v){
        diag = tn*valencies.length + v.val;
        total += dataset[get_demographic(s, a)][diag][diag];
    });
    count = dataset[get_demographic(s, a)][tn*valencies.length + v][tn*valencies.length + v];
    return count / total;
}

function get_arc_start_position(tn, v, s, a){
    offset = 0;
    valencies.map(function(v2){
        if (v2.val < v){
            offset += get_proportion(tn, v2.val, s, a);
        }
    });
    return offset;
}

function get_arc_end_position(tn, v, s, a){
    return get_arc_start_position(tn, v, s, a) + get_proportion(tn, v, s, a);
}

// Animations & Controls ///////////////////////////////////////////////////////

function change_age(a) {
    arcs.transition().duration(1000).attrTween('d', function(d){return arcTween(d, settings.sex, a)}).each("end", function(e){ settings.age = a}); ;
}

function change_sex(s) {
    arcs.transition().duration(1000).attrTween('d', function(d){return arcTween(d, s, settings.age)}).each("end", function(e){ settings.sex = s}); ;
}

// Control Setup
var controls = d3.select('body')
  .append('div')
  .attr('id', 'controls');

// Age controls
var ageRadio = controls
    .append('form')
    .attr('id', 'ageRadio');
ages.map(function(a) {
    console.log(a)
    ageRadio.append('input')
        .attr('type', 'radio')
        .attr('name', 'ageRadio')
        .attr('class', 'ageRadio')
        .attr('id', a.age + 'AgeRadio')
        .attr('value', a.age)
        .attr(a.age == settings.age ? 'checked' : 'ignoreMe', 'true');
    ageRadio.append('label')
        .attr('for', a.age + 'AgeRadio')
        .text(a.ageName);
});
$('#ageRadio').buttonset().css('font-size', 10 + 'px').change(function() { change_age($('.ageRadio:checked').val()); });

//Sex controls
var sexRadio = controls
  .append('form')
    .attr('id', 'sexRadio');
sexes.map(function(s) {
    sexRadio.append('input')
        .attr('type', 'radio')
        .attr('name', 'sexRadio')
        .attr('class', 'sexRadio')
        .attr('id', s.sex + 'SexRadio')
        .attr('value', s.sex)
        .attr(s.sex == settings.sex ? 'checked' : 'ignoreMe', 'true');
    sexRadio.append('label')
        .attr('for', s.sex + 'SexRadio')
        .text(s.sexName);
});
$('#sexRadio').buttonset().css('font-size', 10 + 'px').change(function() { change_sex($('.sexRadio:checked').val()); });

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
        .startAngle(function(d) { return get_arc_start_position(d.theme, d.valence, settings.sex, settings.age) * 2 * Math.PI; })
        .endAngle(function(d) { return get_arc_end_position(d.theme, d.valence, settings.sex, settings.age) * 2 * Math.PI; });

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
            return colorbrewer[rings[d.theme].color][4][1+d.valence]; })
        .attr('fill-opacity', .5)
        .attr('stroke', background);
});

function arcTween(d, s, a) {
    var iS = d3.interpolate(get_arc_start_position(d.theme, d.valence, settings.sex, settings.age) * 2 * Math.PI, get_arc_start_position(d.theme, d.valence, s, a) * 2 * Math.PI);
    var iE = d3.interpolate(get_arc_end_position(d.theme, d.valence, settings.sex, settings.age) * 2 * Math.PI, get_arc_end_position(d.theme, d.valence, s, a) * 2 * Math.PI);
    return function(t) {
        return arc.startAngle(iS(t)).endAngle(iE(t))();
    };
};
