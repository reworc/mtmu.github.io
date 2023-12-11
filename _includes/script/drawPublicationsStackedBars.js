/// draw d3.js bar plot of publications
const drawPublications = (url, elementId, names) => {  
  // set the dimensions and margins of the graph
  const margin = {top: 50, right: 30, bottom: 30, left: 30},
      width = 600 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;
  
  // append the svg object to the body of the page
  const svg = d3.select(elementId)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Parse the Data
  d3.json(url).then( function(data) {
  
    const minYear = data.years.map(d => d.name).min();
    const maxYear = data.years.map(d => d.name).max();

    const arrayYears = arrayRange(minYear, maxYear, 1);

    var subgroups = data.years.map((y) => {
      const types = Array.from(y.elements.map(elem => elem.type));
      return(types)}
      )
      .flat()                     // reduce array dimension
      .filter((value, index, array) => array.indexOf(value) === index) // remove duplicate values
      .sort((a, b) => a[0].localeCompare(b[0]));

    // color palette = one color per subgroup
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(publicationTypeColors);

    const publications_by_type = data.years.map((y) => {
      var typeMap = new Map();
      subgroups.forEach((g) => {
        typeMap.set(g, y.elements.reduce((total,elem) => total+(elem.type === g), 0));
      });
      typeMap.set('year', Number(y.name));
      return Object.fromEntries(typeMap.entries());
    });

    //stack the data --> stack per subgroup
    const stackedData = d3.stack()
      .keys(subgroups)
      (publications_by_type);

    // X axis
    const x = d3.scaleBand()
        .range([ 0, width ])
        .domain(arrayYears)
        .padding(0.6);
      svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

    const maxPublications = data.years.map((y) => y.elements.length).max();

    // Add Y axis
    let y = d3.scaleLinear()
      .domain([0, maxPublications])
      .range([ height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y).ticks(maxPublications).tickFormat(d3.format("d"))
    );

    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3.select(elementId)
      .append("div")
      .style("opacity", 0);

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseoverPubByType = function(event, d) {
      const subgroupName = d3.select(this.parentNode).datum().key;
      const subgroupValue = d.data[subgroupName];
      tooltip
          .html("Typ: " + publicationTypeNames.get(subgroupName) + "<br>" + "Anzahl: " + subgroupValue)
          .style("opacity", 1)
          .attr("class", `d3-tooltip tooltip-vertical tooltip-${subgroupName}`)

    }
    const mousemovePubByType = function(event, d) {

      var rect = document.getElementById(elementId.replace('#', '')).getBoundingClientRect();
      var x = event.clientX - rect.left; //x position within the element.
      var y = event.clientY - rect.top;  
      tooltip.style("transform", `translate(${(x)}px, ${(y)}px`);
    }
    const mouseleavePubByType = function(event, d) {
      tooltip
        .style("opacity", 0)
    }

    // draw the bars
    svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(d => d)
      .join("rect")
        .attr("x", d => x(d.data.year))
        .attr("y", d => y(0))
        .attr("height", d => height - y(0))
        .attr("width",x.bandwidth())
      .on("mouseover", mouseoverPubByType)
      .on("mousemove", mousemovePubByType)
      .on("mouseleave", mouseleavePubByType);
      
  // draw horizontal lines on the start of the block as border between groups
  svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
      .attr("fill", d => color(d.key))
      .selectAll("line")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(d => d)
      .join("line")
        .attr("x1", d=> x(d.data.year))
        .attr("y1", d => y(d[0]))
        .attr("x2", d => x(d.data.year) + x.bandwidth())
        .attr("y2", d => y(d[0]))
        .attr("stroke", '#fff')
        .attr("stroke-width", d => d[0] > 0 ? "2" : "0")

    // Animation
    svg.selectAll("rect")
      .transition()
      .duration(400)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .delay((d,i) => i*10 );   
  });
};
