import T from 'prop-types';
import React, {PureComponent} from 'react';
import {
  Collection,
  Incarnate,
  LifePod
} from '../index';

export default class ItemState extends PureComponent {
  static propTypes = {
    name: T.string
  };

  controller;

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
      <Incarnate
        name={name}
      >
        <LifePod
          name='Selected'
        />
        <LifePod
          name='New'
        />
        <LifePod
          name='Existing'
        />
        <LifePod
          name='Changed'
        />
        <LifePod
          name='Removed'
        />
        <LifePod
          name='Detailed'
        />
        <Incarnate
          name='CollectionControllers'
          shared={{
            Selected: 'Selected',
            New: 'New',
            Existing: 'Existing',
            Changed: 'Changed',
            Removed: 'Removed',
            Detailed: 'Detailed'
          }}
        >
          <Collection
            name='Selected'
            dependencyPath='Selected'
          />
          <Collection
            name='New'
            dependencyPath='New'
          />
          <Collection
            name='Existing'
            dependencyPath='Existing'
          />
          <Collection
            name='Changed'
            dependencyPath='Changed'
          />
          <Collection
            name='Removed'
            dependencyPath='Removed'
          />
          <Collection
            name='Detailed'
            dependencyPath='Detailed'
          />
        </Incarnate>
        <LifePod
          name='Controller'
          factory={() => {


            return this.getController();
          }}
        />
      </Incarnate>
    );
  }
}
