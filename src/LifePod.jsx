import T from 'prop-types';
import React, {isValidElement, cloneElement, PureComponent} from 'react';
import {Consumer} from './Context';
import IncarnateProper, {
  DependencyDeclaration,
  LifePod as LifePodProper
} from 'incarnate';

const DEFAULT_FACTORY = (...args) => args;

let LIFEPOD_COUNT = 0;

function getFactoryFromProps(props = {}) {
  const {
    factory,
    mapToProps
  } = props;

  return factory || mapToProps;
}

export default class LifePod extends PureComponent {
  static DEFAULT_MAP_KEY = '__LIFEPODS__';
  static propTypes = {
    name: T.string,
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
    mapToProps: T.func,
    handleResolveError: T.func,
    alwaysRender: T.bool,
    children: T.oneOfType([
      T.func,
      T.element
    ])
  };
  static defaultProps = {
    factory: DEFAULT_FACTORY,
    mapToProps: DEFAULT_FACTORY
  };

  mounted = false;

  parentIncarnate;
  lifePod;

  _lifePodHashMatrixKey;

  constructor(props) {
    super(props);

    this._lifePodHashMatrixKey = LIFEPOD_COUNT;
    LIFEPOD_COUNT++;
  }

  state = {
    childProps: undefined
  };

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;

    this.setLifePod(undefined);
  }

  setLifePod(lifePod) {
    if (this.lifePod instanceof LifePodProper) {
      this.lifePod.removeChangeHandler('', this.onChildPropsChange);
    }

    this.lifePod = lifePod;

    if (this.lifePod instanceof LifePodProper) {
      this.lifePod.addChangeHandler('', this.onChildPropsChange);
    }
  }

  /**
   * @param {IncarnateProper} parentIncarnate
   * @param {Object} dependencyDeclaration
   * */
  getLifePod(parentIncarnate, dependencyDeclaration = {}) {
    if (!(this.lifePod instanceof LifePodProper)) {
      const targetFactory = (...args) => {
        // TRICKY: Always use the current factory.
        const factory = getFactoryFromProps(this.props);

        if (factory instanceof Function) {
          return factory(...args);
        }
      };

      this.parentIncarnate = parentIncarnate;

      if (parentIncarnate instanceof IncarnateProper) {
        // Get the LifePod instance from a parent Incarnate.
        const {name} = dependencyDeclaration;
        const targetName = name || parentIncarnate.getPathString([
          LifePod.DEFAULT_MAP_KEY,
          this._lifePodHashMatrixKey
        ]);

        this.setLifePod(
          parentIncarnate.createLifePod(
            targetName,
            {
              ...dependencyDeclaration,
              name: targetName,
              factory: targetFactory
            }
          )
        );
      } else {
        // Create a standalone LifePod instance.
        this.setLifePod(new LifePodProper(
          new DependencyDeclaration({
            ...dependencyDeclaration,
            factory: targetFactory
          })
        ));
      }
    }

    return this.lifePod;
  }

  safeSetState = (...args) => {
    if (this.mounted) {
      return this.setState(...args);
    }
  };

  handleResolveError = (error) => {
    const {handleResolveError} = this.props;

    if (handleResolveError instanceof Function) {
      handleResolveError(error);
    }

    if (
      this.parentIncarnate instanceof IncarnateProper &&
      this.parentIncarnate.handleResolveError instanceof Function
    ) {
      this.parentIncarnate.handleResolveError(error);
    }
  };

  getChildProps() {
    let childProps;

    if (this.lifePod instanceof LifePodProper) {
      try {
        const value = this.lifePod.getValue();

        if (!(value instanceof Promise)) {
          childProps = value;
        }
      } catch (error) {
        this.handleResolveError(error);
      }
    }

    return childProps;
  }

  onChildPropsChange = () => {
    this.safeSetState({
      childProps: this.getChildProps()
    });
  };

  renderChildren() {
    const {
      children,
      alwaysRender
    } = this.props;
    const factory = getFactoryFromProps(this.props);
    const currentChildProps = this.getChildProps();
    const {childProps: childPropsFromState} = this.state;
    const childProps = typeof currentChildProps !== 'undefined' && alwaysRender ?
      childPropsFromState :
      currentChildProps;

    if (typeof childProps !== 'undefined' || alwaysRender) {
      if (children instanceof Function) {
        if (factory === DEFAULT_FACTORY && childProps instanceof Array) {
          return children(...childProps);
        } else {
          return children(childProps);
        }
      } else if (isValidElement(children)) {
        const {props: baseChildProps = {}} = children;

        return cloneElement(children, {
          ...childProps,
          ...baseChildProps
        });
      } else {
        return children;
      }
    }
  }

  render() {
    const {
      children,
      alwaysRender,
      handleResolveError,
      ...dependencyDeclaration
    } = this.props;

    return (
      <Consumer>
        {parentInstance => {
          this.getLifePod(parentInstance, dependencyDeclaration);

          return this.renderChildren();
        }}
      </Consumer>
    );
  }
}
