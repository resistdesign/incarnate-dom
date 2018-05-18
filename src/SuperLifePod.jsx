import T from 'prop-types';
import React, {PureComponent} from 'react';
import LifePod from './LifePod';

const PROP_MAP_SHAPE = T.objectOf(
  T.oneOfType([
    T.string,
    T.arrayOf(
      T.string
    )
  ])
);

function getDependecniesFromMap(map = {}, transformList = []) {
  return Object
    .keys(map)
    .map(key => {
      transformList.push(key);

      return map[key];
    });
}

export default class SuperLifePod extends PureComponent {
  static propTypes = {
    name: T.string,
    required: PROP_MAP_SHAPE,
    optional: PROP_MAP_SHAPE,
    getters: PROP_MAP_SHAPE,
    setters: PROP_MAP_SHAPE,
    invalidators: PROP_MAP_SHAPE,
    listeners: PROP_MAP_SHAPE,
    targets: PROP_MAP_SHAPE,
    strictRequired: T.bool,
    handlerAsyncFactoryError: T.func,
    classRef: T.func,
    apply: T.bool,
    children: T.node
  };

  state = {
    lifePodProps: undefined
  };

  componentWillMount() {
    const {
      classRef,
      apply,
      required = {},
      optional = {},
      getters = {},
      setters = {},
      invalidators = {},
      listeners = {},
      targets = {},
      ...other
    } = this.props;
    const transformList = [];
    const lifePodProps = {
      ...other,
      required: getDependecniesFromMap(required, transformList),
      optional: getDependecniesFromMap(optional, transformList),
      getters: getDependecniesFromMap(getters, transformList),
      setters: getDependecniesFromMap(setters, transformList),
      invalidators: getDependecniesFromMap(invalidators, transformList),
      listeners: getDependecniesFromMap(listeners, transformList),
      targets: getDependecniesFromMap(targets, transformList),
      factory: (...args) => {
        const propMap = args
          .reduce((acc, item, index) => {
            const propName = transformList[index];
            acc[propName] = item;

            return acc;
          }, {});

        if (classRef instanceof Function) {
          if (apply) {
            const instance = new classRef();

            Object.apply(instance, propMap);

            return instance;
          } else {
            return new classRef(propMap);
          }
        } else {
          return propMap;
        }
      }
    };

    this.setState({lifePodProps});
  }

  render() {
    const {lifePodProps} = this.state;

    if (lifePodProps instanceof Object) {
      return (
        <LifePod
          {...lifePodProps}
        />
      );
    }
  }
}
