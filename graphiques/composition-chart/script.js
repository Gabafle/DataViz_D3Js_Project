// Composition Chart Script
function initCompositionChart(dataCSV, tooltip) {
    const svgComp = d3.select("#composition-chart");
    const containerWidth = svgComp.node().parentElement.clientWidth;
    const marginComp = {top: 40, right: 150, bottom: 40, left: 70};
    const wComp = Math.min(containerWidth * 0.9, 950) - marginComp.left - marginComp.right;
    const hComp = Math.min(containerWidth * 0.45, 450) - marginComp.top - marginComp.bottom;
    const gComp = svgComp.append("g").attr("transform", `translate(${marginComp.left},${marginComp.top})`);

    const dataStackBar = dataCSV.map(d => ({
        annee: d.annee,
        local: d.emissions_territoire,
        imported: Math.max(0, d.empreinte_totale - d.emissions_territoire)
    }));

    const subgroups = ["local", "imported"];
    const groups = dataStackBar.map(d => d.annee);

    const xComp = d3.scaleBand().domain(groups).range([0, wComp]).padding(0.2);
    const yComp = d3.scaleLinear().domain([0, d3.max(dataCSV, d => d.empreinte_totale) * 1.1]).range([hComp, 0]);
    const colorComp = d3.scaleOrdinal().domain(subgroups).range(['#3498db', '#e74c3c']);

    gComp.append("g").attr("transform", `translate(0,${hComp})`).call(d3.axisBottom(xComp).tickValues(xComp.domain().filter((d,i) => !(i%2))));
    gComp.append("g").call(d3.axisLeft(yComp));

    const stackedData = d3.stack().keys(subgroups)(dataStackBar);

    gComp.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => colorComp(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("class", "chart-bar")
        .attr("x", d => xComp(d.data.annee))
        .attr("y", d => yComp(d[1]))
        .attr("height", d => yComp(d[0]) - yComp(d[1]))
        .attr("width", xComp.bandwidth())
        .on("mouseover", function(event, d) {
            const subgroupName = d3.select(this.parentNode).datum().key;
            const subLabel = subgroupName === "local" ? "Émissions en France" : "Importations";
            const val = d[1] - d[0];
            const total = d.data.local + d.data.imported;
            const pct = ((val/total)*100).toFixed(1);

            tooltip.style("opacity", 1)
                .html(`<div class="tooltip-header">Année ${d.data.annee}</div>
                      <b>${subLabel}</b><br>
                      Volume: ${Math.round(val).toLocaleString()} kt<br>
                      Part: ${pct}% de l'empreinte`)
                .style("left", (event.pageX+10)+"px").style("top", (event.pageY-20)+"px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

    const legendComp = d3.select("#composition-legend");
    [{l:"Émissions Territoriales (France)", c:"#3498db"}, {l:"Importations", c:"#e74c3c"}].forEach(item => {
        const div = legendComp.append("div").attr("class", "legend-item");
        div.append("span").style("background", item.c);
        div.append("div").text(item.l);
    });
}
