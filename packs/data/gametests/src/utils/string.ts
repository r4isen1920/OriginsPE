
declare global {
  interface String {
    /**
     * Changes string to title case
     * @returns {string}
     */
    toTitle(): string;

    /**
     * Ensures proper capitalization is made on words that are meant to be abbreviations
     * @param {number} threshold
     * @returns {string}
     */
    prettyCaps(threshold?: number): string;

    /**
     * Adds leading zeroes to the string
     * @param {number} size
     * @returns {string}
     */
    zFill(size: number): string;
  }
}

String.prototype.toTitle = function() {
  return this.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
};

String.prototype.prettyCaps = function(threshold=4) {
  let _a: string[] = [];
  this.split(' ').forEach(word => {
    if (word.length < threshold) _a.push(word.toUpperCase()); else _a.push(word);
  })
  return _a.join(' ');
};

String.prototype.zFill = function(size: number) {
  let num = this;
  while (num.length < size) num = "0" + num;
  return num.toString();
};

export {};
