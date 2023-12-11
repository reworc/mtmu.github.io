// horizontal bar plot visualizing how often specific key words were used
// ordered by number of appearances
const drawKeywords = (url, elementId, order) => {
  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 30, bottom: 70, left: 200 },
    width = 600 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;
  d3.select(elementId).selectAll("*").remove();

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

    let sorted = dict;
    if (Number(order) === 1) {
      sorted = new Map([...dict].sort((a, b) => b[1] - a[1]));
    } else if (Number(order) === 2) {
      sorted = new Map([...dict].sort((a, b) => a[0].localeCompare(b[0])));
    }

    const maxNum = Array.from(sorted.values()).max();

    // X axis
    let x = d3.scaleLinear().domain([0, maxNum]).range([0, width]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(maxNum).tickFormat(d3.format("d")))
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
      .attr("x", (d) => 0)
      .attr("y", (d) => y(d[0]))
      .attr("height", y.bandwidth())
      .attr("width", (d) => 0)
      .attr("fill", barColor);

    // Animation
    svg
      .selectAll("rect")
      .transition()
      .duration(800)
      .attr("x", (d) => 0)
      .attr("width", (d) => x(d[1]))
      .delay((d, i) => i * 20);
  });
};
