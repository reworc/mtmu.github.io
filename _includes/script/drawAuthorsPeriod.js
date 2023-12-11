// draw a special bar plot visualizing the time between fist and last publication with a co-author
// bars start at the first year and end at te last year
// bars have circle at the start and the end, so that co-authors who appear only once are visible
const drawAuthorPeriod = (url, elementId) => {
  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 30, bottom: 70, left: 150 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  const svg = d3
    .select(elementId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Parse the Data
  d3.json(url).then(function (data) {
    var dict = new Map();

    data.years.forEach((y) => {
      y.elements.forEach((e) => {
        var authors = extractAuthors(e.authors);
        authors.forEach((a) => {
          if (dict.has(a)) {
            let entry = dict.get(a);
            dict.set(a, {
              number: entry.number + 1,
              minYear: Number(y.name),
              maxYear: Number(entry.maxYear),
            });
          } else {
            dict.set(a, {
              number: 1,
              minYear: Number(y.name),
              maxYear: Number(y.name),
            });
          }
        });
      });
    });

    dict.delete("Mathias Müller");
    const sorted = new Map([...dict].sort((a, b) => a[0].localeCompare(b[0])));
    const maxYear = Array.from(sorted.values())
      .map((v) => v.maxYear)
      .max();
    const minYear = Array.from(sorted.values())
      .map((v) => v.minYear)
      .min();

    // X axis: start half a year early so that teh circle does not overlap the y-axis
    let x = d3
      .scaleLinear()
      .domain([minYear - 0.5, maxYear])
      .range([0, width]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(maxYear - minYear)
          .tickFormat(d3.format("d"))
      )
      .selectAll("text")
      .attr("transform", "translate(-10,5)rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    const y = d3
      .scaleBand()
      .range([0, height])
      .domain(Array.from(sorted.keys()))
      .padding(0.2);

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("transform", "translate(-5,0)");

    // Bars
    svg
      .selectAll("mybar")
      .data(Array.from(sorted))
      .join("rect")
      .attr("x", (d) => x(d[1].minYear))
      .attr("y", (d) => y(d[0]))
      .attr("height", y.bandwidth())
      .attr("width", (d) => x(d[1].maxYear) - x(d[1].minYear))
      .attr("fill", barColor2);

    const circleRadius = 0.5 * y.bandwidth();

    // Circles of variable 1
    svg
      .selectAll("mycircle")
      .data(Array.from(sorted))
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d[1].minYear))
      .attr("cy", (d) => y(d[0]) + circleRadius)
      .attr("r", `${circleRadius}`)
      .style("fill", circleColor)
      .style("stroke", circleOutline)
      .style("stroke-width", "2");

    // Circles of variable 2
    svg
      .selectAll("mycircle")
      .data(Array.from(sorted))
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d[1].maxYear))
      .attr("cy", (d) => y(d[0]) + circleRadius)
      .attr("r", `${circleRadius}`)
      .style("fill", circleColor)
      .style("stroke", circleOutline)
      .style("stroke-width", "2");
  });
};
