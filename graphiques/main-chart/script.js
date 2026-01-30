// Main Chart Script
function initMainChart(dataCSV, tooltip) {
    const svgLine = d3.select("#main-chart");
    const containerWidth = svgLine.node().parentElement.clientWidth;
    const wL = Math.min(containerWidth * 0.9, 900) - 100;
    const hL = Math.min(containerWidth * 0.45, 400) - 80;
    const gL = svgLine.append("g").attr("transform","translate(70,40)");
    const x = d3.scaleLinear().domain(d3.extent(dataCSV, d=>d.annee)).range([0,wL]);
    const yScales = {
        perCapita: d3.scaleLinear().domain([8, 13]).range([hL,0]),
        total: d3.scaleLinear().domain([0, d3.max(dataCSV, d => d.total) * 1.1]).range([hL,0])
    };
    let mode = "perCapita";
    const yAxis = gL.append("g");
    const xAxis = gL.append("g").attr("transform",`translate(0,${hL})`);

    function updateLine() {
        yAxis.transition().duration(800).call(d3.axisLeft(yScales[mode]));
        xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
        const line = d3.line().x(d=>x(d.annee)).y(d=>yScales[mode](d[mode])).curve(d3.curveMonotoneX);
        let path = gL.selectAll(".line-path").data([dataCSV]);
        path.enter().append("path").attr("class", "line-path").merge(path).transition().duration(800)
            .attr("fill","none").attr("stroke", mode==="perCapita"?"#2196F3":"#4CAF50").attr("stroke-width",3).attr("d",line);
        let dots = gL.selectAll(".dot").data(dataCSV);
        dots.enter().append("circle").attr("class", "dot").merge(dots).transition().duration(800)
            .attr("cx", d=>x(d.annee)).attr("cy", d=>yScales[mode](d[mode])).attr("r",5).attr("fill", mode==="perCapita"?"#FF9800":"#E91E63");
    }
    updateLine();

    d3.select("#modeSlider").on("click", function(){
        mode = mode === "perCapita" ? "total" : "perCapita";
        const isCapita = mode === "perCapita";
        d3.select("#sliderCircle").style("left", isCapita ? "3px" : "27px");
        d3.select("#modeSlider").classed("active-capita", isCapita).classed("active-total", !isCapita);
        d3.select("#label-capita").classed("active", isCapita);
        d3.select("#label-total").classed("active", !isCapita);
        d3.select("#main-title").text(`Empreinte carbone ${isCapita ? "par personne (tonne par personne)" : "totale (millions de tonnes)"} en france de 1990 à 2024`);
        updateLine();
    });
}
