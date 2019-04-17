import QS from 'qs';
import T from 'prop-types';
import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import {Provider, Consumer} from './RoutingContext';
import Incarnate, {LifePod} from '../index';

const QS_OPTIONS = {
  ignoreQueryPrefix: true,
  depth: Infinity,
  parameterLimit: Infinity,
  allowDots: true
};

const URL_DELIMITER = '/';
const CLASS_IDENTIFIER = {};

export const PATH_NAMES = {
  ROUTE_PROPS_LIST: 'ROUTE_PROPS_LIST',
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

export function getParamsObjectFromRouteProps({match: {params} = {}} = {}) {
  return params;
}

export function getQueryObjectFromRouteProps({location: {search = ''} = {}} = {}) {
  return QS.parse(
    search,
    QS_OPTIONS
  );
}

export function createQueryString(query = {}) {
  return QS.stringify(
    query,
    QS_OPTIONS
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

  render() {
    const {
      path,
      subPath,
      children,
      ...props
    } = this.props;

    return (
      <Consumer>
        {({parentUrl, routePropsList = []}) => {
          const fullPath = typeof subPath === 'string' ? getUrl(parentUrl, subPath) : path;

          return (
            <Route
              {...props}
              path={fullPath}
              render={routeProps => {
                const newRouteProps = {
                  ...routeProps,
                  params: getParamsObjectFromRouteProps(routeProps),
                  query: getQueryObjectFromRouteProps(routeProps),
                  setQuery: (query = {}) => {
                    const {
                      history,
                      location: {
                        pathname
                      } = {}
                    } = routeProps || {};

                    if (!!history) {
                      history.push({
                        pathname,
                        search: createQueryString(query)
                      });
                    }
                  }
                };
                const newRoutePropsList = [
                  newRouteProps,
                  ...routePropsList
                ];

                return (
                  <Provider
                    value={{
                      parentUrl: fullPath,
                      routePropsList: newRoutePropsList
                    }}
                  >
                    <LifePod
                      name={PATH_NAMES.ROUTE_PROPS_LIST}
                      noCache
                      override
                      factory={() => newRoutePropsList}
                    />
                    <Incarnate
                      name={PATH_NAMES.ROUTE_PROPS}
                    >
                      {Object
                        .keys(newRouteProps)
                        .map(k => (
                          <LifePod
                            key={`${PATH_NAMES.ROUTE_PROPS}:${k}`}
                            name={k}
                            noCache
                            override
                            factory={() => newRouteProps[k]}
                          />
                        ))}
                    </Incarnate>
                    {children instanceof Function ? children(newRouteProps) : children}
                  </Provider>
                );
              }}
            />
          );
        }}
      </Consumer>
    );
  }
}
