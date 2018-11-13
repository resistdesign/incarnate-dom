import T from 'prop-types';
import React, {Component} from 'react';
import {BASE_STYLE} from './Constants';
import ValueRenderer from './ValueRenderer';

export default class ObjectRenderer extends Component {
  static propTypes = {
    value: T.object
  };

  render() {
    const {
      value = {}
    } = this.props;

    return (
      <div
        style={{
          ...BASE_STYLE
        }}
      >
        {Object
          .keys(value)
          .map(k => (
            <div
              key={`ObjectKeyValueSet:${k}`}
              style={{
                ...BASE_STYLE,
                marginLeft: '2em'
              }}
            >
              <div
                style={{
                  ...BASE_STYLE,
                  marginBottom: '1em'
                }}
              >
                {k}:
              </div>
              <ValueRenderer
                value={value[k]}
              />
            </div>
          ))}
      </div>
    );
  }
}
