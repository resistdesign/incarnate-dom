import T from 'prop-types';
import React, {Component} from 'react';
import {BASE_STYLE} from './Constants';
import PrimitiveRenderer from './PrimitiveRenderer';
import ObjectRenderer from './ObjectRenderer';
import ArrayRenderer from './ArrayRenderer';

export default class ValueRenderer extends Component {
  static propTypes = {
    value: T.any
  };

  render() {
    const {value} = this.props;

    let content;

    if (typeof value === 'object' && value !== null && !(value instanceof Array)) {
      content = (
        <ObjectRenderer
          value={value}
        />
      );
    } else if (value instanceof Array) {
      content = (
        <ArrayRenderer
          value={value}
        />
      );
    } else {
      content = (
        <PrimitiveRenderer
          value={value}
        />
      );
    }

    return (
      <div
        style={{
          ...BASE_STYLE,
          marginLeft: '2em',
          marginBottom: '1em'
        }}
      >
        {content}
      </div>
    );
  }
}
