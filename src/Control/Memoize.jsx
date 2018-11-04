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
          dep: dependencyPath
        }}
        override
        factory={({dependencies: {dep} = {}} = {}) => {
          this.value = [
            ...this.value,
            dep
          ];

          return this.value;
        }}
      />
    );
  }
}
