import T from 'prop-types';
import React, {Component} from 'react';
import {BASE_STYLE} from './Constants';
import ValueRenderer from './ValueRenderer';

export default class ArrayRenderer extends Component {
  static propTypes = {
    value: T.array
  };

  render() {
    const {
      value = []
    } = this.props;

    return (
      <div
        style={{
          ...BASE_STYLE
        }}
      >
        {value
          .map((v, i) => (
            <ValueRenderer
              key={`ArrayValue:${i}`}
              value={v}
            />
          ))}
      </div>
    );
  }
}
