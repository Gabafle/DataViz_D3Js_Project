// Sector Chart Script
function initSectorChart(sectorData, tooltip) {
    const svgSect = d3.select("#sector-pie");
    const containerWidth = svgSect.node().parentElement.clientWidth;
    const wP = Math.min(containerWidth * 0.9, 950);
    const hP = Math.min(containerWidth * 0.5, 500);
    const radiusS = Math.min(wP, hP) * 0.3;
    const gSect = svgSect.append("g").attr("transform", `translate(${wP/2},${hP/2})`);
    const colorSect = d3.scaleOrdinal(d3.schemeTableau10);
    const pieS = d3.pie().value(d => d.value).sort(null).padAngle(0.02);
    const arcS = d3.arc().innerRadius(radiusS * 0.5).outerRadius(radiusS);
    const outerArcS = d3.arc().innerRadius(radiusS * 1.2).outerRadius(radiusS * 1.2);
    const pieDataS = pieS(sectorData);

    gSect.selectAll("path").data(pieDataS).enter().append("path")
        .attr("class", "sector-slice")
        .attr("d", arcS).attr("fill", (d, i) => colorSect(i))
        .on("mouseover", function(event, d) {
            d3.select(this).transition().duration(200).attr("d", d3.arc().innerRadius(radiusS * 0.5).outerRadius(radiusS + 10));
            tooltip.style("opacity", 1).html(`<b>${d.data.name}</b> : ${d.data.value}%`);
        })
        .on("mousemove", e => tooltip.style("left", (e.pageX + 10) + "px").style("top", (e.pageY - 20) + "px"))
        .on("mouseout", function() { d3.select(this).transition().duration(200).attr("d", arcS); tooltip.style("opacity", 0); });

    gSect.selectAll("polyline").data(pieDataS).enter().append("polyline").attr("class", "polyline")
        .attr("points", d => {
            const posA = arcS.centroid(d), posB = outerArcS.centroid(d), posC = outerArcS.centroid(d);
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            posC[0] = radiusS * 1.3 * (midangle < Math.PI ? 1 : -1);
            return [posA, posB, posC];
        });

    gSect.selectAll("text").data(pieDataS).enter().append("text").attr("class", "labelText")
        .attr("transform", d => {
            const pos = outerArcS.centroid(d);
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = radiusS * 1.35 * (midangle < Math.PI ? 1 : -1);
            return `translate(${pos})`;
        })
        .style("text-anchor", d => {
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return (midangle < Math.PI ? "start" : "end");
        })
        .text(d => `${d.data.value}%`);

    const sectLegend = d3.select("#sector-legend");
    sectorData.forEach((d, i) => {
        const item = sectLegend.append("div").attr("class", "legend-item");
        item.append("span").style("background", colorSect(i));
        item.append("div").text(d.name.replace(';', ' - '));
    });
}
