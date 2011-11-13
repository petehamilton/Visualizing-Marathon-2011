//Colours for data. Themes 1..5, [1, 0, -1]
var colors = [
    "#143F7F", "#2065CC", "#74ACFF", // blue
    "#7F0200", "#CC0300", "#FF4F4C", // red
    "#7F4A00", "#CC7700", "#FFB44C", // yellow
    "#577F00", "#8CCC00", "#C7FF4C", //
    "#333333", "#CCCCCC", "#EEEEEE"
];

var themes = [
    'Technology/Economy',
    'Legacy',
    'Environment',
    'Emotions',
    'Personal Well-Being'
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

var sizes = {
    small: {inner: 0.7, outer: 1, xoffset: 110, x_legoffset: 215, y_legoffset: 205},
    large: {inner: 0.6, outer: 0.9, xoffset: 0, x_legoffset: 600, y_legoffset: 10, gap_factor: 0.85 }
}

var view_modes = ['Proportions', 'Relationships'];

// Initial Values //////////////////////

var settings = {
    sex: 'both',
    age: 'all',
    formation: 'logo',
    view_mode: 'Proportions'
}

// Layout & Page controls //////////////////////////////////////////////////////

// various spacing parameters
var chartW      = 1000;
var chartH      = 600;
var radius      = chartW / 10;
var background  = 'white';

// main svg for the chart
var chart = d3.select('#chart_container')
  .append('div')
  .append('svg:svg')
    .attr('id', 'chart')
    .attr('width', chartW)
    .attr('height', chartH);

var logo = chart.append("svg:image") 
            .attr("xlink:href", "2012_logo.jpeg") 
            .attr("width", 150) 
            .attr("height", 150)
            .attr("x", chartW - 150)
            .attr("y", chartH - 150)
            .attr("opacity", 0.4);

// Ring Setup //////////////////////////////////////////////////////////////////

theme_map = [2,4,3,1,0];
// theme_map = [0,1,2,3,4];

// numbers and colors
var rings = [
    {ring: theme_map[0], color: 'Greys'}, 
    {ring: theme_map[1], color: 'Reds'},
    {ring: theme_map[2], color: 'Greens'},
    {ring: theme_map[3], color: 'YlOrRd'}, 
    {ring: theme_map[4], color: 'Blues'}
];

// Set the ring positions
rings.map(function(d,i) {
    rings[i]['x'] = (theme_map[i] + 1) * radius*1.3 + sizes.small.xoffset;
    rings[i]['y'] = ((theme_map[i] % 2)*1.9 + 1) * radius;
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
    return (count / total);
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
        arc_start_old = arc_start_old * sizes.large.gap_factor / 5 + ((d.theme-.5)*(2/5)*Math.PI);
        arc_end_old = arc_end_old * sizes.large.gap_factor / 5 + ((d.theme-.5)*(2/5)*Math.PI);
        arc_start_new = arc_start_new * sizes.large.gap_factor / 5 + ((d.theme-.5)*(2/5)*Math.PI);
        arc_end_new = arc_end_new * sizes.large.gap_factor / 5 + ((d.theme-.5)*(2/5)*Math.PI);
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
            legend_group.transition().duration(1000)
                .attr('transform', 'translate(' + sizes.large.x_legoffset + ',' + sizes.large.y_legoffset  + ')')
            //TODO - do clever things with me
            switch(ring) {
                case 4: return 'translate(' + ((3*radius + sizes.large.xoffset) - (Math.cos(Math.PI/10)*2*radius)) + ',' + ((3*radius) - (Math.sin(Math.PI/10)*2*radius)) + ')'; break;
                case 3: return 'translate(' + ((3*radius + sizes.large.xoffset) - (Math.sin(Math.PI/5)*2*radius)) + ',' + ((3*radius) + (Math.cos(Math.PI/5)*2*radius)) + ')'; break;
                case 0: return 'translate(' + (3*radius + sizes.large.xoffset) + ',' + radius + ')'; break;
                case 2: return 'translate(' + ((3*radius + sizes.large.xoffset) + (Math.sin(Math.PI/5)*2*radius)) + ',' + ((3*radius) + (Math.cos(Math.PI/5)*2*radius)) + ')'; break;
                case 1: return 'translate(' + ((3*radius + sizes.large.xoffset) + (Math.cos(Math.PI/10)*2*radius)) + ',' + ((3*radius) - (Math.sin(Math.PI/10)*2*radius)) + ')'; break;
            };
            break;
        case "merged":
            return 'translate(' + (3*radius + sizes.large.xoffset) + ',' + (3*radius) + ')';
            break;
        default: //logo
            legend_group.transition().duration(1000)
                .attr('transform', 'translate(' + sizes.small.x_legoffset + ',' + sizes.small.y_legoffset  + ')')
            return 'translate(' + rings[ring].x + ',' + rings[ring].y + ')';
            break;
    }
}

// reposition circles
function change_formation(new_formation) {
    // move gs
    change_radius(new_formation);
    d3.selectAll('.chord_group').remove();
    return ring_group.transition().duration(1000)
        .attrTween('transform', function(d) { return group_tween(d, new_formation); }).each("end", function(e){
            settings.formation = new_formation;
        });
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
        explodedS = ((d.theme-.5)*(2/5)*Math.PI) + arc_start*sizes.large.gap_factor * (2/5) * Math.PI,
        explodedE = ((d.theme-.5)*(2/5)*Math.PI) + arc_end*sizes.large.gap_factor * (2/5) * Math.PI,
        implodedIR = radius * sizes.small.inner,
        implodedOR = radius * sizes.small.outer,
        explodedIR = 3*radius*sizes.large.inner,
        explodedOR = 3*radius*sizes.large.outer;

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
        change_formation("pentagram").each("end", function(e){
            settings.formation = "pentagram";
            ring_labels.transition().duration(1000)
                .attr('fill', background);
            legend_rows.transition().duration(1000)
                .attr('fill', "#444444")
                .each("end", function(e){
                    change_formation("merged");
            });
        });
    }else{
        change_formation("pentagram").each("end", function(e){
            settings.formation = "pentagram";
            ring_labels.transition().duration(1000)
                .attr('fill', '#444444');
            legend_rows.transition().duration(1000)
                .attr('fill', background)
                .each("end", function(e){
                    change_formation("logo");
            });
        });
    }
}

