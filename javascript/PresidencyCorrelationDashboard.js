//load data
d3.queue()
  .defer(d3.csv, "data/CorrelationApporval_topic.csv")
  .defer(d3.csv, "data/Scatter_Polls_Topics_Pesidency.csv")
  .await(function(error, file1, file2) {
            if (error) {
                console.error('Oh dear, something went wrong: ' + error);
            }
            else {
                dashboardCorrPresidency('#dashboardCorrelationPresid', file1, file2);
            }
        });

function dashboardCorrPresidency(id, topicData, corrData){
    var barColorRight = "tomato";
    var barColorLeft = "dodgerblue";

    function topHist(histData){
        // hist dimensions
        var TopHg={},    TopHgDim = {t: 50, r: 10, b: 90, l: 10};
        TopHgDim.w = 500 - TopHgDim.l - TopHgDim.r, 
        TopHgDim.h = 300 - TopHgDim.t - TopHgDim.b;

        // create the svg for the top Hist
        var TopHgSVG = d3.select(id).append("svg")
                         .attr("width", TopHgDim.w + TopHgDim.l + TopHgDim.r)
                         .attr("height", TopHgDim.h + TopHgDim.t + TopHgDim.b)
                         .attr("class", "topHistP").append("g")
                         .attr("transform", "translate(" + TopHgDim.l + "," + TopHgDim.t + ")");

        // create scale in x
        var x = d3.scale.ordinal()
        				.rangeRoundBands([0, TopHgDim.w], 0.1)
                  		.domain(histData.map(function(d) { return d[0]; }));

        TopHgSVG.append("g")
                .attr("class", "THxP axisP")
                .attr("transform", "translate(0," + (TopHgDim.h+10) + ")")
                .call(d3.svg.axis().scale(x).orient("bottom"))
                .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");

        // Create function for y-axis map.
        var ymax = d3.max(histData, function(d) { return Math.max(d[1],d[2]); });
        var ymin = d3.min(histData, function(d) { return Math.min(d[1],d[2]); });
        var y = d3.scale.linear()
        				.range([TopHgDim.h, 0])
                		.domain([ymin, ymax]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = TopHgSVG.selectAll(".barP").data(histData).enter()
                           .append("g")
                           .attr("class", "barP");

        // create the rectangles Left
        var baseline_h = TopHgDim.h*(Math.abs(ymax)/(Math.abs(ymax)+Math.abs(ymin)));
        bars.append("rect")
            .attr("x", function(d) { return x(d[0])-x.rangeBand()/4; })
            .attr("y", function(d) {
            				if(d[1] >= 0){return y(d[1]);}
            				else if(d[1] < 0){return baseline_h;}	
            			})
            .attr("width", x.rangeBand()/2)
            .attr("height", function(d) { 
            					if(d[1] >= 0){return baseline_h - y(d[1]);}
            					else if(d[1] < 0){return y(d[1])-baseline_h}
            				})
            .attr('fill',barColorLeft)
            .on("mouseover",mouseover_L)// mouseover is defined below.
            .on("mouseout",mouseout_L);// mouseout is defined below.
        
        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(".2f")(d[1])})
            .attr("x", function(d) { return x(d[0])-x.rangeBand()/4+x.rangeBand()/8; })
            .attr("y", function(d) { 
            				if(d[1] >= 0){return y(d[1])-5;}
            				else if(d[1] < 0){return y(d[1])+10;} })
            .attr("text-anchor", "middle")
            .attr("font-size","8px")
            .attr("font-family","sans-serif");
        
        // create the rectangles Right
        bars.append("rect")
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/4; })
            .attr("y", function(d) { 
            				if(d[2] >= 0){return y(d[2]);}
            				else if(d[2] < 0){return baseline_h;} 
            			})
            .attr("width", x.rangeBand()/2)
            .attr("height", function(d) { 
            					if(d[2] >= 0){return baseline_h - y(d[2]);}
            					else if(d[2] < 0){return y(d[2]) - baseline_h} 
            				})
            .attr('fill',barColorRight)
            .on("mouseover",mouseover_R)// mouseover is defined below.
            .on("mouseout",mouseout_R);// mouseout is defined below.

        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(".2f")(d[2])})
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/4+x.rangeBand()/8; })
            .attr("y", function(d) { 
            				if(d[2] >= 0){return y(d[2])-5;}
            				else if(d[2] < 0){return y(d[2])+10;}
            			 })
            .attr("text-anchor", "middle")
            .attr("font-size","8px")
            .attr("font-family","sans-serif");

        //add legend
        var legDim = 10;
        var pad = 120;
        var space = 3;
        var legTHR = TopHgSVG.append("rect")
                            .attr("x",TopHgDim.l+TopHgDim.w-2*pad)
                            .attr("y",-50)
                            .attr("width",legDim)
                            .attr("height",legDim)
                            .attr("fill",barColorRight)
        var legRtext = TopHgSVG.append("text")
                                .attr("class", "LeftP HlegP")
                                .attr("text-anchor", "left")
                                .attr("x", TopHgDim.l+TopHgDim.w-2*pad+legDim+space)
                                .attr("y", -50 + legDim)
                                .text("Right Troll Spearman"); 

        var legTHL = TopHgSVG.append("rect")
                            .attr("x",TopHgDim.l+TopHgDim.w-pad)
                            .attr("y", -50)
                            .attr("width",legDim)
                            .attr("height",legDim)
                            .attr("fill",barColorLeft)
        var legRtext = TopHgSVG.append("text")
                                .attr("class", "LeftP HlegP")
                                .attr("text-anchor", "left")
                                .attr("x", TopHgDim.l+TopHgDim.w-pad+legDim+space)
                                .attr("y", -50 + legDim)
                                .text("Left Troll Spearman");

        //add plot title
        var titleTH = TopHgSVG.append("text")
                                .attr("class", "plotTitleP")
                                .attr("text-anchor", "middle")
                                .attr("x", TopHgDim.l+TopHgDim.w/2)
                                .attr("y", -20)
                                .text("Spearman Coefficent of Trump Approval Rate vs Tweet Number per Topic");


        function mouseover_R(d){  // utility function to be called on mouseover of right column
            scat.updateScatter(d[0], "Right", "approve")
        }
        
        function mouseout_R(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            
        } 

        function mouseover_L(d){  // utility function to be called on mouseover of Left column
            scat.updateScatter(d[0], "Left", "approve")
        }
        
        function mouseout_L(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            
        } 
        return TopHg;           
    }

    function botHist(histData){
        var BotHg={},    BotHgDim = {t: 60, r: 0, b: 90, l: 10};
        BotHgDim.w = 500 - BotHgDim.l - BotHgDim.r, 
        BotHgDim.h = 300 - BotHgDim.t - BotHgDim.b;

        // create the svg for the top Hist
        var BotHgSVG = d3.select(id).append("svg")
                         .attr("width", BotHgDim.w + BotHgDim.l + BotHgDim.r)
                         .attr("height", BotHgDim.h + BotHgDim.t + BotHgDim.b)
                         .attr("class", "botHistP").append("g")
                         .attr("transform", "translate(" + BotHgDim.l + "," + BotHgDim.t + ")");

        // create scale in x
        var x = d3.scale.ordinal().rangeRoundBands([0, BotHgDim.w], 0.1)
                  .domain(histData.map(function(d) { return d[0]; }));

        BotHgSVG.append("g")
                .attr("class", "THxP axisP")
                .attr("transform", "translate(0," + (BotHgDim.h+10) + ")")
                .call(d3.svg.axis().scale(x).orient("bottom"))
                .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");

        // Create function for y-axis map.
        var ymax = d3.max(histData, function(d) { return Math.max(d[1],d[2]); });
        var ymin = d3.min(histData, function(d) { return Math.min(d[1],d[2]); });
        var y = d3.scale.linear()
        				.range([BotHgDim.h, 0])
                		.domain([ymin, ymax]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = BotHgSVG.selectAll(".barP").data(histData).enter()
                           .append("g")
                           .attr("class", "barP");

        // create the rectangles Left
        var baseline_h = BotHgDim.h*(Math.abs(ymax)/(Math.abs(ymax)+Math.abs(ymin)));
        bars.append("rect")
            .attr("x", function(d) { return x(d[0])-x.rangeBand()/4; })
            .attr("y", function(d) { 
            				if(d[1] >= 0){return y(d[1]);}
            				else if(d[1] < 0){return baseline_h;}
            			 })
            .attr("width", x.rangeBand()/2)
            .attr("height", function(d) { 
            					if(d[1] >= 0){return baseline_h - y(d[1]);}
            					else if(d[1] < 0){return y(d[1])-baseline_h}
            				})
            .attr('fill',barColorLeft)
            .on("mouseover",mouseover_L)// mouseover is defined below.
            .on("mouseout",mouseout_L);// mouseout is defined below.
        
        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(".2f")(d[1])})
            .attr("x", function(d) { return x(d[0])-x.rangeBand()/4+x.rangeBand()/8; })
            .attr("y", function(d) { 
            				if(d[1] >= 0){return y(d[1])-5;}
            				else if(d[1] < 0){return y(d[1])+10;}
            			 })
            .attr("text-anchor", "middle")
            .attr("font-size","8px")
            .attr("font-family","sans-serif");
        
        // create the rectangles Right
        bars.append("rect")
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/4; })
            .attr("y", function(d) { 
            				if(d[2] >= 0){return y(d[2]);}
            				else if(d[2] < 0){return baseline_h;}
            			 })
            .attr("width", x.rangeBand()/2)
            .attr("height", function(d) { 
            					if(d[2] >= 0){return baseline_h - y(d[2]);}
            					else if(d[2] < 0){return y(d[2])-baseline_h}
            				})
            .attr('fill',barColorRight)
            .on("mouseover",mouseover_R)// mouseover is defined below.
            .on("mouseout",mouseout_R);// mouseout is defined below.

        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(".2f")(d[2])})
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/4+x.rangeBand()/8; })
            .attr("y", function(d) { 
            				if(d[2] >= 0){return y(d[2])-5;}
            				else if(d[2] < 0){return y(d[2])+10;}
            			 })
            .attr("text-anchor", "middle")
            .attr("font-size","8px")
            .attr("font-family","sans-serif");

        //add plot title
        var titleTH = BotHgSVG.append("text")
                                .attr("class", "plotTitleP")
                                .attr("text-anchor", "middle")
                                .attr("x", BotHgDim.l+BotHgDim.w/2)
                                .attr("y", -20)
                                .text("Spearman Coefficent of Trump Disapproval Rate vs Tweet Number per Topic");

        function mouseover_R(d){  // utility function to be called on mouseover of right column
            scat.updateScatter(d[0], "Right", "disapprove")
        }
        
        function mouseout_R(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            
        } 

        function mouseover_L(d){  // utility function to be called on mouseover of Left column
            scat.updateScatter(d[0], "Left", "disapprove")
        }
        
        function mouseout_L(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            
        } 
        return BotHg;          
    }

    function scatter(scatterData){
        var scat={},    scatDim = {t: 60, r: 0, b: 60, l: 60};
        scatDim.w = 500 - scatDim.l - scatDim.r, 
        scatDim.h = 500 - scatDim.t - scatDim.b;

        // initial values displayed in scatter plot
        var topicDisp = "Hillary";
        var trollDisp = "Right";
        var pollDisp = "approve";

        //console.log(scatterData[0][["adjpoll_trump"]]);

        var scatSVG = d3.select(id).append("svg")
                        .attr("width", scatDim.w+scatDim.l+scatDim.r)  
                        .attr("height", scatDim.h+scatDim.b+scatDim.t) 
                        .attr("transform", "translate(" + scatDim.l + "," + scatDim.t + ")")
                        .attr("class", "scatPlotP");  

        var xScale =  d3.scale.linear()
                           .range([scatDim.l, scatDim.w+scatDim.l])
                           .domain([d3.min(scatterData, function(d) {return +d["adjusted_"+pollDisp]; }), d3.max(scatterData, function(d) { return +d["adjusted_"+pollDisp]; })]);

        var yScale =  d3.scale.linear()
                           .range([scatDim.h+scatDim.t, scatDim.t])
                           .domain([d3.min(scatterData, function(d) {return +d[topicDisp+"_"+trollDisp+"Troll"]; }), d3.max(scatterData, function(d) { return +d[topicDisp+"_"+trollDisp+"Troll"]; })]); 
        
        scatXAxis = d3.svg.axis().scale(xScale).orient("bottom");
        scatSVG.append("g").attr("class","xP scatAxisP")
               .attr("transform", "translate(0,"+ (scatDim.h+scatDim.t) + ")")
               .call(scatXAxis);
        
        scatYAxis = d3.svg.axis().scale(yScale).orient("left")
        scatSVG.append("g").attr("class","yP scatAxisP")
               .attr("transform", "translate(" + scatDim.l + ",0)")
               .call(scatYAxis);

        var points = scatSVG.selectAll(".pointP")
                            .data(scatterData)
                            .enter()
                            .append("g")
                            .attr("class","pointP");

        points.append("circle")
              .attr("cx", function(d){return xScale(d["adjusted_"+pollDisp]);})
              .attr("cy", function(d){return yScale(d[topicDisp+"_"+trollDisp+"Troll"]);})
              .attr("r",3);

        //add label to axes
        var xlabel = scatSVG.append("text")
            .attr("class", "xP labelP")
            .attr("text-anchor", "middle")
            .attr("x", (scatDim.w+scatDim.l)/2)
            .attr("y", (scatDim.h+scatDim.t+35))
            .text(pollDisp + " Rate [%]");
        var ylabel = scatSVG.append("text")
            .attr("class", "yP labelP")
            .attr("text-anchor", "middle")
            .attr("x", -(scatDim.h+scatDim.t)/2)
            .attr("y", 12)
            .attr("transform", "rotate(-90)")
            .text("Number of " + trollDisp + " Tweet about " + topicDisp);


        scat.updateScatter = function(topic, troll, poll){
            var trans_time = 1000;
            //topic[0].toUpperCase()
            // update scale
            xScale.domain([d3.min(scatterData, function(d) {return +d["adjusted_"+poll]; }), d3.max(scatterData, function(d) { return +d["adjusted_"+poll]; })]);
            yScale.domain([d3.min(scatterData, function(d) {return +d[topic+"_"+troll+"Troll"]; }), d3.max(scatterData, function(d) { return +d[topic+"_"+troll+"Troll"]; })]);

            //change data value for points
            points.select("circle").transition().duration(1000)
                  .attr("cx", function(d){return xScale(d["adjusted_"+poll]);})
                  .attr("cy", function(d){return yScale(d[topic+"_"+troll+"Troll"]);})
                  .attr("r",3);

            xlabel.text(poll + " Rate [%]");
            ylabel.text("Number of " + troll + " Tweet about " + topic);
            
            scatXAxis.scale(xScale);
            scatSVG.select(".xP")
                   .transition().duration(trans_time)
                   .call(scatXAxis);

            scatYAxis.scale(yScale);
            scatSVG.select(".yP")
                   .transition().duration(trans_time)
                   .call(scatYAxis);
        }
        return scat;
    }

    /* DEFINE DATA TO CREATE HIST AND SCATTER*/
    var tHData = topicData.map(function(d){return [d.topic, +d.Al, +d.Ar];});
    var bHData = topicData.map(function(d){return [d.topic, +d.Dl, +d.Dr];});
    //var sData = corrData.map(function(d){return [d.date,+d[]]})

    var tHG = topHist(tHData); // create the Top Histogram.
    var bHG = botHist(bHData); // create the Bottom Histogram.
    var scat = scatter(corrData);  // create the Scatter.
}