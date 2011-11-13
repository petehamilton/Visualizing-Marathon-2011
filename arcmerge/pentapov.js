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
    'Personal Well-Being',
    'Environment',
    'Emotions',
    'Technology/Economy',
    'Legacy'
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
    age: 'all',
    formation: 'logo'
}

// Layout & Page controls //////////////////////////////////////////////////////

// various spacing parameters
var chartW      = 600;
var chartH      = 600;
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

theme_map = [2,4,3,1,0];
// theme_map = [0,1,2,3,4];

// numbers and colors
var rings = [
    {ring: theme_map[0], color: 'Blues'}, 
    {ring: theme_map[1], color: 'YlOrRd'},
    {ring: theme_map[2], color: 'Greys'},
    {ring: theme_map[3], color: 'Greens'}, 
    {ring: theme_map[4], color: 'Reds'}
];

// Set the ring positions
rings.map(function(d,i) {
    rings[i]['x'] = (theme_map[i] + 1) * radius;
    rings[i]['y'] = ((theme_map[i] % 2) + 1) * radius;
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

// Animation functions ////////////////////////////////////////////////////////

function change_age(a) {
    arcs.transition().duration(1000).attrTween('d', function(d){return arc_tween(d, settings.sex, a)}).each("end", function(e){ settings.age = a});
}

function change_sex(s) {
    arcs.transition().duration(1000).attrTween('d', function(d){return arc_tween(d, s, settings.age)}).each("end", function(e){ settings.sex = s});
}

function arc_tween(d, s, a) {
    var arc_start_old = get_arc_start_position(d.theme, d.valence, settings.sex, settings.age) * 2 * Math.PI;
    var arc_start_new = get_arc_start_position(d.theme, d.valence, s, a) * 2 * Math.PI;
    var arc_end_old = get_arc_end_position(d.theme, d.valence, settings.sex, settings.age) * 2 * Math.PI;
    var arc_end_new = get_arc_end_position(d.theme, d.valence, s, a) * 2 * Math.PI;
    if( settings.formation == "merged"){
        arc_start_old = arc_start_old / 5 + ((d.theme-.5)*(2/5)*Math.PI);
        arc_end_old = arc_end_old / 5 + ((d.theme-.5)*(2/5)*Math.PI);
        arc_start_new = arc_start_new / 5 + ((d.theme-.5)*(2/5)*Math.PI);
        arc_end_new = arc_end_new / 5 + ((d.theme-.5)*(2/5)*Math.PI);
    }
    var iS = d3.interpolate(arc_start_old , arc_start_new);
    var iE = d3.interpolate(arc_end_old, arc_end_new);
    return function(t) {
        return arc.startAngle(iS(t)).endAngle(iE(t))();
    };
};


function get_formation_translation(ring, formation){
    switch(formation){
        case "pentagram":
            //TODO - do clever things with me
            switch(ring) {
                case 4: return 'translate(' + ((3*radius) - (Math.cos(Math.PI/10)*2*radius)) + ',' + ((3*radius) - (Math.sin(Math.PI/10)*2*radius)) + ')'; break;
                case 3: return 'translate(' + ((3*radius) - (Math.sin(Math.PI/5)*2*radius)) + ',' + ((3*radius) + (Math.cos(Math.PI/5)*2*radius)) + ')'; break;
                case 0: return 'translate(' + (3*radius) + ',' + radius + ')'; break;
                case 2: return 'translate(' + ((3*radius) + (Math.sin(Math.PI/5)*2*radius)) + ',' + ((3*radius) + (Math.cos(Math.PI/5)*2*radius)) + ')'; break;
                case 1: return 'translate(' + ((3*radius) + (Math.cos(Math.PI/10)*2*radius)) + ',' + ((3*radius) - (Math.sin(Math.PI/10)*2*radius)) + ')'; break;
            };
            break;
        case "merged":
            return 'translate(' + (3*radius) + ',' + (3*radius) + ')';
            break;
        default: //logo
            return 'translate(' + rings[ring].x + ',' + rings[ring].y + ')';
            break;
    }
}

// reposition circles
function change_formation(new_formation) {
    // move gs
    change_radius(new_formation);
    return ring_group.transition().duration(1000)
        .attrTween('transform', function(d) { return group_tween(d, new_formation); }).each("end", function(e){ settings.formation = new_formation });
}

function group_tween(ring, new_formation) {
    var i = d3.interpolate(get_formation_translation(ring, settings.formation), get_formation_translation(ring, new_formation));
    return function(t) { return i(t); }
}

// donut imploder/exploder
function tween_radius(d, direction) {
    var arc_start = get_arc_start_position(d.theme, d.valence, settings.sex, settings.age);
    var arc_end = get_arc_end_position(d.theme, d.valence, settings.sex, settings.age);
    var implodedS = arc_start * 2 * Math.PI,
        implodedE = arc_end * 2 * Math.PI,
        explodedS = ((d.theme-.5)*(2/5)*Math.PI) + arc_start * (2/5) * Math.PI,
        explodedE = ((d.theme-.5)*(2/5)*Math.PI) + arc_end * (2/5) * Math.PI,
        implodedIR = radius / 2,
        implodedOR = radius * (7/10),
        explodedIR = 3*radius*(4/5),
        explodedOR = 3*radius;
    if (direction == 'explode') {
        var iS = d3.interpolate(implodedS, explodedS),
            iE = d3.interpolate(implodedE, explodedE),
            iIR = d3.interpolate(implodedIR, explodedIR),
            iOR = d3.interpolate(implodedOR, explodedOR);
    }
    else if (direction == 'implode') {
        var iS = d3.interpolate(explodedS, implodedS),
            iE = d3.interpolate(explodedE, implodedE),
            iIR = d3.interpolate(explodedIR, implodedIR);
            iOR = d3.interpolate(explodedOR, implodedOR);
    }
  return function(t) {
    return arc.startAngle(iS(t)).endAngle(iE(t)).innerRadius(iIR(t)).outerRadius(iOR(t))();
  };
}

// explode the circles
function change_radius(formation) {
    if(settings.formation == "merged" && formation != "merged"){
        arcs.transition().duration(1000)
            .attrTween('d', function(d,i) { return tween_radius(d, "implode"); });
    }
    if(settings.formation != "merged" && formation == "merged"){
        arcs.transition().duration(1000)
            .attrTween('d', function(d,i) { return tween_radius(d, "explode"); });
    }
}

function toggle_view_mode(){
    if (settings.formation != "merged"){
        change_formation("pentagram").each("end", function(e){ settings.formation = "pentagram"; change_formation("merged") })
    }else{
        change_formation("pentagram").each("end", function(e){ settings.formation = "pentagram"; change_formation("logo") })
    }
}

// Controls ////////////////////////////////////////////////////////////////////
var controls = d3.select('body')
  .append('div')
  .attr('id', 'controls');

// Age controls
var ageRadio = controls
    .append('form')
    .attr('id', 'ageRadio');
ages.map(function(a) {
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
        .attr('transform', function(d) { return get_formation_translation(d, settings.formation)} );
    
    // add the title for each ring
    ring_labels = ring_group
      .append('svg:text')
        .text(function(d) { return themes[d]; });
            
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
