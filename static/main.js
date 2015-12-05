$(function() {

	var YouBike = {

		stationChanged: function() {
			if($(this).val() == '-1') return;
			var id = $(this).val();
			$.ajax({
				url: '/query',
				type: 'GET',
				data: {
					id: id
				},
				success: function(resp) {
					YouBike.data = resp;
					YouBike.drawGraph();
				}
			});
		},

		drawGraph: function() {
			$('#capacity').html('Capacity of this station: ' + YouBike.data[0].total + ' bikes.');
			var vis = d3.select('#graph');
			vis.selectAll('*').remove();
			var WIDTH = 1000;
			var HEIGHT = 500;
			var MARGINS = {
				top: 20,
				right: 20,
				bottom: 20,
				left: 50
			};
			var xScale = d3.time.scale().range([MARGINS.left, WIDTH - MARGINS.right]).domain([new Date(YouBike.data[0].timestamp), new Date(YouBike.data[YouBike.data.length - 1].timestamp)]);
			var yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([0, d3.max(YouBike.data, function(d) { return parseInt(d.avail); })]);
			var xAxis = d3.svg.axis().scale(xScale).ticks(d3.time.minutes, 10).tickFormat(d3.time.format('%I:%M%p'));
			var yAxis = d3.svg.axis().scale(yScale).orient('left');
			vis.append('svg:g').attr('transform', 'translate(0, ' + (HEIGHT - MARGINS.bottom) + ')').call(xAxis);
			vis.append('svg:g').attr('transform', 'translate(' + (MARGINS.left) + ', 0)').call(yAxis);
			var availLineGen = d3.svg.line()
				.x(function(d) {
					return xScale(new Date(d.timestamp))
				})
				.y(function(d) {
					return yScale(d.avail)
				});
			vis.append('svg:path').attr('d', availLineGen(YouBike.data)).attr('stroke', 'green').attr('stroke-width', 2).attr('fill', 'none');
		},

		init: function() {
			$.ajax({
				url: '/names',
				type: 'GET',
				dataType: 'json',
				success: function(resp) {
					$('#station').html('');
					$('#station').append('<option value="-1">Select..</option>');
					YouBike.stations = resp;
					for(var i = 0; i < YouBike.stations.length; ++i) {
						$('#station').append('<option value="' + YouBike.stations[i].id + '">' + YouBike.stations[i].name + '</option>');
					}
					$('#station').click(YouBike.stationChanged);
				}
			});
		}

	};

	YouBike.init();

});