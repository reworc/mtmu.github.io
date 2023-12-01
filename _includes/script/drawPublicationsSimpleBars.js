/// draw d3.js bar plot of publications
const drawPublications = (url, elementId) => {
  // set the dimensions and margins of the graph
  const margin = { top: 50, right: 30, bottom: 30, left: 30 },
    width = 600 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select(elementId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Parse the Data
  d3.json(url).then(function (data) {
    const minYear = data.years.map((d) => d.name).min();
    const maxYear = data.years.map((d) => d.name).max();

    const arrayYears = arrayRange(minYear, maxYear, 1);

    // X axis
    const x = d3.scaleBand().range([0, width]).domain(arrayYears).padding(0.6);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    const maxPublications = data.years.map((y) => y.elements.length).max();

    // Add Y axis
    let y = d3.scaleLinear().domain([0, maxPublications]).range([height, 0]);
    svg
      .append("g")
      .call(d3.axisLeft(y).ticks(maxPublications).tickFormat(d3.format("d")));

    // Bars - start height with 0: correct height is set in animation
    svg
      .selectAll("mybar")
      .data(data.years)
      .join("rect")
      .attr("x", (d) => x(d.name))
      .attr("width", x.bandwidth())
      .attr("fill", barColor)
      .attr("height", function (d) {
        return height - y(0);
      }) // always equal to 0
      .attr("y", function (d) {
        return y(0);
      });

    // Animation
    svg
      .selectAll("rect")
      .transition()
      .duration(800)
      .attr("y", (d) => y(d.elements.length))
      .attr("height", (d) => height - y(d.elements.length))
      .delay((d, i) => i * 100);
  });
};
