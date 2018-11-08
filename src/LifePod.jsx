import T from 'prop-types';
import React, {isValidElement, cloneElement, Component} from 'react';
import {Consumer} from './Context';
import IncarnateProper, {
  DependencyDeclaration,
  LifePod as LifePodProper
} from 'incarnate';
import getDefaultMapKeyDelimiter from './Utils/getDefaultMapKeyDelimiter';

const DEFAULT_FACTORY = (...args) => args;
const OVERRIDE_MAP = {
  name: true,
  dependencies: true,
  getters: true,
  setters: true,
  invalidators: true,
  listeners: true,
  strict: true,
  noCache: true,
  factory: true
};

let LIFEPOD_COUNT = 0;

function getFactoryFromProps(props = {}) {
  const {
    factory,
    mapToProps
  } = props;

  return mapToProps instanceof Function &&
  (!(factory instanceof Function) || factory === DEFAULT_FACTORY) ?
    mapToProps :
    factory;
}

function getMergedDependencies({
                                 dependencies,
                                 getters,
                                 setters,
                                 invalidators,
                                 listeners
                               } = {}) {
  return {
    ...dependencies,
    ...getters,
    ...setters,
    ...invalidators,
    ...listeners
  };
}

export default class LifePod extends Component {
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
    strict: T.bool,
    noCache: T.bool,
    factory: T.func,
    mapToProps: T.func,
    /**
     * Override the properties of an preexisting LifePod if one is encountered.
     * */
    override: T.bool,
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

  rendering = false;

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

  initializeRendering() {
    // TRICKY: If `rendering` is `true`, then it is already being managed.
    if (!this.rendering) {
      this.rendering = true;

      setTimeout(() => this.rendering = false, 0);
    }
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
          const [
            rawDependencies,
            ...otherArgs
          ] = args || [];

          return factory(getMergedDependencies(rawDependencies), ...otherArgs);
        }
      };

      this.parentIncarnate = parentIncarnate;

      if (parentIncarnate instanceof IncarnateProper) {
        // Get the LifePod instance from a parent Incarnate.
        const {override} = this.props;
        const {name} = dependencyDeclaration;
        const targetName = name || [
          LifePod.DEFAULT_MAP_KEY,
          this._lifePodHashMatrixKey
        ].join(getDefaultMapKeyDelimiter(parentIncarnate.pathDelimiter));
        const {subMap, subMap: {[targetName]: existingMapEntry} = {}} = parentIncarnate;
        const targetConfig = {
          ...dependencyDeclaration,
          name: targetName,
          factory: targetFactory
        };

        if (!existingMapEntry) {
          subMap[targetName] = targetConfig;
        }

        const lifePodInstance = parentIncarnate.getDependency(targetName);

        // TRICKY: If `override` is `true`, override only the relevant properties on the existing LifePod with the
        // values from a temporary LifePod created by the `parentIncarnate`.
        if (!!existingMapEntry && override && lifePodInstance instanceof LifePodProper) {
          const tempDepDec = new DependencyDeclaration(targetConfig);
          const tempLifePod = parentIncarnate.createLifePod(targetName, tempDepDec);

          for (const k in OVERRIDE_MAP) {
            lifePodInstance[k] = tempLifePod[k];
          }
        }

        this.setLifePod(lifePodInstance);
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
      if (!this.rendering) {
        try {
          // IMPORTANT: Don't break the rendering cycle.
          this.setState(...args);
        } catch (error) {
          // Ignore.
        }
      } else {
        setTimeout(() => this.safeSetState(...args), 0);
      }
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
      override,
      factory,
      mapToProps,
      ...dependencyDeclaration
    } = this.props;

    this.initializeRendering();

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
