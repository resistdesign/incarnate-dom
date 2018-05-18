import T from 'prop-types';
import React, {PureComponent} from 'react';
import IncarnateProper from 'incarnate';
import {Provider, Consumer} from './Context';
import {SubMapDeclarationShape} from './Shapes';
import getDefaultRuntimeSubMap from './getDefaultRuntimeSubMap';
import createMapFromElements, {removeMapFromElements} from './createMapFromElements';

const {
  subMap: subMapShape,
  shared: sharedType,
  transformArgs: transformArgsType,
  strictRequired: strictRequiredType,
  handleResolveError: handleResolveErrorType
} = SubMapDeclarationShape;

let INCARNATE_COUNT = 0;

export default class Incarnate extends PureComponent {
  static DEFAULT_MAP_KEY = '__INCARNATES__';
  static SUBMAP_KEYS = {
    RUNTIME: 'RUNTIME'
  };
  static propTypes = {
    name: T.string,
    map: subMapShape,
    shared: T.oneOfType([
      T.bool,
      sharedType
    ]),
    transformArgs: transformArgsType,
    strictRequired: strictRequiredType,
    routeProps: T.shape({
      match: T.object,
      location: T.object,
      history: T.object
    }),
    handleResolveError: handleResolveErrorType,
    incarnateInstanceRef: T.func,
    children: T.node
  };
  static defaultProps = {
    shared: true
  };

  parentIncarnateComponent;
  incarnate;

  unlistenToHistory;
  match;
  location;
  history;

  handleResolveError;

  _incarnateHashMatrixKey;

  mounted = false;

  mapFromElements;

  constructor(props) {
    super(props);

    this._incarnateHashMatrixKey = INCARNATE_COUNT;
    INCARNATE_COUNT++;

    this.setHandleResolveError(props);
    this.setRouteProps(props);
  }

  componentWillMount() {
    this.mounted = true;

    this.setHandleResolveError(this.props);
    this.setRouteProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setHandleResolveError(nextProps);
    this.setRouteProps(nextProps);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setHandleResolveError(props = {}) {
    const {handleResolveError} = props;

    if (this.parentIncarnateComponent instanceof Incarnate) {
      this.handleResolveError = this.parentIncarnateComponent.handleResolveError;
    } else {
      this.handleResolveError = handleResolveError;
    }
  }

  invalidateRuntimeDependencies() {
    if (this.incarnate instanceof IncarnateProper) {
      // TRICKY: DO NOT invalidate `RUNTIME.location` or it will cause an
      // infinite rendering loop when using IncarnateRouter.
      const invalidateParams = this.incarnate.createInvalidator(
        `${Incarnate.SUBMAP_KEYS.RUNTIME}.params`
      );
      const invalidateProps = this.incarnate.createInvalidator(
        `${Incarnate.SUBMAP_KEYS.RUNTIME}.props`
      );

      if (invalidateParams instanceof Function) {
        invalidateParams();
      }

      if (invalidateProps instanceof Function) {
        invalidateProps();
      }
    }
  }

  setRouteProps({routeProps, routeProps: {match, location, history} = {}} = {}) {
    this.match = match;
    this.location = location;
    this.history = history;

    this.invalidateRuntimeDependencies();

    if (this.parentIncarnateComponent instanceof Incarnate) {
      this.parentIncarnateComponent.setRouteProps({routeProps});
    }
  }

  setMapFromElements(children) {
    if (!this.mapFromElements && children) {
      this.mapFromElements = createMapFromElements(children);
    }
  }

  setIncarnate(parentInstanceDOM) {
    if (!(this.incarnate instanceof IncarnateProper)) {
      const {
        name,
        map,
        shared,
        transformArgs,
        strictRequired,
        handleResolveError,
        incarnateInstanceRef
      } = this.props;
      const targetShared = shared === true ? {} : shared;

      if (
        targetShared instanceof Object &&
        parentInstanceDOM instanceof Incarnate &&
        parentInstanceDOM.incarnate instanceof IncarnateProper
      ) {
        /* PARENT INCARNATE INSTANCE AVAILABLE */
        const parentInstance = parentInstanceDOM.incarnate;
        // TRICKY: Use the parentInstance to get the RUNTIME map, but use `this` as the historyListenerTarget.
        const mapWithRuntime = {
          ...map,
          ...this.mapFromElements,
          [Incarnate.SUBMAP_KEYS.RUNTIME]: getDefaultRuntimeSubMap(parentInstance, this)
        };
        const config = {
          subMap: mapWithRuntime,
          shared: targetShared,
          transformArgs,
          strictRequired
        };

        if (name && parentInstance.map instanceof Object) {
          // Configure the parentInstance and get the dependency.
          parentInstance.map[name] = config;
          this.incarnate = parentInstance.getDependency(name);
        } else {
          // Just create an instance with a dynamic name.
          const targetName = name || parentInstance.getPathString([
            Incarnate.DEFAULT_MAP_KEY,
            this._incarnateHashMatrixKey
          ]);

          this.incarnate = parentInstance.createIncarnate(targetName, config);
        }

        this.parentIncarnateComponent = parentInstanceDOM;
        this.setHandleResolveError(this.props);
      } else {
        /* CREATE A STANDALONE INCARNATE INSTANCE */
        const mapWithRuntime = {
          ...map,
          [Incarnate.SUBMAP_KEYS.RUNTIME]: getDefaultRuntimeSubMap(this, this)
        };

        this.incarnate = new IncarnateProper({
          name: name || IncarnateProper.DEFAULT_NAME,
          map: mapWithRuntime,
          transformArgs,
          strictRequired,
          handleResolveError
        });
      }

      if (incarnateInstanceRef instanceof Function) {
        incarnateInstanceRef(this.incarnate);
      }
    }
  }

  render() {
    const {children} = this.props;
    const viewElements = removeMapFromElements(children);

    this.setMapFromElements(children);

    return (
      <Consumer>
        {parentInstance => {
          this.setIncarnate(parentInstance);

          return (
            <Provider
              value={this}
            >
              {viewElements}
            </Provider>
          );
        }}
      </Consumer>
    );
  }
}
