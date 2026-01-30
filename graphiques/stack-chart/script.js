// Stack Chart Script
function initStackChart(dataCSV, tooltip) {
    const svgStack = d3.select("#stack-chart");
    const containerWidth = svgStack.node().parentElement.clientWidth;
    const marginStack = {top: 20, right: 20, bottom: 40, left: 70};
    const wStack = Math.min(containerWidth * 0.9, 950) - marginStack.left - marginStack.right;
    const hStack = Math.min(containerWidth * 0.45, 450) - marginStack.top - marginStack.bottom;
    const gStack = svgStack.append("g").attr("transform", `translate(${marginStack.left},${marginStack.top})`);

    const stack = d3.stack().keys(["empreinte_menages", "empreinte_hors_menages"]);
    const series = stack(dataCSV);
    const colorStack = d3.scaleOrdinal().domain(["empreinte_menages", "empreinte_hors_menages"]).range(["#ff9800", "#1976d2"]);

    const xStack = d3.scaleLinear().domain(d3.extent(dataCSV, d=>d.annee)).range([0, wStack]);
    const yStack = d3.scaleLinear().domain([0, d3.max(dataCSV, d => d.empreinte_totale) * 1.1]).range([hStack, 0]);

    const areaStack = d3.area()
        .x(d => xStack(d.data.annee))
        .y0(d => yStack(d[0]))
        .y1(d => yStack(d[1]))
        .curve(d3.curveMonotoneX);

    gStack.selectAll("path")
        .data(series)
        .join("path")
        .attr("fill", d => colorStack(d.key))
        .attr("d", areaStack)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .attr("class", "stack-area")
        .on("mousemove", function(event, d) {
             const [mx] = d3.pointer(event, gStack.node());
             const year = Math.round(xStack.invert(mx));
             const row = dataCSV.find(e => e.annee === year);
             if(row) {
                 const keyName = d.key === "empreinte_menages" ? "Ménages" : "Entreprises & État";
                 const val = row[d.key];
                 const pct = ((val / row.empreinte_totale) * 100).toFixed(1);
                 tooltip.style("opacity", 1)
                    .html(`<b>${keyName} (${year})</b><br>${val.toLocaleString()} kt<br>${pct}% du total`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
             }
             d3.select(this).style("opacity", 0.9);
        })
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
            d3.select(this).style("opacity", 1);
        });

    gStack.append("g").attr("transform", `translate(0,${hStack})`).call(d3.axisBottom(xStack).tickFormat(d3.format("d")));
    gStack.append("g").call(d3.axisLeft(yStack));

    const legendStack = d3.select("#stack-legend");
    [{label:"Ménages (Direct)", color:"#ff9800"}, {label:"Hors-Ménages (Éco/Indus/Admin)", color:"#1976d2"}].forEach(d => {
        const item = legendStack.append("div").attr("class", "legend-item");
        item.append("span").style("background", d.color);
        item.append("div").text(d.label);
    });
}