// Controls ////////////////////////////////////////////////////////////////////
var controls = d3.select('#controllers_container')
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

// View controls
var viewRadio = controls
    .append('form')
    .attr('id', 'viewRadio');
view_modes.map(function(v) {
    viewRadio.append('input')
        .attr('type', 'radio')
        .attr('name', 'viewRadio')
        .attr('class', 'viewRadio')
        .attr('id', v + 'viewRadio')
        .attr('value', v)
        .attr(v == settings.view_mode ? 'checked' : 'ignoreMe', 'true');
    viewRadio.append('label')
        .attr('for', v + 'viewRadio')
        .text(v);
});
$('#viewRadio').buttonset().css('font-size', 10 + 'px').change(function() { toggle_view_mode(); });


// Chord Generation ////////////////////////////////////////////////////////////

var chord_generator = d3.svg.chord().radius(3*radius*sizes.large.inner);

// draw chords
function draw_chords(source_theme, source_valence) {
    
    // add a group for the chords
    chord_group = chart.append('svg:g')
        .attr('transform', 'translate(' + (3*radius + sizes.large.xoffset) + ',' + (3*radius) + ')')
        .attr('id', 'chord_group_' + source_theme + '_' + source_valence);
    
    // loop through the other themes
    var row = (source_theme*valencies.length) + source_valence,
        d = dataset[get_demographic(settings.sex, settings.age)][row];
    
    themes.map(function(target_theme, target_theme_index) {
        // find total size of the target theme
        var theme_sum = 0;
        valencies.map(function(target_valence, target_valence_index) {
            theme_sum += d[(target_theme_index*valencies.length) + target_valence_index];
        });
        
        // skip the current theme
        if (target_theme_index != source_theme) {
            
            // loop through the valences
            var source_start = ((source_theme-.5)*(2/5)*Math.PI) + get_arc_start_position(source_theme, source_valence, settings.sex, settings.age) * sizes.large.gap_factor * (2/5) * Math.PI,
                source_end = ((source_theme-.5)*(2/5)*Math.PI) + get_arc_start_position(source_theme, source_valence, settings.sex, settings.age) * sizes.large.gap_factor * (2/5) * Math.PI;
            valencies.map(function(target_valence, target_valence_index) {
                // update end angle
                source_end += sizes.large.gap_factor * ((d[(target_theme_index*valencies.length) + target_valence_index] / theme_sum) * (2/5) * Math.PI * get_proportion(source_theme, source_valence, settings.sex, settings.age));
                var target_start = get_arc_start_position(target_theme_index, target_valence_index, settings.sex, settings.age) * sizes.large.gap_factor * 2/5 * Math.PI + ((target_theme_index-.5)*(2/5)*Math.PI);
                var target_end = target_start + (d[(target_theme_index*valencies.length) + target_valence_index] / theme_sum)*get_proportion(source_theme, source_valence, settings.sex, settings.age) * sizes.large.gap_factor * 2/5 * Math.PI;
                
                // draw the chord
                chord_group.append('svg:path')
                    .attr('d', chord_generator
                                .source({startAngle: source_start, endAngle: source_end})
                                .target({startAngle: target_start, endAngle: target_end})
                    )
                    .attr('fill-opacity', .3)
                    .attr('fill', colorbrewer[rings[target_theme_index].color][4][1+target_valence_index])
                    .attr('stroke', background)
                    .attr('stroke-width', 2)
                    .attr('stroke-opacity', .3)
                    .attr('class', 'chord_group');
                
                // update start angle
                source_start += (d[(target_theme_index*valencies.length) + target_valence_index] / theme_sum) * (2/5) * Math.PI * get_proportion(source_theme, source_valence, settings.sex, settings.age) * sizes.large.gap_factor;
            });
        }
    });
}

