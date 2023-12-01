const drawKeywordsDonut = (url, elementId) => {
  const width = 800,
    height = 480,
    margin = 80;

  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  const radius = Math.min(width, height) / 2 - margin;

  const labelRadiusMultiplyer = 1.4;

  // append the svg object to the div called 'my_dataviz'
  const svg = d3
    .select(elementId)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Parse the Data
  d3.json(url).then(function (data) {
    var dict = new Map();

    data.years.forEach((y) => {
      y.elements.forEach((e) => {
        var keywords = e.keywords;
        keywords.forEach((k) => {
          if (dict.has(k)) {
            let num = dict.get(k);
            dict.set(k, num + 1);
          } else {
            dict.set(k, 1);
          }
        });
      });
    });

    let others = { key: "sonstige", value: 0, keywords: [] };

    dict.forEach((v, k) => {
      if (v < 4) {
        others.value = others.value + 1;
        others.keywords.push(k);
      }
    });

    // dict.set(others.key, others.value);

    others.keywords.forEach((k) => {
      dict.delete(k);
    });

    console.log(others);

    const sorted = new Map([...dict].sort((a, b) => a[0].localeCompare(b[0])));
    const maxNum = Array.from(sorted.values()).max();

    // set the color scale
    const color = d3
      .scaleOrdinal()
      .domain(Array.from(sorted.keys()))
      .range(d3.schemeDark2);

    // Compute the position of each group on the pie:
    const pie = d3
      .pie()
      .sort(null) // Do not sort group by size
      .value((d) => d[1]);
    const data_ready = pie(Array.from(sorted));

    // The arc generator
    const arc = d3
      .arc()
      .innerRadius(radius * 0.5) // This is the size of the donut hole
      .outerRadius(radius * 0.8);

    // Another arc that won't be drawn. Just for labels positioning
    const outerArc = d3
      .arc()
      .innerRadius(radius * labelRadiusMultiplyer)
      .outerRadius(radius * labelRadiusMultiplyer);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll("allSlices")
      .data(data_ready)
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data[1]))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7);

    // Add the polylines between chart and labels:
    svg
      .selectAll("allPolylines")
      .data(data_ready)
      .join("polyline")
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr("points", function (d) {
        let posA = arc.centroid(d); // line insertion in the slice
        posA[0] *= 1.15;
        posA[1] *= 1.15;
        const posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
        const posC = outerArc.centroid(d); // Label position = almost the same as posB
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] =
          radius *
          (labelRadiusMultiplyer * 1.025) *
          (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC];
      });

    // Add the polylines between chart and labels:
    svg
      .selectAll("allLabels")
      .data(data_ready)
      .join("text")
      .text((d) => `${d.data[0]} [${d.data[1]}]`)
      .attr("transform", function (d) {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] =
          radius *
          (labelRadiusMultiplyer * 1.05) *
          (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", function (d) {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midangle < Math.PI ? "start" : "end";
      });

    // Add labels with the number count on th arc:
    svg
      .selectAll("allLabels")
      .data(data_ready)
      .join("text")
      .text((d) => `${d.data[1]}`)
      .attr("transform", function (d) {
        const pos = arc.centroid(d);
        //const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        //pos[0] = radius * (labelRadiusMultiplyer * 1.05) * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .style("font-weight", "700")
      .style("fill", "#fff");
  });
};
