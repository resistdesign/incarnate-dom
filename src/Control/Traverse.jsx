import T from 'prop-types';
import React, {Component} from 'react';
import {LifePod} from '../index';

export default class Traverse extends Component {
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

  getController() {
    if (!this.controller) {
      this.controller = {
        back: this.back,
        forward: this.forward,
        clear: this.clear
      };
    }

    return this.controller;
  }

  setDepValue;

  past = [];
  present;
  future = [];

  moveCursor = (offset = 0) => {
    const cleanOffset = parseInt(`${offset}`, 10);

    if (cleanOffset !== 0) {
      const currentIndex = this.past.length;
      const fullHistory = [
        ...this.past,
        this.present,
        ...this.future
      ];

      let newIndex = currentIndex + cleanOffset;

      if (newIndex < 0) {
        newIndex = 0;
      }

      if (newIndex > fullHistory.length - 1) {
        newIndex = fullHistory.length - 1;
      }

      this.past = fullHistory.slice(0, newIndex);
      this.present = fullHistory.slice(newIndex, newIndex + 1);
      this.future = fullHistory.slice(newIndex + 1, fullHistory.length);

      if (this.setDepValue instanceof Function) {
        // Update the target dependency.
        this.setDepValue(this.present);
      }
    }
  };

  back = (offset = 1) => {
    this.moveCursor(offset * -1);
  };

  updatePresent = (depValue) => {
    if (depValue !== this.present) {
      this.past = [
        ...this.past,
        this.present
      ];
      this.present = depValue;
      this.future = [];
    }
  };

  forward = (offset = 1) => {
    this.moveCursor(offset);
  };

  clear = () => {
    this.past = [];
    this.future = [];
  };

  render() {
    const {
      name,
      dependencyPath
    } = this.props;

    return (
      <LifePod
        name={name}
        dependencies={{
          depValue: dependencyPath
        }}
        setters={{
          setDepValue: dependencyPath
        }}
        factory={({depValue, setDepValue} = {}) => {
          this.setDepValue = setDepValue;
          this.updatePresent(depValue);

          return this.getController();
        }}
      />
    );
  }
}
