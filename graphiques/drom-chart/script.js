// DROM Chart Script
function initDromChart(tooltip) {
    const locations = [
        { id: "Martinique", lat: 14.64, lon: -61.02 },
        { id: "Guyane", lat: 3.93, lon: -53.12 },
        { id: "Corse", lat: 42.03, lon: 9.01 },
        { id: "Reunion", lat: -21.11, lon: 55.53 },
        { id: "Guadeloupe", lat: 16.26, lon: -61.55 }
    ];

    const svg = d3.select("#drom-svg");
    const containerWidth = svg.node().parentElement.clientWidth;
    const mapWidth = Math.min(containerWidth * 0.95, 960);
    const mapHeight = mapWidth * 0.6;
    const scale = Math.min(mapWidth / 8, 180);
    const translateX = mapWidth / 2;
    const translateY = mapHeight / 2;
    
    const projection = d3.geoMercator().scale(scale).translate([translateX, translateY]);
    const colorScaleDrom = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 2100]);

    async function initDrom() {
        const csvPath = "./source/emission_france_drom_com_par_annee.csv";
        let rawData;

        try {
            const response = await fetch(csvPath);
            const text = await response.text();
            const separator = text.split('\n')[0].includes(';') ? ';' : ',';
            const csvData = d3.dsvFormat(separator).parse(text);

            rawData = csvData.map(d => {
                const keys = Object.keys(d);
                return { territory: d[keys[0]], year: +d[keys[1]], emissions: +d[keys[2]] };
            });

            const years = [...new Set(rawData.map(d => d.year))].filter(y => !isNaN(y)).sort();
            const minYear = years[0], maxYear = years[years.length-1];

            const slider = d3.select("#yearSliderDrom");
            slider.attr("min", minYear).attr("max", maxYear).attr("value", minYear);

            const worldData = await d3.json("https://unpkg.com/world-atlas@2/countries-110m.json");
            const countries = topojson.feature(worldData, worldData.objects.countries).features;

            svg.append("g").selectAll("path").data(countries).enter().append("path")
                .attr("class", "country").attr("d", d3.geoPath().projection(projection))
                .attr("fill", "#e9ecef").attr("stroke", "#adb5bd");

            function update(year) {
                d3.select("#year-display-drom").text(year);
                const yearData = rawData.filter(d => d.year == year);

                const circles = svg.selectAll(".drom-circle").data(locations, d => d.id);
                circles.exit().remove();

                circles.enter().append("circle").attr("class", "drom-circle")
                    .attr("cx", d => projection([d.lon, d.lat])[0])
                    .attr("cy", d => projection([d.lon, d.lat])[1])
                    .merge(circles)
                    .transition().duration(600)
                    .attr("r", 15)
                    .attr("fill", d => {
                        const record = yearData.find(e => e.territory.includes(d.id));
                        return record ? colorScaleDrom(record.emissions) : "#ccc";
                    })
                    .attr("opacity", 0.8);

                svg.selectAll(".drom-circle")
                    .on("mouseover", function(event, d) {
                        const record = yearData.find(e => e.territory.includes(d.id));
                        tooltip.style("opacity", 1).html(`<strong>${d.id}</strong><br>Émissions: ${record ? record.emissions : 'N/A'} tCO2`);
                    })
                    .on("mousemove", e => tooltip.style("left", (e.pageX + 10) + "px").style("top", (e.pageY - 20) + "px"))
                    .on("mouseout", () => tooltip.style("opacity", 0));
            }

            update(minYear);
            slider.on("input", function() { update(this.value); });

        } catch(e) { console.error("DROM Error:", e); }
    }
    initDrom();
}
