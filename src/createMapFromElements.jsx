const MAP_TYPE = 'map';
const DEP_ARRAY_PROPS = {
  required: true,
  optional: true,
  getters: true,
  setters: true,
  invalidators: true,
  listeners: true,
  targets: true
};

function getChildArray(children) {
  return typeof children === 'undefined' ?
    [] :
    (
      children instanceof Array ?
        children :
        [children]
    );
}

function getElementType({type} = {}) {
  return type;
}

function getElementProps({props: {children, ...props} = {}} = {}) {
  return props;
}

function getElementChildren({props: {children} = {}} = {}) {
  return children;
}

function parseElement(element = {}) {
  const {subMap} = getElementProps(element);

  if (subMap) {
    return parseSubMapElement(element);
  } else {
    return parseDependencyElement(element);
  }
}

function parseDependencyElement(element = {}) {
  const children = getElementChildren(element);
  const dependency = {};

  getChildArray(children)
    .forEach(e => {
      if (e instanceof Function) {
        // Factory as a child element.
        dependency.factory = e;
      } else {
        const eType = getElementType(e);
        const eChildren = getElementChildren(e);

        let value = dependency[eType];

        if (DEP_ARRAY_PROPS[eType]) {
          // Array Props
          value = value instanceof Array ? value : [];

          value.push(eChildren);
        } else {
          // Direct Value Props
          value = eChildren;
        }

        dependency[eType] = value;
      }
    });

  return dependency;
}

function parseMapElement(element = {}) {
  const children = getElementChildren(element);
  const dependencyMap = {};

  getChildArray(children)
    .forEach(e => {
      const eType = getElementType(e);

      dependencyMap[eType] = parseElement(e);
    });

  return dependencyMap;
}

function parseSubMapElement(element = {}) {
  const props = getElementProps(element);

  return {
    ...props,
    subMap: parseMapElement(element)
  };
}

export function removeMapFromElements(elements) {
  return elements ?
    getChildArray(elements)
      .filter(e => getElementType(e) !== MAP_TYPE) :
    undefined;
}

export default function createMapFromElements(elements) {
  const mapElement = getChildArray(elements)
    .filter(e => getElementType(e) === MAP_TYPE)[0];

  if (mapElement instanceof Object) {
    return parseMapElement(mapElement);
  }
}
