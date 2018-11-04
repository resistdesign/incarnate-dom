import T from 'prop-types';
import React, {PureComponent} from 'react';
import {LifePod} from '../index';

export default class Memoize extends PureComponent {
  static propTypes = {
    name: T.string,
    dependencyPath: T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ])
  };

  value = [];

  render() {
    const {
      name,
      dependencyPath
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
          ];

          return [
            ...this.value
          ];
        }}
      />
    );
  }
}
