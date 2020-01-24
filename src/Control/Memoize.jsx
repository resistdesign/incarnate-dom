import T from 'prop-types';
import React, {Component} from 'react';
import {LifePod} from '../index';

const defaultFilter = () => true;

export default class Memoize extends Component {
  static propTypes = {
    name: T.string,
    dependencyPath: T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ]),
    filter: T.func
  };

  value = [];

  render() {
    const {
      name,
      dependencyPath,
      filter = defaultFilter
    } = this.props;

    return (
      <LifePod
        name={name}
        dependencies={{
          depValue: dependencyPath
        }}
        override
        factory={({depValue} = {}) => {
          this.value = [
            ...this.value,
            depValue
          ].filter(filter);

          return [
            ...this.value
          ];
        }}
      />
    );
  }
}
