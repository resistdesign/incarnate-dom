import React, {Component} from 'react';
import {BrowserRouter} from 'react-router-dom';
import Incarnate from '../Incarnate';

function removeProps(from = {}, by = {}) {
  return Object.keys(from)
    .reduce((acc, k) => {
      if (!by.hasOwnProperty(k)) {
        acc[k] = from[k];
      }

      return acc;
    }, {});
}

export default class IncarnateRouter extends Component {
  static propTypes = {
    ...BrowserRouter.propTypes,
    ...Incarnate.propTypes
  };

  render() {
    const {children} = this.props;
    const browserRouterProps = removeProps(this.props, Incarnate.propTypes);
    const incarnateProps = removeProps(this.props, BrowserRouter.propTypes);

    delete browserRouterProps.children;
    delete incarnateProps.children;

    return (
      <BrowserRouter
        {...browserRouterProps}
      >
        <Incarnate
          {...incarnateProps}
        >
          {children}
        </Incarnate>
      </BrowserRouter>
    );
  }
}
