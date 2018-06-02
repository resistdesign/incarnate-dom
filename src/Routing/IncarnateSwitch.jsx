import T from 'prop-types';
import React, {cloneElement, Children, PureComponent} from 'react';
import {Switch} from 'react-router-dom';
import {Consumer} from './RoutingContext';
import IncarnateRoute, {getUrl} from './IncarnateRoute';
import IncarnateRedirect from './IncarnateRedirect';
import LifePod from '../LifePod';

export default class IncarnateSwitch extends PureComponent {
  static propTypes = {
    ...Switch.propTypes,
    defaultSubPath: T.string
  };

  render() {
    const {
      defaultSubPath,
      children,
      ...props
    } = this.props;

    return (
      <Consumer>
        {({parentUrl}) => {
          const defaultRedirect = typeof defaultSubPath === 'string' ?
            (
              <IncarnateRedirect
                to={defaultSubPath}
                replace={true}
              />
            ) :
            undefined;

          return (
            <LifePod>
              <Switch
                {...props}
              >
                {Children.map(children, element => {
                  const {props: childProps = {}} = element || {};
                  const {CLASS_IDENTIFIER} = childProps;

                  if (
                    CLASS_IDENTIFIER instanceof Function &&
                    CLASS_IDENTIFIER() === IncarnateRoute.CLASS_IDENTIFIER()
                  ) {
                    const {subPath} = childProps;

                    return cloneElement(
                      element,
                      {
                        ...childProps,
                        path: getUrl(parentUrl, subPath)
                      }
                    );
                  } else {
                    return element;
                  }
                })}
                {defaultRedirect}
              </Switch>
            </LifePod>
          );
        }}
      </Consumer>
    );
  }
}
