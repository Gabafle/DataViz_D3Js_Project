// Gap Chart Script
function initGapChart(dataCSV, tooltip) {
    const svgGap = d3.select("#gap-chart");
    const containerWidth = svgGap.node().parentElement.clientWidth;
    const marginGap = {top: 40, right: 150, bottom: 40, left: 70};
    const wGap = Math.min(containerWidth * 0.9, 950) - marginGap.left - marginGap.right;
    const hGap = Math.min(containerWidth * 0.45, 450) - marginGap.top - marginGap.bottom;
    const gGap = svgGap.append("g").attr("transform", `translate(${marginGap.left},${marginGap.top})`);

    const xGap = d3.scaleLinear().domain(d3.extent(dataCSV, d=>d.annee)).range([0, wGap]);
    const yGap = d3.scaleLinear()
        .domain([0, d3.max(dataCSV, d => Math.max(d.emissions_territoire, d.empreinte_totale)) * 1.1])
        .range([hGap, 0]);

    gGap.append("g").attr("transform", `translate(0,${hGap})`).call(d3.axisBottom(xGap).tickFormat(d3.format("d")));
    gGap.append("g").call(d3.axisLeft(yGap));

    const areaGap = d3.area()
        .x(d => xGap(d.annee))
        .y0(d => yGap(d.emissions_territoire))
        .y1(d => yGap(d.empreinte_totale))
        .curve(d3.curveMonotoneX);

    gGap.append("path")
        .datum(dataCSV)
        .attr("fill", "#e57373")
        .attr("fill-opacity", 0.3)
        .attr("d", areaGap);

    const lineTerritoire = d3.line().x(d=>xGap(d.annee)).y(d=>yGap(d.emissions_territoire)).curve(d3.curveMonotoneX);
    const lineEmpreinte = d3.line().x(d=>xGap(d.annee)).y(d=>yGap(d.empreinte_totale)).curve(d3.curveMonotoneX);

    gGap.append("path").datum(dataCSV).attr("fill","none").attr("stroke","#43a047").attr("stroke-width",3).attr("d", lineTerritoire);
    gGap.append("path").datum(dataCSV).attr("fill","none").attr("stroke","#d32f2f").attr("stroke-width",3).attr("stroke-dasharray", "5,5").attr("d", lineEmpreinte);

    const legendDataGap = [
        {name: "Empreinte Totale (Consommation)", color: "#d32f2f", dashed: true},
        {name: "Émissions Territoriales (Production)", color: "#43a047", dashed: false},
        {name: "Déficit (Importations nettes)", color: "#e57373", rect: true}
    ];

    const legendGap = d3.select("#gap-legend");
    legendDataGap.forEach(d => {
        const item = legendGap.append("div").attr("class", "legend-item");
        item.append("span").style("background", d.rect ? d.color : "transparent")
            .style("border-bottom", d.rect ? "none" : `3px ${d.dashed ? 'dashed' : 'solid'} ${d.color}`)
            .style("height", d.rect ? "14px" : "0px").style("margin-bottom", d.rect ? "0" : "7px");
        item.append("div").text(d.name);
    });

    const hoverLine = gGap.append("line").attr("stroke", "#333").attr("stroke-dasharray", "2,2").style("opacity", 0);

    svgGap.on("mousemove", function(event) {
        const [mx] = d3.pointer(event, gGap.node());
        const year = Math.round(xGap.invert(mx));
        const d = dataCSV.find(e => e.annee === year);

        if (d) {
            hoverLine.attr("x1", xGap(year)).attr("x2", xGap(year)).attr("y1", 0).attr("y2", hGap).style("opacity", 1);
            const gapVal = d.empreinte_totale - d.emissions_territoire;

            tooltip.style("opacity", 1)
                .html(`
                    <div class="tooltip-header">Année ${d.annee}</div>
                    <span style="color:#d32f2f">●</span> Empreinte: ${d.empreinte_totale.toLocaleString()} kt<br>
                    <span style="color:#43a047">●</span> Territoire: ${d.emissions_territoire.toLocaleString()} kt<br>
                    <b>Différence: +${Math.round(gapVal).toLocaleString()} kt</b>
                `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 20) + "px");
        }
    }).on("mouseout", () => {
        tooltip.style("opacity", 0);
        hoverLine.style("opacity", 0);
    });
}
