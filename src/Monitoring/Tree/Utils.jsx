export function cleanDataStructure(value, cache = []) {
  if (cache.indexOf(value) !== -1) {
    return '[Circuar Reference]'
  } else {
    if (value instanceof Window) {
      return '[Window Reference]';
    } else if (value instanceof Location) {
      return '[Location Reference]';
    } else if (typeof value === 'object' && !(value instanceof Array) && value !== null) {
      try {
        return Object
          .keys(value)
          .reduce(
            (acc, k) => ({...acc, [k]: cleanDataStructure(value[k], [...cache, value])}),
            {}
          );
      } catch (error) {
        return `[Error: ${error && error.message}]`;
      }
    } else if (value instanceof Array) {
      try {
        return value
          .map(v => cleanDataStructure(v, [...cache, value]));
      } catch (error) {
        return `[Error: ${error && error.message}]`;
      }
    } else {
      return value;
    }
  }
}
