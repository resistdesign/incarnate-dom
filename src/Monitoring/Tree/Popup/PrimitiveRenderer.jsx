import T from 'prop-types';
import React, {Component} from 'react';

export default class PrimitiveRenderer extends Component {
  static propTypes = {
    value: T.any,
    onClick: T.func
  };

  onClick = () => {
    const {onClick} = this.props;

    if (onClick instanceof Function) {
      onClick();
    }
  };

  render() {
    const {value} = this.props;
    const content = `${value}`;
    const lineCount = content.split('\n').length;

    if (lineCount > 1) {
      return (
        <pre
          onClick={this.onClick}
        >
          {content}
        </pre>
      );
    } else {
      return (
        <code
          onClick={this.onClick}
        >
          {content}
        </code>
      );
    }
  }
}
