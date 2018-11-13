import T from 'prop-types';
import React, {Component} from 'react';

export default class PrimitiveRenderer extends Component {
  static propTypes = {
    value: T.any
  };

  render() {
    const {value} = this.props;
    const content = `${value}`;

    return (
      <code
        style={{
          backgroundColor: 'gray',
          color: 'white',
          padding: '1em'
        }}
      >
        {content}
      </code>
    );
  }
}
