import T from 'prop-types';
import React, {Component} from 'react';
import ValueRenderer from './ValueRenderer';

export default class ArrayRenderer extends Component {
  static propTypes = {
    value: T.array,
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
      value = [],
      path = []
    } = this.props;

    return (
      <details>
        <summary>
          Items:
        </summary>
        {value
          .map((v, i) => (
            <details
              key={`ArrayValue:${i}`}
            >
              <summary>
                <a
                  href='#'
                  name={`${i}`}
                  onClick={this.onSelectName}
                  style={{
                    color: '#777777'
                  }}
                >
                  {i}:
                </a>
              </summary>
              <ValueRenderer
                value={v}
                path={[
                  ...path,
                  i
                ]}
                onPathChange={this.onPathChange}
              />
            </details>
          ))}
      </details>
    );
  }
}
