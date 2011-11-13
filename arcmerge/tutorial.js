function start_tutorial() {

    // standard delay times
    var delay = 1000,
        length = 4000,
        duration = 1000;

    // first stick a giant rectangle over the top to prevent people from clicking on anything
    chart_blocker = chart.append('svg:rect')
        .attr('height', chartH)
        .attr('width', chartW)
        .attr('fill-opacity', 0);

//// TODO /////////////
    // stick another rectangle over the control panel
    control_blocker = controls
    
    // show some explanatory text
    intro_text(length, delay, duration);
    function intro_text(length, delay, duration) {
        box = chart.append('svg:g')
            .attr('transform', 'translate(' + chartW/4 + ',' + chartH/4 + ')')
            .attr('opacity', 0)
        box.append('svg:rect')
            .attr('height', chartH/2)
            .attr('width', chartW/2)
            .attr('rx', 20)
            .attr('ry', 20)
            .attr('stroke', '#444444')
            .attr('fill', '#cccccc');
        
        
        var text = ['UK respondents were asked to anticipate', 'the effects of the 2012 Olympic Games.', 'We have categorized their sentiments into positive,', 'negative, or neutral in each of 5 categories.'];
        box.selectAll('intro_text')
            .data(text)
          .enter().append('svg:text')
            .attr('y', function(d,i) { return ((i+1)/(text.length+1)) * (chartH/2); })
            .attr('x', chartW/4)
            .text(function(d) { return d; })
            .attr('font-size', 18);
        
        box.transition().duration(duration)
            .attr('opacity', .9)
            .each('end', setTimeout(function() { 
                label_ring(length, delay, duration, 0); 
                box.remove(); },
            length));
    };
    
    var descriptions = ['% of respondents blah', 
                        '% of respondents blah',
                        '% of respondents blah',
                        '% of respondents blah',
                        '% of respondents blah']
    
    function label_ring(length, delay, duration, ring) {
        ring_group.transition().duration(duration).attr('opacity', function(d) { return d == ring ? 1 : .3; });
        
        short_text = chart.append('svg:text')
            .attr('x', chartW/2)
            .attr('y', chartH/3)
            .attr('fill-opacity', 0)
            .text(function() { return d3.round(get_proportion(ring, 2, settings.sex, settings.age, settings.londoner)*100) + descriptions[ring]; })
            .attr('font-size', 18);
        
        short_text.transition().duration(duration)
            .attr('fill-opacity', 1)
            .each('end', setTimeout(function() {
                if (ring < (descriptions.length-1)) {
                    short_text.transition().duration(duration)
                        .attr('fill-opacity', 0).each('end', function() { short_text.remove(); });
                    label_ring(length, delay, duration, ring+1);
                }
                else {
                    short_text.transition().duration(duration)
                        .attr('fill-opacity', 0).each('end', function() { rshort_text.remove(); });
                }
            }, length));
    }
}

