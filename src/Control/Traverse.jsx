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
        clear: this.clear,
        canUndo: this.canUndo,
        canRedo: this.canRedo
      };
    }

    return this.controller;
  }

  setDepValue;

  past = [];
  present;
  future = [];

  moveCursor = (offset = 0) => {
    const parsedOffset = parseInt(`${offset}`, 10);
    const cleanOffset = `${parsedOffset}` !== 'NaN' ? parsedOffset : 0;

    if (cleanOffset !== 0) {
      const currentIndex = this.past.length;
      const fullHistory = [
        ...this.past,
        this.present,
        ...this.future
      ];

      let newIndex = currentIndex + cleanOffset;

      if (newIndex > fullHistory.length - 1) {
        newIndex = fullHistory.length - 1;
      }

      if (newIndex < 0) {
        newIndex = 0;
      }

      this.past = fullHistory.slice(0, newIndex);
      this.present = fullHistory[newIndex];
      this.future = fullHistory.slice(newIndex + 1, fullHistory.length);

      if (this.setDepValue instanceof Function) {
        // Update the target dependency.
        this.setDepValue(this.present);
      }
    }
  };

  back = (offset = 1) => {
    const cleanOffset = typeof offset === 'number' || typeof offset === 'string' ? offset : 1;

    this.moveCursor(cleanOffset * -1);
  };

  firstUpdate = true;

  updatePresent = (depValue) => {
    if (depValue !== this.present) {
      if (this.firstUpdate) {
        this.firstUpdate = false;
      } else {
        this.past = [
          ...this.past,
          this.present
        ];
      }
      this.present = depValue;
      this.future = [];
    }
  };

  forward = (offset = 1) => {
    const cleanOffset = typeof offset === 'number' || typeof offset === 'string' ? offset : 1;

    this.moveCursor(cleanOffset);
  };

  clear = () => {
    this.past = [];
    this.future = [];
  };

  canUndo = () => {
    return this.past instanceof Array && this.past.length > 0;
  };

  canRedo = () => {
    return this.future instanceof Array && this.future.length > 0;
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
