import QueryString from 'query-string';
import T from 'prop-types';
import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import {Consumer as IncarnateConsumer} from '../Context';
import {
  Provider,
  Consumer
} from './RoutingContext';
import {
  Incarnate,
  LifePod
} from '../index';

const URL_DELIMITER = '/';
const CLASS_IDENTIFIER = {};

export const PATH_NAMES = {
  ROUTE_PROPS: 'ROUTE_PROPS'
};

export function getUrl(parentUrl = '', url = '') {
  const parentEndsWithDelimiter = parentUrl.split('').reverse()[0] === URL_DELIMITER;
  const urlStartsWithDelimiter = url.split('')[0] === URL_DELIMITER;

  if (parentEndsWithDelimiter && urlStartsWithDelimiter) {
    const newParent = parentUrl.slice(0, -1);

    return `${newParent}${url}`;
  } else if (parentEndsWithDelimiter || urlStartsWithDelimiter) {
    return `${parentUrl}${url}`;
  } else {
    return `${parentUrl}${URL_DELIMITER}${url}`;
  }
}

export function shallowObjectsMatch(a, b) {
  if (a !== b) {
    const a2 = {...a};
    const b2 = {...b};
    const keys = Object.keys({...a2, ...b2});

    for (const k of keys) {
      const vA = a2[k];
      const vB = b2[k];

      if (vA !== vB) {
        return false;
      }
    }
  }

  return true;
}

export function getQueryObjectFromRouteProps({location: {search = ''} = {}} = {}) {
  return QueryString.parse(
    search,
    {
      arrayFormat: 'bracket'
    }
  );
}

export default class IncarnateRoute extends Component {
  // TRICKY: Use this to see if a React element is of the IncarnateRoute class type in IncarnateSwitch.
  // React, somehow manipulates the type of an element and a class function equality test is not directly possible.
  static CLASS_IDENTIFIER = () => CLASS_IDENTIFIER;
  static propTypes = {
    ...Route.propTypes,
    subPath: T.string,
    CLASS_IDENTIFIER: T.any
  };
  static defaultProps = {
    CLASS_IDENTIFIER: IncarnateRoute.CLASS_IDENTIFIER
  };

  parentIncarnate;
  onRoutePropsChange;
  parentRouteProps;
  routeProps;
  // TODO: Add a parsed query object.
  mergedRouteProps = {};

  getOnRoutePropsChange(parentIncarnate) {
    if (this.parentIncarnate !== parentIncarnate) {
      this.parentIncarnate = parentIncarnate;

      if (this.parentIncarnate instanceof Incarnate) {
        this.onRoutePropsChange = this.parentIncarnate.createInvalidator(PATH_NAMES.ROUTE_PROPS);
      } else {
        this.onRoutePropsChange = undefined;
      }
    }

    return this.onRoutePropsChange;
  }

  getMergedRouteProps(routeProps, parentRouteProps, parentIncarnate) {
    if (
      !shallowObjectsMatch(routeProps, this.routeProps) ||
      !shallowObjectsMatch(parentRouteProps, this.parentRouteProps)
    ) {
      const onRoutePropsChange = this.getOnRoutePropsChange(parentIncarnate);

      this.parentRouteProps = parentRouteProps;
      this.routeProps = routeProps;
      this.mergedRouteProps = {
        ...this.parentRouteProps,
        // TRICKY: Always overwrite overlapping `parentRouteProps` property values.
        ...this.routeProps
      };

      // Add the `query` object.
      this.mergedRouteProps.query = getQueryObjectFromRouteProps(this.mergedRouteProps);

      if (onRoutePropsChange instanceof Function) {
        // Update route props dependency.
        onRoutePropsChange();
      }
    }

    return this.mergedRouteProps;
  }

  render() {
    const {
      path,
      subPath,
      children,
      ...props
    } = this.props;

    return (
      <IncarnateConsumer>
        {parentIncarnate => (
          <Consumer>
            {({parentUrl, routeProps: parentRouteProps}) => {
              const fullPath = typeof subPath === 'string' ? getUrl(parentUrl, subPath) : path;

              return (
                <Route
                  {...props}
                  path={fullPath}
                  render={routeProps => {
                    const mergedRouteProps = this.getMergedRouteProps(
                      routeProps,
                      parentRouteProps,
                      parentIncarnate
                    );

                    return (
                      <Provider
                        value={{
                          parentUrl: fullPath,
                          routeProps: mergedRouteProps
                        }}
                      >
                        <LifePod
                          name={PATH_NAMES.ROUTE_PROPS}
                          factory={() => mergedRouteProps}
                          noCache
                          override
                        />
                        {children instanceof Function ? children(mergedRouteProps) : children}
                      </Provider>
                    );
                  }}
                />
              );
            }}
          </Consumer>
        )}
      </IncarnateConsumer>
    );
  }
}
