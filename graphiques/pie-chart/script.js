// Pie Chart Script
function initPieChart(dataCSV, tooltip) {
    const svgPie = d3.select("#pie");
    const containerWidth = svgPie.node().parentElement.clientWidth;
    const wP = Math.min(containerWidth * 0.9, 950);
    const hP = Math.min(containerWidth * 0.5, 500);
    const radius = Math.min(wP, hP) * 0.25;
    const gPie = svgPie.append("g").attr("transform", `translate(${wP/2},${hP/2})`);
    const pie = d3.pie().value(d => d.value).sort(null).padAngle(0.02);
    const arc = d3.arc().innerRadius(radius * 0.4).outerRadius(radius);
    const outerArc = d3.arc().innerRadius(radius * 1.1).outerRadius(radius * 1.1);

    const yearSelector = d3.select("#yearSelector");
    dataCSV.forEach(d => yearSelector.append("option").attr("value", d.annee).text(d.annee));
    let currentYear = dataCSV[0].annee;

    function drawPie(data, isDetail = false) {
        d3.select("#backBtn").style("display", isDetail ? "block" : "none");
        const hasDetail = currentYear >= 2010;
        d3.select("#infoBubble").classed("inactive", !hasDetail);

        const pieData = pie(data);
        const paths = gPie.selectAll(".pie-slice").data(pieData, d => d.data.name);

        paths.exit().remove();
        paths.enter().append("path").attr("class", "pie-slice")
            .merge(paths).transition().duration(750)
            .attr("d", arc).attr("fill", d => d.data.color);

        gPie.selectAll(".pie-slice")
            .classed("clickable", d => !isDetail && d.data.name === "Importations" && hasDetail)
            .on("click", (event, d) => {
                if (!isDetail && d.data.name === "Importations" && hasDetail) drawPie(getImportDetail(currentYear), true);
            });

        const polylines = gPie.selectAll(".polyline-hist").data(pieData, d => d.data.name);
        polylines.exit().remove();
        polylines.enter().append("polyline").attr("class", "polyline polyline-hist").merge(polylines).transition().duration(750)
            .attr("points", d => {
                const posA = arc.centroid(d), posB = outerArc.centroid(d), posC = outerArc.centroid(d);
                posC[0] = radius * 1.18 * ( (d.startAngle + d.endAngle)/2 < Math.PI ? 1 : -1);
                return [posA, posB, posC];
            });

        const texts = gPie.selectAll(".label-pie").data(pieData, d => d.data.name);
        texts.exit().remove();
        texts.enter().append("text").attr("class", "labelText label-pie").merge(texts).transition().duration(750)
            .attr("transform", d => {
                const pos = outerArc.centroid(d);
                pos[0] = radius * 1.25 * ( (d.startAngle + d.endAngle)/2 < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            })
            .style("text-anchor", d => ( (d.startAngle + d.endAngle)/2 < Math.PI ? "start" : "end"))
            .text(d => `${d.data.name} : ${d.data.value} Mt`);

        const legend = d3.select("#pie-legend");
        legend.selectAll("*").remove();
        data.forEach(d => {
            const item = legend.append("div").attr("class", "legend-item");
            item.append("span").style("background", d.color);
            item.append("div").text(d.name);
        });
    }

    function getPieData(year) {
        const row = dataCSV.find(d => d.annee === +year);
        return [
            { name: "Émissions directes", value: Math.round(row.direct / 1000 * 10) / 10, color: "#1f77b4" },
            { name: "Production intérieure", value: Math.round(row.production / 1000 * 10) / 10, color: "#ff7f0e" },
            { name: "Importations", value: Math.round(row.imports / 1000 * 10) / 10, color: "#2ca02c" }
        ];
    }
    
    function getImportDetail(year) {
        const row = dataCSV.find(d => d.annee === +year);
        const importsNettes = Math.max(0, row.empreinte_totale - row.emissions_territoire);
        return [
            { name: "Usage Final", value: Math.round((importsNettes / 2) / 1000 * 10) / 10, color: "#98df8a" },
            { name: "Usage Intermédiaire", value: Math.round((importsNettes / 2) / 1000 * 10) / 10, color: "#2ca02c" }
        ];
    }

    drawPie(getPieData(currentYear));
    yearSelector.on("change", function() { currentYear = +this.value; drawPie(getPieData(currentYear)); });
    d3.select("#backBtn").on("click", () => drawPie(getPieData(currentYear)));
}
