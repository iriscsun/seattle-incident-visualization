function beBoundless() {
    console.log("hello world");
}
beBoundless();


$(function () {

    var width = 650,
        height = 580;
    var dataset;

    var inputValue = null;
    var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var svg = d3.select('#svg')
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    var g = svg.append('g');

    //set projection
    var projection = d3.geoAlbers()
        .scale(130000)
        .rotate([122.33, 0])
        .center([0, 47.6180])
        .translate([width / 2.2, height / 2]);

    var geoPath = d3.geoPath()
        .projection(projection);

    //set path
    g.selectAll("path")
        .data(neighborhoods_json.features)
        .enter()
        .append("path")
        .attr('fill', 'none')
        .attr("stroke", "#696969")
        .attr('d', geoPath);

    //add data points
    d3.csv("data/clean-data.csv", function (error, data) {
        data.forEach(function (d) {
            d.Latitude = +d.Latitude;
            d.Longitude = +d.Longitude;
            group = d["Event.Clearance.Group"];
            date = d["Date"];
        });

        dataset = data
        initialState();
    });

    function drawViz(data) {
        var incidents = svg.append("g");
        d3.selectAll("circle").remove();
        circle = incidents.selectAll("circle")
            .data(data);

            circle.attr("class", "update")

            circle.enter().append("circle")
            .attr("class", "enter")
            .attr("cx", function (d) {
                var coords = projection([d.Longitude, d.Latitude])
                return coords[0]
            })
            .attr("cy", function (d) {
                var coords = projection([d.Longitude, d.Latitude])
                return coords[1]
            })
            .attr("r", 3)
            .attr("d", geoPath)
            .attr("fill", "#E15759")
						.attr("stroke", "#910000")
						.attr("opacity", '0.3')
						.attr("stroke-opacity",'0.1')
            //mouse over event
            .on("mouseover", function (d) {
                d3.select("p").html("<b>Block Location: </b>" + d["Hundred.Block.Location"] + "\n"
                    + "<b>Zone/Beat: </b>" + d["Zone.Beat"] + "\n"
                    + "<b>Group Description: </b>" + d["Event.Clearance.Description"] + "\n"
                    + "<b>At Scene Date: </b>" + d["Date"] + "\n"
                    + "<b>At Scene Time: </b>" + d["Time"]);
                d3.select(this).attr("class", "incident hover");
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("class", "incident");
            })
            .attr("d", geoPath);

            circle.exit().remove();

						document.getElementById("crime-count").innerHTML = data.length;
            console.log("finished drawing")
        }

    //create slider
    d3.select("#timeslide").on("input", function () {
        update(+this.value);
    });
    d3.selectAll(".myCheckbox").on("change", updateCheck)

    d3.select("#form-select").on('change', function() {
        filterType(this.value);
    });

    var currentMonth = "January";
    var currentSector = "ALL";

    function updateMonth(value){
        var date = new Date(d.Date);
        var m = month[date.getMonth()];

        currentMonth = m;
    }
    var newData;
    var choices = [];

    d3.select("#form-select").on('change', function() {
        filterType(this.value);
    });

    function filterType(mytype) {
        currentSector = mytype.toUpperCase();
        console.log(currentSector)
        updateCheck();

    }
    function initialState(){
            newData = dataset.filter(function(d){
                var date = new Date(d.Date);
                var m = month[date.getMonth()];

                return currentMonth.includes(m);
            });
            drawViz(newData)

    }

		//handles any filter event to redraw visualization
    function updateCheck(){
        var choices = [];
        d3.selectAll(".myCheckbox").each(function(d){
          cb = d3.select(this);
          if(cb.property("checked")){
            choices.push(cb.property("value"));
          }
        });

            if(currentSector == "ALL" && choices.length < 0){
                console.log("current sector is null!")
                newData = dataset.filter(function(d){
                var date = new Date(d.Date);
                var m = month[date.getMonth()];

                return currentMonth.includes(m);
                });
            }else if(currentSector == "ALL" && choices.length > 0){
                console.log("current sector is runnig both sector and choices!")
                newData = dataset.filter(function(d){return choices.includes(d["Event.Clearance.Group"].toLowerCase());
                });


                newData = newData.filter(function(d){
                var date = new Date(d.Date);
                var m = month[date.getMonth()];

                return currentMonth.includes(m);
                })

            }else if(currentSector != "ALL"){
                newData = dataset;
                console.log("choosing a sector")

                //draw month
                newData = newData.filter(function(d){
                    var date = new Date(d.Date);
                    var m = month[date.getMonth()];

                    return currentMonth.includes(m);
                })

                //draw sector
                newData = newData.filter(function(d){console.log(d["District.Sector"] + currentSector);return currentSector.includes(d["District.Sector"]);
                });

                if(choices.length > 0){
                    newData = newData.filter(function(d){return choices.includes(d["Event.Clearance.Group"].toLowerCase());
                    });
                }
            }else if (currentSector != "ALL" && choices.length >0){
                console.log("SELECTED SECTOR AND MORE CHECKBOXES")

                newData = dataset.filter(function(d){return choices.includes(d["Event.Clearance.Group"].toLowerCase());
                });

                newData = newData.filter(function(d){
                    var date = new Date(d.Date);
                    var m = month[date.getMonth()];

                    return currentMonth.includes(m);
                })

                newData = newData.filter(function(d){return currentSector.includes(d["District.Sector"]);
                });
            }
            else {
                console.log(choices.length);
                console.log("running the final else")
                console.log(dataset)
                //filter new month
                if(currentMonth != "All"){
                    newData = dataset.filter(function(d){
                        var date = new Date(d.Date);
                        var m = month[date.getMonth()];

                        return currentMonth.includes(m);
                    });
                }
              }

        drawViz(newData);

    }
    // update the fill of each SVG of class "incident" with value
    function update(value) {
        document.getElementById("range").innerHTML = month[value];

        var target = month[value];

        currentMonth = target;
        updateCheck();

    }

    //uncheck all
    var checkboxes = document.getElementsByTagName('input');

    for (var i=0; i<checkboxes.length; i++)  {
        if (checkboxes[i].type == 'checkbox')   {
            checkboxes[i].checked = false;
        }
    }
});
