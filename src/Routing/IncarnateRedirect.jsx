import T from 'prop-types';
import React, {Component} from 'react';
import {Consumer} from './RoutingContext';
import {Redirect} from 'react-router-dom';
import {getUrl} from './IncarnateRoute';

export default class IncarnateRedirect extends Component {
  static propTypes = {
    ...Redirect.propTypes,
    from: T.string,
    to: T.string
  };

  render() {
    const {
      from,
      to,
      ...props
    } = this.props;

    return (
      <Consumer>
        {({parentUrl}) => (
          <Redirect
            {...props}
            from={typeof from === 'string' ? getUrl(parentUrl, from) : from}
            to={getUrl(parentUrl, to)}
          />
        )}
      </Consumer>
    );
  }
}
