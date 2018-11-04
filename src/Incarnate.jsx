import T from 'prop-types';
import React, {Component} from 'react';
import IncarnateProper from 'incarnate';
import {Provider, Consumer} from './Context';

let INCARNATE_COUNT = 0;

export default class Incarnate extends Component {
  static DEFAULT_MAP_KEY = '__INCARNATES__';
  static propTypes = {
    name: T.string,
    subMap: T.objectOf(
      T.shape({
        dependencies: T.objectOf(
          T.string
        ),
        getters: T.objectOf(
          T.string
        ),
        setters: T.objectOf(
          T.string
        ),
        invalidators: T.objectOf(
          T.string
        ),
        listeners: T.objectOf(
          T.string
        ),
        transformArgs: T.func,
        strict: T.bool,
        factory: T.func,
        handlerAsyncFactoryError: T.func
      })
    ),
    shared: T.objectOf(
      T.string
    ),
    transformArgs: T.func,
    strict: T.bool,
    incarnateInstanceRef: T.func,
    handleResolveError: T.func,
    children: T.node
  };

  _incarnateHashMatrixKey;
  mounted = false;
  incarnate;

  constructor(props) {
    super(props);

    this._incarnateHashMatrixKey = INCARNATE_COUNT;
    INCARNATE_COUNT++;
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  /**
   * @param {IncarnateProper} parentIncarnate
   * @param {Object} props
   * */
  getIncarnate(parentIncarnate, props = {}) {
    if (!(this.incarnate instanceof IncarnateProper)) {
      const {
        incarnateInstanceRef,
        ...subMapDeclaration
      } = props;

      if (parentIncarnate instanceof IncarnateProper) {
        // Get the Incarnate instance from a parent Incarnate.
        const {name} = subMapDeclaration;
        const targetName = name || parentIncarnate.getPathString([
          Incarnate.DEFAULT_MAP_KEY,
          this._incarnateHashMatrixKey
        ]);
        const targetSubMapDeclaration = {
          ...subMapDeclaration,
          name: targetName
        };
        const {handleResolveError} = parentIncarnate;
        const {subMap, subMap: {[targetName]: existingMapEntry} = {}} = parentIncarnate;

        if (!existingMapEntry) {
          subMap[targetName] = {
            ...targetSubMapDeclaration,
            handleResolveError
          };
        }

        this.incarnate = parentIncarnate.getDependency(targetName);
      } else {
        // Create a standalone Incarnate instance.
        this.incarnate = new IncarnateProper(subMapDeclaration);
      }

      if (incarnateInstanceRef instanceof Function) {
        incarnateInstanceRef(this.incarnate);
      }
    }

    return this.incarnate;
  }

  render() {
    const {
      children,
      ...props
    } = this.props;

    return (
      <Consumer>
        {parentIncarnate => (
          <Provider
            value={this.getIncarnate(parentIncarnate, props)}
          >
            {children}
          </Provider>
        )}
      </Consumer>
    );
  }
}
