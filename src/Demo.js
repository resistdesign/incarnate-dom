import { hot } from 'react-hot-loader';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const Demo = class extends Component {
  static propTypes = {};

  constructor() {
    super();
  }

  state = {};

  render() {
    return (
      <h1>
        Demo
      </h1>
    );
  }
}

export default hot(module)(Demo);
