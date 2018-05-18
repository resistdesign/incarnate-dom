import T from 'prop-types';
import React, {PureComponent} from 'react';
import {Route} from 'react-router-dom';
import Incarnate from '../Incarnate';
import {Consumer as IncarnateConsumer} from '../Context';
import {
  Provider,
  Consumer
} from './RoutingContext';

const URL_DELIMITER = '/';
const CLASS_IDENTIFIER = {};

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

function setIncarnateDOMRouteProps(incarnateDOM, routeProps) {
  if (incarnateDOM instanceof Incarnate) {
    incarnateDOM.setRouteProps({routeProps});
  }
}

export default class IncarnateRoute extends PureComponent {
  // TRICKY: Use this to see is a React element is of the IncarnateRoute class type in IncarnateSwitch.
  // React, somehow manipulates the type of an element and class function equality test is not directly possible.
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
      <IncarnateConsumer>
        {incarnateDOM => (
          <Consumer>
            {({parentUrl}) => {
              const fullPath = typeof subPath === 'string' ? getUrl(parentUrl, subPath) : path;

              return (
                <Route
                  {...props}
                  path={fullPath}
                  render={routeProps => {
                    setIncarnateDOMRouteProps(incarnateDOM, routeProps);

                    return (
                      <Provider
                        value={{
                          parentUrl: fullPath,
                          routeProps
                        }}
                      >
                        {children instanceof Function ? children(routeProps) : children}
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
