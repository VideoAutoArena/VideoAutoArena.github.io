function tome_vis() {
    var static_width = 700;
    var margin = {top: 30, right: 0, bottom: 10, left: 0};
    var image_size_width = static_width - margin.left - margin.right;

    var indicator_image_size = 226;
    var indicator_image_padding = 10;

    var base_dir = 'website/img/tome_vis/';
    
    var image_data = [
        { id: 'display_image_fig1', title: 'COCO:COCO-train2014-000000247906'},
    ];

    var indicator_data = [
        { id: 'vis_1', opacity: 1.0, title: 'COCO:COCO-train2014-000000247906'},
        { id: 'vis_2', opacity: 0.2, title: 'VG:2331508'},
        { id: 'vis_3', opacity: 0.2, title: 'SA-1B:sa-393200'},
    ];

    var container = d3.select('#tomevis_div')
        .append('svg')
        .attr('width', static_width)
        .attr('id', 'tomevis_svg');

    var image_group = container
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    var indicator_group = container
        .append('g')
        .attr('id', 'indicator_group');

    function updateContainerHeight(height) {
        var total_height = height + margin.top + margin.bottom + 80;
        container
            .attr('height', total_height)
            .attr('viewBox', `0 0 ${static_width} ${total_height}`);
        
        indicator_group
            .attr('transform', `translate(${margin.left}, ${height - 30})`);
    }

    function image_init() {
        // Main image
        image_group.selectAll('image')
            .data(image_data)
            .enter()
            .append('image')
            .attr('width', image_size_width)
            .attr('id', d => d.id)
            .attr('x', 0)
            .attr('y', 0);

        // Question text
        image_group.selectAll('text')
            .data(image_data)
            .enter()
            .append('text')
            .attr('id', d => d.id + '_title')
            .style("text-anchor", "middle")
            .style("font-weight", 700)
            .style('font-size', '16px')
            .attr('x', image_size_width / 2)
            .attr('y', -10);

        // Indicator images
        indicator_group.selectAll('image')
            .data(indicator_data)
            .enter()
            .append('image')
            .attr('width', indicator_image_size)
            .attr('height', indicator_image_size)
            .attr('xlink:href', d => `${base_dir}${d.id}.png`)
            .attr('id', d => d.id + '_fig1')
            .attr('x', (d, i) => i * (indicator_image_size + indicator_image_padding))
            .attr('y', 0)
            .attr('opacity', d => d.opacity)
            .on('click', select_new_image);

        // Initialize with the first image
        select_new_image(null, indicator_data[0]);
    }

    function select_new_image(event, d) {
        indicator_group.selectAll('image')
            .attr('opacity', item => item.id === d.id ? 1.0 : 0.2);
        
        var img = new Image();
        img.onload = function() {
            var aspect_ratio = this.height / this.width;
            var new_height = image_size_width * aspect_ratio;
            
            image_group.select('#display_image_fig1')
                .attr('xlink:href', this.src)
                .attr('height', new_height);
            
            updateContainerHeight(new_height);
        };
        img.src = `${base_dir}${d.id}.png`;
        
        image_group.select('#display_image_fig1_title')
            .text(d.title);
    }

    image_init();
}

document.addEventListener('DOMContentLoaded', tome_vis);