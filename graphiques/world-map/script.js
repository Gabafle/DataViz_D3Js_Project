// World Map Script
function initWorldMap(dataMap, world, tooltip) {
    const svgMap = d3.select("#world-map");
    const containerWidth = svgMap.node().parentElement.clientWidth;
    const mapWidth = Math.min(containerWidth * 0.95, 900);
    const mapHeight = mapWidth * 0.55;
    const scale = Math.min(mapWidth / 8, 150);
    const translateX = mapWidth / 2;
    const translateY = mapHeight / 2;
    
    const projection = d3.geoMercator().scale(scale).translate([translateX, translateY]);
    const pathGenerator = d3.geoPath().projection(projection);
    const colorScaleMap = d3.scaleSequential(d3.interpolateRdYlGn).domain([d3.max(dataMap, d => d.valeur), 0]);
    d3.select("#map-gradient").style("background", `linear-gradient(to right, ${d3.interpolateRdYlGn(1)}, ${d3.interpolateRdYlGn(0)})`);

    const countries = topojson.feature(world, world.objects.countries).features;
    const dataMapDict = {};
    dataMap.forEach(d => { dataMapDict[d.pays] = d.valeur; });
    const nameFixes = { "United States of America": "USA", "Saudi Arabia": "Arabie saoudite", "Germany": "Allemagne", "Russia": "Russie", "China": "Chine", "France": "France", "Turkey": "Turquie", "Luxembourg": "Luxembourg" };

    svgMap.append("g").selectAll("path").data(countries).enter().append("path")
        .attr("class", "country")
        .attr("d", pathGenerator)
        .attr("fill", d => {
            const name = nameFixes[d.properties.name] || d.properties.name;
            const val = dataMapDict[name];
            return val ? colorScaleMap(val) : "#eee";
        })
        .on("mouseover", (event, d) => {
            const name = nameFixes[d.properties.name] || d.properties.name;
            const val = dataMapDict[name];
            tooltip.style("opacity", 1).html(`<b>${name}</b><br>${val ? val + " t CO2 éq/pers" : "N/A"}`)
                    .style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
}