// Legend //////////////////////////////////////////////////////////////////////
var legend_group;
var legend_rows;
function generate_legend(x,y,w,h){
    spacing = 2;
    console.log("generate legend")
    legend_group = chart.append('svg:g')
        .attr('transform', 'translate(' + x + ',' + y + ')')
    legend_group.selectAll(".legend_cell")
        .data(d3.range(15))
        .enter()
        .append('svg:rect')
        .attr('x',function(d){ return x + (w*2/3)  + (d % 3)*w - w/2})
        .attr('y',function(d){ return y + (Math.floor(d/3)+0.5)*(h+spacing)})
        .attr('height', h + "px")
        .attr('width', w + "px")
        .attr('fill',function(d){ return colorbrewer[rings[Math.floor(d/3)].color][4][1+(2 - (d % 3))]})
        .attr('stroke-width', 1)
        .attr('stroke', background)
        .attr('stroke-opacity', 1);
    legend_group.selectAll(".legend_col")
        .data(["☺", " ", "☹"])
        .enter()
        .append('svg:text')
        .attr('x',function(d, i){ return x + (w*2/3) + (i % 3)*w})
        .attr('y', y)
        .text(function(d){return d})
        .attr('font-size', 22)
        .attr('fill', '#444444')
    legend_rows = legend_group.selectAll(".legend_row")
        .data(themes)
        .enter()
        .append('svg:text')
        .attr('x', x)
        .attr('y', function(d,i){ return y + 3 + (i + 1)*(h+spacing) })
        .text(function(d){return d})
        .attr('fill', background)
        .attr("text-anchor", "end")
        .attr("font-size", 12)
}
generate_legend(sizes.small.x_legoffset,sizes.small.y_legoffset,40,20);

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
      .text(function(d) { return themes[d]; })
      .attr('fill', '#444444')
      .attr("font-size", 12)
            
    // arc generator
    arc = d3.svg.arc()
        .innerRadius(radius*sizes.small.inner)
        .outerRadius(radius*sizes.small.outer)
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
            return colorbrewer[rings[d.theme].color][5][1+d.valence]; })
        .attr('fill-opacity', .5)
        .attr('stroke', background)
        .attr('fill-opacity', 1)
        .attr('stroke-width', 2)
        .on('mouseover', function(d) { if (settings.formation == 'merged') draw_chords(d.theme, d.valence)})
        .on('mouseout', function(d) { if (settings.formation == 'merged') d3.select('#chord_group_' + d.theme + '_' + d.valence).remove(); })
});
