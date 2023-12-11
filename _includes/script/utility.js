Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

const extractAuthors = (authorString) => {
  const authorRegex = /([^,&]+)(, | & )?/g;

  var arr = authorString.split(/[/,|&]+/);
  return arr.map((s) => s.trim());
};

const arrayRange = (start, stop, step) => 
  Array.from(
    { length: (stop - start) / step + 1 },
    (value, index) => start + index * step
  );