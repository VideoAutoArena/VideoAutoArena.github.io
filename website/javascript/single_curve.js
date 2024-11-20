function single_curve() {
    var margin = ({
        top: 15,
        right: 20,
        bottom: 10,
        left: 20
    });

    var image_size_width = 260;
    var image_size_height = 100;

    var indicator_image_size = 30;
    var indicator_image_padding = 5;
    var indicator_box_top_padding = 0;

    var image_padding = 0;

    var num_images = 1;
    var width = num_images * image_size_width + (num_images - 1) * image_padding;
    var height = image_size_height + indicator_image_size + indicator_image_padding + indicator_box_top_padding;

    var base_image_name = '1';
    var base_dir = `website/img/single_curve/${base_image_name}/`;
    
    var image_data = [
        { x: 0, y: 0, id: 'display_image_tome'},
    ];

    var indicator_data = [
        { x: 0, y: 0, id: 1, opacity: 1.0, image_list:['1.png', '2.png', '3.png', '4.png', '5.png', '6.png']},
        { x: indicator_image_size + indicator_image_padding, y: 0, id: 2, opacity: 0.2, image_list:['1.png', '2.png', '3.png', '4.png', '5.png']},
        { x: 2 * (indicator_image_size + indicator_image_padding), y: 0, id: 3, opacity: 0.2, image_list:['1.png', '2.png', '3.png', '4.png', '5.png']},
        { x: 3 * (indicator_image_size + indicator_image_padding), y: 0, id: 4, opacity: 0.2, image_list:['1.png', '2.png', '3.png', '4.png', '5.png']},
        { x: 4 * (indicator_image_size + indicator_image_padding), y: 0, id: 5, opacity: 0.2, image_list:['1.png', '2.png', '3.png', '4.png', '5.png']},
        { x: 5 * (indicator_image_size + indicator_image_padding), y: 0, id: 6, opacity: 0.2, image_list:['1.png', '2.png', '3.png', '4.png', '5.png']},
    ]

    var container = d3.select('#singlecurve_div')
                        .append('svg')
                        .attr('width',  '100%')
                        .attr('height', '100%')
                        .style('min-width', `${(width + margin.left + margin.right ) / 2}px`)
                        // .style('max-width', `${width + margin.left + margin.right}px`)
                        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    var image_group = container
        .append('g')
        .attr('id', 'image_group_tome')
        .attr('width', width)
        .attr('height', image_size_height)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    var indicator_group = container
        .append('g')
        .attr('id', 'indicator_group_tome')
        .attr('width', 6 * indicator_image_size + 5 * indicator_image_padding)
        .attr('height', indicator_image_size + indicator_image_padding + image_padding+35)
        .attr('transform', `translate(${margin.left}, ${margin.top + image_size_height + 
            image_padding + indicator_box_top_padding})`);
    
    var currentSampleIndex = 1
    var currentIndex = 0; // Keep track of the current image index

    // Function to update the image based on currentIndex
    function updateImage() {
        console.log('updateImage called:', currentSampleIndex, currentIndex);
        if (currentSampleIndex === undefined || currentIndex === undefined) {
            console.error('currentSampleIndex or currentIndex is undefined');
            return;
        }
        var display_image = image_group.select('#display_image_tome');
        var newImagePath = 'website/img/single_curve/' + `${currentSampleIndex}` + '/' + 
            (indicator_data[currentSampleIndex-1] && indicator_data[currentSampleIndex-1].image_list[currentIndex] || '1.png');
        console.log('New image path:', newImagePath);
        display_image.attr('xlink:href', newImagePath);
    }

    // Function to handle clicking on the left arrow button
    function onLeftClick() {
        if (currentIndex > 0) {
            currentIndex -= 1; // Decrease index to show previous image
            updateImage();
        }
    }

    // Function to handle clicking on the right arrow button
    function onRightClick() {
        if (currentIndex < indicator_data[currentSampleIndex-1].image_list.length - 1) {
            currentIndex += 1; // Increase index to show next image
            updateImage();
        }
    }

    // Add left arrow button
    image_group.append('text')
        .attr('x', -20) // Position left of the main image
        .attr('y', image_size_height / 2)
        .text('<') // The left arrow symbol
        .style('cursor', 'pointer')
        .on('click', onLeftClick);

    // Add right arrow button
    image_group.append('text')
        .attr('x', image_size_width + 5) // Position right of the main image
        .attr('y', image_size_height / 2)
        .text('>') // The right arrow symbol
        .style('cursor', 'pointer')
        .on('click', onRightClick);
    
    function select_new_image(event, d) {
        if (!d || !d.id) {
            console.error(d, d.id, 'Invalid row or row.id');
            return;
        }
        currentIndex = 0;
        if (base_image_name === d.id) {
            return;
        }
        indicator_group.selectAll('image')
            .attr('opacity', item => item.id === d.id ? 1.0 : 0.2);
        
        base_image_name = d.id;
        base_dir = `website/img/single_curve/${base_image_name}/`;
        currentIndex = 0;
        currentSampleIndex = d.id;
        updateImage(); 
        var display_image = image_group.select('#display_image_new');
        
        var interp_file = base_dir + '1.png';
        
        cross_fade_image(display_image, interp_file, image_group, 500);

    }

    function image_init(image_data) {
        var single_curve = image_group.selectAll('image').data(image_data);
        var indicator_images = indicator_group.selectAll('image').data(indicator_data);
        
        //Main Images
        single_curve.enter()
            .append('image')
            .attr('width', image_size_width)
            .attr('height', image_size_height)
            .attr('xlink:href', function(d) {
                if (d.id === 'display_image_tome') {
                    return base_dir + '1.png';
                } else {
                    return 'website/img/404.png';  // Make sure this file exists
                }
            })
            .attr('id', function(d) { return d.id ; })
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; });
        
        //Indicator Images
        indicator_images.enter()
            .append('image')
            .attr('width', indicator_image_size)
            .attr('height', indicator_image_size)
            .attr('xlink:href', function(d) {
                return "website/img/single_curve/" + `${d.id}`+ '/1.png';
            })
            .attr('id', function(d) { return d.id+'_tome'; })
            .attr('x', function(d) { return d.x; })
            .attr('y', function(d) { return d.y; })
            .attr('opacity', function(d) { return d.opacity; })
            .style('cursor', 'pointer')  // Add this line to show it's clickable
            .on('click', function(event, d) {
                console.log('Image clicked:', d);
                select_new_image(null, d);
            });

        console.log('Indicator images initialized:', indicator_images.size());
    }

    image_init(image_data);
}

single_curve();