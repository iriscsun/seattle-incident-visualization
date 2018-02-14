function beBoundless() {
    console.log("hello world");
}
beBoundless();


$(function () {

    var width = 700,
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
        .scale(110000)
        .rotate([122.33, 0])
        .center([0, 47.6062])
        .translate([width / 2, height / 2]);

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
            sector = d["District.Sector"]
        });


        dataset = data
        drawViz(dataset);
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
            .attr("fill", "#5e81fd")
            .attr("stroke", "#3c3c3c")
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
                d3.select("h2").html("");
                d3.select(this).attr("class", "incident");
            })
            .attr("d", geoPath);



            circle.exit().remove();
            console.log("finished drawing")
        }
    
    //create slider
    d3.select("#timeslide").on("input", function () {
        updateMonth(+this.value);
    });
    d3.selectAll(".myCheckbox").on("change", update)

    d3.select("#form-select").on('change', function() {
        filterType(this.value);
    });
    
   
    
    var currentMonth = "January";
    var currentSector = null;

    var newData;
    var choices = [];

    function filterType(mytype) {
        console.log(mytype)
        currentSector = mytype.toUpperCase();
        update();

    }
    function update(){
        
        d3.selectAll(".myCheckbox").each(function(d){
          cb = d3.select(this);
          if(cb.property("checked")){
            choices.push(cb.property("value"));
          }
        });
        
        if(choices.length > 0){
            //filter for clearance group
            newData = dataset.filter(function(d){ 
            var type = d[ "Event.Clearance.Group" ].toLowerCase()//.substr(0,d["Event.Clearance.Group"].indexOf(' '));
            return choices.includes( type );
            
            });
            
            newData = newData.filter(function(d){
                var date = new Date(d.Date);
                var m = month[date.getMonth()]; 

                return currentMonth.includes(m);
            })
           
            newData = newData.filter(function(d){
                return d["District.Sector"].includes(currentSector);
            })
            } else {
                newData = dataset;    
                newData = newData.filter(function(d){
                    //console.log(d[District.Sector])
                    return d["District.Sector"].includes(currentSector);
                })
                newData = newData.filter(function(d){
                    var date = new Date(d.Date);
                    var m = month[date.getMonth()]; 
    
                    return currentMonth.includes(m); 
                })
            } 
            console.log(newData)
        drawViz(newData);
        
    }
    // update the fill of each SVG of class "incident" with value
    function updateMonth(value) {
        document.getElementById("range").innerHTML = month[value];
    
        var target = month[value];
        //console.log(target);
        currentMonth = target;
        update();
        //console.log(currentMonth);
        //update();
        
       
        //console.log(newData);
        //drawViz(newData);
        //  d3.selectAll(".incident")
        //      .attr("fill", dateMatch)
        //      .attr("stroke", dateMatch2);
    }


    //CHECKBOXES
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

    // //remove other data points
    // function dateMatch2(data, value) {
    //     var date = new Date(data.Date);
    //     var m = month[date.getMonth()];

    //     if (inputValue == m) {
    //         this.parentElement.appendChild(this);
    //         return "#3c3c3c";
    //     } else {
    //         return "none";
    //     };
    // }

    // //initial viZ
    // function initialDate(d, i) {
    //     var date = new Date(d.Date);
    //     var m = month[date.getMonth()];

    //     if (m == "January") {
    //         this.parentElement.appendChild(this);
    //         return "#5e81fd";
    //     } else {
    //         return "none";
    //     };
    // }
   
    //uncheck all
    var checkboxes = document.getElementsByTagName('input');

    for (var i=0; i<checkboxes.length; i++)  {
        if (checkboxes[i].type == 'checkbox')   {
            checkboxes[i].checked = false;
        }
    }
});