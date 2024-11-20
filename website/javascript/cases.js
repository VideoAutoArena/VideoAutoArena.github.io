function cases() {
    var static_width = 700;
    var margin = {top: 30, right: 0, bottom: 10, left: 0};
    var image_size_width = static_width - margin.left - margin.right;

    var indicator_image_size = 132;
    var indicator_image_padding = 10;

    var base_dir = 'website/vid/cases/';
    
    var indicator_data = [
        { id: 'case_1', opacity: 1.0, fontSize: '0.9em', title: '<b>[detailed caption] (235 words)</b> The video depicts a serene beach scene where a young woman stands on the sandy shore, gazing out towards the ocean. She is wearing a dark blue beanie and a red jacket, adding a pop of color to the otherwise muted scene. The beach, a vast expanse of sand, stretches out in front of her, meeting the ocean at the horizon. The ocean, a vast body of water, is visible in the background. The beach is bathed in a soft, diffused light, creating a dreamy atmosphere. The girls gaze is directed towards the front, suggesting a sense of wonder or contemplation. The image is slightly blurred, adding a dreamy quality to the scene. The woman\'s position on the beach, coupled with the gentle waves of the ocean, suggests a moment of contemplation or admiration. The relative positions of the objects suggest a peaceful day at the beach, with the girl possibly enjoying the serene view of the ocean. The colors are mostly muted, with the girls red jacket standing out against the sandy beach and the blue ocean. The blurred background and the out-of-focus elements, such as the ocean and the sky, contribute to the sense of tranquility and focus on the woman. There is no text present in the video, and the colors are muted, with the exception of the pink jacket, which stands out against the more subdued tones of the surroundings.'},
        { id: 'case_2', opacity: 0.2, fontSize: '0.9em', title: '<b>[short caption] (13 words)</b> A man is lying on the ground with his head on a tree.'},
        { id: 'case_3', opacity: 0.2, fontSize: '0.9em', title: '<b>[background caption] (87 words)</b> The background features a race track with visible tire marks and barriers, surrounded by grassy areas and a few scattered trees. The track is set in a rural or semi-rural location, with hills in the distance and a cloudy sky overhead, suggesting overcast weather conditions. The track itself appears well-maintained with a smooth surface, designed for high-speed racing. The weather, indicated by the cloudy sky, contributes to the overall ambiance of the scene, enhancing the sense of a cool, possibly early morning or late afternoon setting.'},
        { id: 'case_4', opacity: 0.2, fontSize: '0.9em', title: '<b>[camera caption] (69 words)</b> The view shot remains relatively static, focusing on the children playing in the backyard. The camera angle is at eye level, capturing the scene from a distance that allows both children to be visible. There is minimal camera movement, maintaining a steady focus on the children and their activities. The sequence of video frames suggests a continuous moment of play without significant changes in shooting angles or camera movement.'},
        { id: 'case_5', opacity: 0.2, fontSize: '0.9em', title: '<b>[main object caption] (114 words)</b> The main subject in the video, a black car, is seen driving down a street that appears to be in a state of disarray. The car moves steadily forward, navigating around obstacles such as a blue car parked on the side of the road. The car\'s movement is smooth and continuous, suggesting it is either in motion or has just come to a stop. The environment around the car is chaotic, with debris scattered across the road and signs of destruction, indicating a recent event or disaster. The car\'s position remains central in the frame, with the camera angle focused on it from a slightly elevated perspective, possibly from a vehicle or a structure above.'},
    ];

    var container = d3.select('#cases_div')
        .append('svg')
        .attr('width', static_width)
        .attr('id', 'case_svg');

    var video_overlay = d3.select('#video_overlay');

    var total_indicators_width = (indicator_image_size + indicator_image_padding) * indicator_data.length - indicator_image_padding;
    var indicators_start_x = (static_width - total_indicators_width) / 2;

    var indicator_group = container
        .append('g')
        .attr('id', 'indicator_group')
        .attr('transform', `translate(${indicators_start_x}, 0)`);

    function updateContainerHeight(height) {
        var total_height = height + margin.top + margin.bottom + indicator_image_size + 20;
        container
            .attr('height', total_height)
            .attr('viewBox', `0 0 ${static_width} ${total_height}`);
        
        indicator_group
            .attr('transform', `translate(${indicators_start_x}, ${height + margin.top + 20})`);
    }

    function image_init() {
        // Main video container - add text-align center
        video_overlay
        .style('text-align', 'center');

        // Main video
        video_overlay.append('video')
            .attr('id', 'display_case_video1')
            .attr('width', image_size_width)
            .attr('controls', true)
            .append('source')
            .attr('type', 'video/mp4');

        // Title
        video_overlay.append('div')
            .attr('id', 'display_case_video1_title')
            .style('text-align', 'justify')
            .style('margin', '8px auto') // 上下margin 8px，左右自动居中
            .style('width', image_size_width + 'px') // 设置与视频相同的宽度
            .style('max-width', '100%') // 响应式处理
            .style('text-justify', 'inter-word'); 

        video_overlay.append('style')
            .text('#display_case_video1_title { line-height: 1.2; }');


        // Indicator videos
        indicator_group.selectAll('foreignObject')
            .data(indicator_data)
            .enter()
            .append('foreignObject')
            .attr('width', indicator_image_size)
            .attr('height', indicator_image_size)
            .attr('x', (d, i) => i * (indicator_image_size + indicator_image_padding))
            .attr('y', 0)
            .attr('opacity', d => d.opacity)
            .each(function(d) {
                d3.select(this)
                    .append('xhtml:video')
                    .attr('width', '100%')
                    .attr('height', '100%')
                    .attr('muted', true)
                    .attr('loop', true)
                    .attr('playsinline', true)
                    .append('source')
                    .attr('src', `${base_dir}${d.id}.mp4`)
                    .attr('type', 'video/mp4');
            })
            .on('click', select_new_video);
    }

    function select_new_video(event, d) {
        indicator_group.selectAll('foreignObject')
            .attr('opacity', item => item.id === d.id ? 1.0 : 0.2);
        
        var video = d3.select('#display_case_video1');
        var source = video.select('source');
        
        source.attr('src', `${base_dir}${d.id}.mp4`)
        video.node().load(); // Force the video to load
        
        d3.select('#display_case_video1_title')
            .html(`<span style="font-size: ${d.fontSize};">${d.title}</span>`);

        video.on('loadedmetadata', function() {
            var aspect_ratio = this.videoHeight / this.videoWidth;
            var new_height = image_size_width * aspect_ratio;
            
            video.attr('height', new_height);
            
            // updateContainerHeight(new_height);
        });

        // Play all indicator videos
        // indicator_group.selectAll('video').each(function() {
        //     this.play().catch(e => console.log("Autoplay prevented:", e));
        // });
    }

    function displayIndicatorData(data) {
        console.log('displayIndicatorData called with', data);
        data.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.style.opacity = item.opacity;
                const titleElement = element.querySelector('.title'); // Assuming there's a class 'title' for the title element
                if (titleElement) {
                    titleElement.textContent = item.title;
                    titleElement.style.fontSize = item.fontSize;
                    titleElement.style.lineHeight = item.lineHeight;

                }
            }
        });
    }

    displayIndicatorData(indicator_data);

    image_init();
    select_new_video(null, indicator_data[0]);
}

cases();