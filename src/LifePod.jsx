import T from 'prop-types';
import React, {isValidElement, cloneElement, PureComponent} from 'react';
import {Consumer} from './Context';
import IncarnateProper, {LifePod as LifePodProper} from 'incarnate';
import {DepencencyDeclarationShape} from './Shapes';
import Incarnate from './index';

let LIFEPOD_COUNT = 0;

export default class LifePod extends PureComponent {
  static DEFAULT_MAP_KEY = '__LIFEPODS__';
  static propTypes = {
    name: T.string,
    ...DepencencyDeclarationShape,
    alwaysRender: T.bool,
    children: T.oneOfType([
      T.func.isRequired,
      T.element.isRequired
    ])
  };
  static defaultProps = {
    factory: (...args) => args
  };

  mounted = false;

  incarnateDOM;
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

    if (this.lifePod instanceof LifePodProper) {
      this.lifePod.removeChangeHandler('', this.onChildPropsChange);
      this.lifePod.setValue(undefined);
    }
  }

  setLifePod(incarnateDOMInstance) {
    if (
      !(this.lifePod instanceof LifePodProper) &&
      incarnateDOMInstance instanceof Incarnate &&
      incarnateDOMInstance.incarnate instanceof IncarnateProper
    ) {
      /* PARENT INCARNATE INSTANCE AVAILABLE */
      const incarnateInstance = incarnateDOMInstance.incarnate;
      const {
        name,
        alwaysRender,
        children,
        ...dependencyDeclaration
      } = this.props;

      this.incarnateDOM = incarnateDOMInstance;

      if (name && incarnateInstance.map instanceof Object) {
        // Configure the incarnateInstance and get the dependency.
        incarnateInstance.map[name] = dependencyDeclaration;
        this.lifePod = incarnateInstance.getDependency(name);
      } else {
        // Just create an instance with a dynamic name.
        const targetName = name || incarnateInstance.getPathString([
          LifePod.DEFAULT_MAP_KEY,
          this._lifePodHashMatrixKey
        ]);

        this.lifePod = incarnateInstance.createLifePod(
          targetName,
          dependencyDeclaration
        );
      }

      this.lifePod.addChangeHandler('', this.onChildPropsChange);
      setTimeout(this.onChildPropsChange, 0);
    }
  }

  safeSetState = (...args) => {
    if (this.mounted) {
      return this.setState(...args);
    }
  };

  handlerResolveChildPropsPromiseError = (error) => {
    const {handleResolveError} = this.incarnateDOM || {};

    if (handleResolveError instanceof Function) {
      handleResolveError(error);
    }
  };

  async resolveChildPropsPromise(promise) {
    try {
      const childProps = await promise;

      this.safeSetState({
        childProps
      });
    } catch (error) {
      this.safeSetState({
        childProps: undefined
      });

      this.handlerResolveChildPropsPromiseError(error);
    }
  }

  async resolveAsyncDependency(promise) {
    if (promise instanceof Promise) {
      await promise;
      this.onChildPropsChange();
    }
  }

  onChildPropsChange = () => {
    try {
      const childProps = this.lifePod.resolve();

      if (childProps instanceof Promise) {
        this.resolveChildPropsPromise(childProps);

        this.safeSetState({
          childProps: undefined
        });
      } else {
        this.safeSetState({
          childProps
        });
      }
    } catch (error) {
      const {message, subject} = error || {};

      if (
        message === LifePodProper.ERRORS.UNRESOLVED_ASYNCHRONOUS_DEPENDENCY &&
        subject instanceof LifePodProper &&
        subject.resolving &&
        subject.resolver instanceof Promise
      ) {
        // TRICKY: Dependency creation and acquisition timing could be off due to Incarnate and React lifecycle
        // interactions, so do this manually in case some dependencies were acquired before their target LifePod
        // was configured.
        this.resolveAsyncDependency(subject.resolver);
      } else {
        this.safeSetState({
          childProps: undefined
        });

        // TRICKY: If a route is changing rapidly, due to a redirect or other reason,
        // it might trigger a LifePod's recursive dependency resolution detection.
        // So, simply wait a tick and try again.
        // Additionally, the childProps are still invalid, due to the error,
        // so allow the above safeSetState call to clear them.
        if (message === LifePodProper.ERRORS.DEPENDENCY_RESOLUTION_RECURSION) {
          setTimeout(this.onChildPropsChange, 0);
        } else {
          this.handlerResolveChildPropsPromiseError(error);
        }
      }
    }
  };

  render() {
    const {childProps} = this.state;
    const {children, alwaysRender, factory} = this.props;

    return (
      <Consumer>
        {parentInstance => {
          this.setLifePod(parentInstance);

          if (typeof childProps !== 'undefined' || alwaysRender) {
            if (children instanceof Function) {
              if (factory === LifePod.defaultProps.factory && childProps instanceof Array) {
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
        }}
      </Consumer>
    );
  }
}
