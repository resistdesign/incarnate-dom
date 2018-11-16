import T from 'prop-types';
import React, {Component} from 'react';
import ValueRenderer from './ValueRenderer';

export default class ObjectRenderer extends Component {
  static propTypes = {
    value: T.object,
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

  onSelectName = ({target: {name} = {}} = {}) => {
    if (!!name) {
      const {path = []} = this.props;

      this.onPathChange([
        ...path,
        name
      ]);
    }
  };

  render() {
    const {
      value = {},
      path = []
    } = this.props;

    return (
      <div>
        {Object
          .keys(value)
          .map(k => (
            <details
              key={`ObjectKeyValueSet:${k}`}
            >
              <summary>
                <a
                  href='#'
                  name={k}
                  onClick={this.onSelectName}
                  style={{
                    color: '#777777'
                  }}
                >
                  {k}:
                </a>
              </summary>
              <ValueRenderer
                value={value[k]}
                path={[
                  ...path,
                  k
                ]}
                onPathChange={this.onPathChange}
              />
            </details>
          ))}
      </div>
    );
  }
}
