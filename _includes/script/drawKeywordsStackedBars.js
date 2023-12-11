/// draw horizontal d3 bar plot with number of publications per co-author
/// can be sorted (@param order) by time (descending, 0), publication count (1) or name (2)
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

    var subgroups = data.years
      .map((y) => {
        const types = Array.from(y.elements.map((elem) => elem.type));
        return types;
      })
      .flat() // reduce array dimension
      .filter((value, index, array) => array.indexOf(value) === index) // remove duplicate values
      .sort((a, b) => a[0].localeCompare(b[0]));

    // color palette = one color per subgroup
    const color = d3
      .scaleOrdinal()
      .domain(subgroups)
      .range(publicationTypeColors);

    data.years.forEach((y) => {
      y.elements.forEach((e) => {
        var keywords = e.keywords;
        keywords.forEach((k) => {
          if (dict.has(k)) {
            let numbers_by_type = dict.get(k);
            // author should contain a map with subgroups
            const num = numbers_by_type.get(e.type);
            numbers_by_type.set(e.type, num + 1);
            dict.set(k, numbers_by_type);
          } else {
            // initalize with empty map
            let numbers_by_type = new Map();
            subgroups.forEach((g) => numbers_by_type.set(g, 0));
            numbers_by_type.set(e.type, 1);
            dict.set(k, numbers_by_type);
          }
        });
      });
    });

    // if param is 1 or 2: sort map
    let sorted = dict;

    if (Number(order) === 1) {
      sorted = new Map(
        [...dict].sort(
          (a, b) =>
            Array.from(b[1].values()).reduce(
              (partialSum, a) => partialSum + a,
              0
            ) -
            Array.from(a[1].values()).reduce(
              (partialSum, a) => partialSum + a,
              0
            )
        )
      );
    } else if (Number(order) === 2) {
      sorted = new Map([...dict].sort((a, b) => a[0].localeCompare(b[0])));
    }

    // get the highest number of co-authored publications
    const maxNum = [...dict]
      .map((a) =>
        Array.from(a[1].values()).reduce((partialSum, a) => partialSum + a, 0)
      )
      .max();

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

    //stack the data --> stack per subgroup
    const stackedData = d3.stack().keys(subgroups)(
      [...dict].map((elem) => {
        let result = Object.fromEntries(elem[1]);
        result.author = elem[0];
        return result;
      })
    );

    // draw the bars
    svg
      .append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .join("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => 0)
      .attr("y", (d) => y(d.data.author))
      .attr("height", y.bandwidth())
      .attr("width", (d) => 0);

    // draw horizontal lines on the start of the block as border between groups
    svg
      .append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .join("g")
      .selectAll("line")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data((d) => d)
      .join("line")
      .attr("x1", (d) => x(d[0]) + 1)
      .attr("y1", (d) => y(d.data.author))
      .attr("x2", (d) => x(d[0]) + 1)
      .attr("y2", (d) => y(d.data.author) + y.bandwidth())
      .attr("stroke", "#fff")
      .attr("stroke-width", (d) => (d[0] > 0 ? "2" : "0"));

    // Animation
    svg
      .selectAll("rect")
      .transition()
      .duration(400)
      .attr("x", (d) => x(d[0]) + 1)
      .attr("width", (d) => x(d[1]) - x(d[0]))
      .delay((d, i) => i * 10);
  });
};
