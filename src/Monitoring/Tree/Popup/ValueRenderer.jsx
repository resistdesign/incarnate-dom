import T from 'prop-types';
import React, {Component} from 'react';
import PrimitiveRenderer from './PrimitiveRenderer';
import ObjectRenderer from './ObjectRenderer';
import ArrayRenderer from './ArrayRenderer';

export default class ValueRenderer extends Component {
  static propTypes = {
    value: T.any,
    path: T.arrayOf(
      T.oneOfType([
        T.string,
        T.number
      ])
    ),
    onPathChange: T.func
  };

  onPathChange = (newPath = []) => {
    const {onPathChange} = this.props;

    if (onPathChange instanceof Function) {
      onPathChange(newPath);
    }
  };

  selectCurrentPath = () => {
    const {path} = this.props;

    this.onPathChange(path);
  };

  render() {
    const {
      value,
      path = []
    } = this.props;

    let content;

    if (typeof value === 'object' && value !== null && !(value instanceof Array)) {
      content = (
        <ObjectRenderer
          value={value}
          path={path}
          onPathChange={this.onPathChange}
        />
      );
    } else if (value instanceof Array) {
      content = (
        <ArrayRenderer
          value={value}
          path={path}
          onPathChange={this.onPathChange}
        />
      );
    } else {
      content = (
        <PrimitiveRenderer
          value={value}
          onClick={this.selectCurrentPath}
        />
      );
    }

    return content;
  }
}
