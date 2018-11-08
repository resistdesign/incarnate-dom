export default function getDefaultMapKeyDelimiter(currentIncarnateDelimiter) {
  return currentIncarnateDelimiter === '.' ? '|' : '.';
}
