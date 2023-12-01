const drawKeywordsSpider = (url, elementId) => {
  // set the dimensions and margins of the graph
  const margin = { top: 30, right: 30, bottom: 70, left: 30 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

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

    const sorted = new Map([...dict].sort((a, b) => b[1] - a[1]).slice(0, 6));
    const maxNum = Array.from(sorted.values()).max();

    let radialScale = d3.scaleLinear().domain([0, maxNum]).range([0, 150]);

    let ticks = [
      Math.floor(0.2 * maxNum),
      Math.floor(0.4 * maxNum),
      Math.floor(0.6 * maxNum),
      Math.floor(0.8 * maxNum),
      maxNum,
    ];

    svg
      .selectAll("circle")
      .data(ticks)
      .join((enter) =>
        enter
          .append("circle")
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .attr("fill", "none")
          .attr("stroke", "#999")
          .attr("r", (d) => radialScale(d))
      );

    svg
      .selectAll(".ticklabel")
      .data(ticks)
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "ticklabel")
          .attr("x", width / 2 + 5)
          .attr("y", (d) => height / 2 - radialScale(d))
          .text((d) => d.toString())
      );

    const angleToCoordinate = (angle, value) => {
      let x = Math.cos(angle) * radialScale(value);
      let y = Math.sin(angle) * radialScale(value);
      return { x: width / 2 + x, y: height / 2 - y };
    };

    const sortedArray = Array.from(sorted);

    let featureData = sortedArray.map((f, i) => {
      let angle = Math.PI / 2 + (2 * Math.PI * i) / sortedArray.length;
      return {
        name: f[0],
        angle: angle,
        line_coord: angleToCoordinate(angle, maxNum + 1),
        label_coord: angleToCoordinate(angle, maxNum + 2),
      };
    });

    // draw axis line
    svg
      .selectAll("line")
      .data(featureData)
      .join((enter) =>
        enter
          .append("line")
          .attr("x1", width / 2)
          .attr("y1", height / 2)
          .attr("x2", (d) => d.line_coord.x)
          .attr("y2", (d) => d.line_coord.y)
          .attr("stroke", barColor_light)
          .attr("stroke-width", "2")
      );

    // draw axis label
    svg
      .selectAll(".axislabel")
      .data(featureData)
      .join((enter) =>
        enter
          .append("text")
          .attr("x", (d) => d.label_coord.x)
          .attr("y", (d) => d.label_coord.y)
          .attr("class", "visualization__keywords--spider--axisLabel")
          .attr("text-anchor", (d, i) =>
            i < featureData.length / 2 ? "end" : "start"
          )
          .text((d) => d.name)
      );

    let line = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y);

    const numKeyWords = sortedArray.map((i) => i[1]);
    const labels = sortedArray.map((i) => i[0]);

    const getPathCoordinates = (data_points) => {
      let coordinates = [];
      for (var i = 0; i < labels.length; i++) {
        let angle = Math.PI / 2 + (2 * Math.PI * i) / labels.length;
        coordinates.push(angleToCoordinate(angle, data_points[i]));
      }
      // close path
      coordinates.push(angleToCoordinate(Math.PI / 2, data_points[0]));
      return coordinates;
    };

    // draw the path element
    svg
      .selectAll("path")
      .data([numKeyWords])
      .join((enter) =>
        enter
          .append("path")
          .datum((d) => getPathCoordinates(d))
          .attr("d", line)
          .attr("stroke-width", 2)
          .attr("stroke", `rgba(${barcolor_rgb}, 1.0)`)
          .attr("fill", `rgba(${barcolor_rgb}, 0.5)`)
      );
  });
};
