$(document).ready(function(){

	var width = 700,
	height = 580;
	var dataset;

	var inputValue = null;
	var month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

	var svg = d3.select('#svg')
	.append('svg')
	.attr('width', width)
	.attr('height', height)

	var g = svg.append('g');

	//set projection
	var projection = d3.geoAlbers()
		.scale(110000)
		.rotate([122.33, 0])
		.center([0, 47.6062])
		.translate([width/2, height/2]);

	var geoPath = d3.geoPath()
	.projection(projection);

	//set path
	g.selectAll("path")
		.data("/../data/neighborhoods_json.features")
		.enter()
		.append("path")
		.attr('fill', 'none')
		.attr("stroke", "#696969")
		.attr('d', geoPath);

	//add data points
	d3.csv("../data/clean-data.csv", function (error, data) {
		// change into number format
		data.forEach(function (d) {
			d.Latitude= +d.Latitude;
			d.Longitude = +d.Longitude;
		});
		dataset = data
		drawViz(dataset);
	});

	//moved out of drawViz function
	var incidents = svg.append("g");

	function drawViz(data){

	var circle = incidents.selectAll("circle")
		.data(data)

	console.log(data.length);

	//???? Why lol
	// circle
	// 	.attr("fill", "#5e81fd")
	// 	.attr("stroke", "#3c3c3c")
	// 	.attr("r", 3)
	// 	.attr("cx", function(d){
	// 		var coords = projection([d.Longitude, d.Latitude])
	// 		return coords[0];
	// 	})
	// 	.attr("cy", function(d){
	// 		var coords = projection([d.Longitude, d.Latitude])
	// 		return coords[1];
	// 	})
	// 	.attr("d", geoPath)

	//I think this is wrong ...


	circle.exit().remove();

	circle.enter().append("circle")
				.attr("cx", function(d) {
					var coords = projection([d.Longitude, d.Latitude])
					//console.log(coords[0].length);
					return coords[0]})
				.attr("cy", function(d) {
					var coords = projection([d.Longitude, d.Latitude])
					return coords[1]})
				.attr("r", 3)
				//.style("stroke", "black")
				.style("opacity", 0.5)
				//.attr("d", geoPath)
				.attr("d", geoPath)

				//mouse over event
				.on("mouseover", function(d){
					d3.select("p").html("<b>Block Location: </b>" + d["Hundred.Block.Location"] + "\n"
						+ "<b>Zone/Beat: </b>" + d["Zone.Beat"] + "\n"
						+ "<b>Group Description: </b>" + d["Event.Clearance.Description"] + "\n"
						+ "<b>At Scene Date: </b>" + d["Date"] + "\n"
						+ "<b>At Scene Time: </b>" + d["Time"]);
					d3.select(this).attr("class","incident hover");
				})
				.on("mouseout", function(d){
					d3.select("h2").html("");
					d3.select(this).attr("class","incident");
				})
				.attr("d", geoPath)
				.attr("class", "incident");
			}

	//create slider
	d3.select("#timeslide").on("input", function() {
		update(+this.value);
	});

	//on form select change
	d3.select("#form-select").on('change', function() {
		filterType(this.value);
	});

	// update the fill of each SVG of class "incident" with value
	function update(value) {
	document.getElementById("range").innerHTML=month[value];
	inputValue = month[value];
	d3.selectAll(".incident")
	.attr("fill", dateMatch)
	.attr("stroke", dateMatch2);
	}

	/*

	//match the year with the slider input
	function dateMatch(data, value) {
	var date = new Date(data.Date);
	var m = month[date.getMonth()];

	if (inputValue == m) {
		this.parentElement.appendChild(this);
		return "#5e81fd";
	} else {
		return "none";
	};
	}

	//remove other data points
	function dateMatch2(data, value) {
	var date = new Date(data.Date);
	var m = month[date.getMonth()];

	if (inputValue == m) {
		this.parentElement.appendChild(this);
		return "#3c3c3c";
	} else {
		return "none";
	};
	}

	*/

	/*

	//initial viZ
	function initialDate(d,i){
	var date = new Date(d.Date);
	var m = month[date.getMonth()];

	if (m == "January") {
		this.parentElement.appendChild(this);
		return "#5e81fd";
	} else {
		return "none";
	};
	}
	function initialDate2(d,i){
	var date = new Date(d.Date);
	var m = month[date.getMonth()];

	if (m == "January") {
		this.parentElement.appendChild(this);
		return "#3c3c3c";
	} else {
		return "none";
	};
	}
	*/

	function filterType(mytype) {
			var ndata = dataset.filter(function(d) {
				return d["District.Sector"] == (mytype.toUpperCase());
			});
			drawViz(ndata);
			//console.log(ndata);

	}
});
