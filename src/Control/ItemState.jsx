import T from 'prop-types';
import React, {PureComponent} from 'react';
import {LifePod} from '../index';

export default class ItemState extends PureComponent {
  static propTypes = {
    name: T.string,
    dependencyPath: T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ])
  };

  controller;
  getDepValue;
  setDepValue;

  getController() {
    if (!this.controller) {
      this.controller = {};
    }

    return this.controller;
  }

  render() {
    const {
      name,
      dependencyPath
    } = this.props;

    return (
      <LifePod
        name={name}
        getters={{
          getDepValue: dependencyPath
        }}
        setters={{
          setDepValue: dependencyPath
        }}
        factory={({getDepValue, setDepValue} = {}) => {
          this.getDepValue = getDepValue;
          this.setDepValue = setDepValue;

          return this.getController();
        }}
      />
    );
  }
}
