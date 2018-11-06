import T from 'prop-types';
import React, {PureComponent} from 'react';
import {LifePod} from '../index';

function getCleanIndex(index = 0) {
  const parsedIndex = parseInt(`${index}`, 10);
  const repairedIndex = `${parsedIndex}` === 'NaN' ? 0 : parsedIndex;

  return repairedIndex < 0 ? 0 : repairedIndex;
}

export default class Collection extends PureComponent {
  static propTypes = {
    name: T.string,
    dependencyPath: T.oneOfType([
      T.string,
      T.arrayOf(
        T.string
      )
    ]),
    primaryKey: T.string
  };
  defaultProps = {
    primaryKey: 'id'
  };

  controller;

  getController() {
    if (!this.controller) {
      this.controller = {
        addItems: this.addItems,
        addItem: this.addItem,
        addItemsAtIndex: this.addItemsAtIndex,
        addItemAtIndex: this.addItemAtIndex,
        removeItem: this.removeItem,
        removeItemAtIndex: this.removeItemAtIndex,
        removeItemByPrimaryKeyValue: this.removeItemByPrimaryKeyValue,
        getIndicesForItem: this.getIndicesForItem,
        getItemAtIndex: this.getItemAtIndex,
        getItemByPrimaryKeyValue: this.getItemByPrimaryKeyValue,
        getMapByPrimaryKey: this.getMapByPrimaryKey,
        setFromMap: this.setFromMap,
        addFromMap: this.addFromMap,
        moveItemByIndex: this.moveItemByIndex,
        switchItemsByIndices: this.switchItemsByIndices,
        switchItems: this.switchItems,
        updateItemByPrimaryKeyValue: this.updateItemByPrimaryKeyValue,
        updateItem: this.updateItem,
        updateItemsByMap: this.updateItemsByMap,
        clear: this.clear
      };
    }

    return this.controller;
  }

  getDepValue;
  setDepValue;

  getCurrentDepValue() {
    let value;

    if (this.getDepValue instanceof Function) {
      value = this.getDepValue();

      if (!(value instanceof Array)) {
        value = [];
      }
    }

    return value;
  }

  setNewDepValue(value = []) {
    if (this.setDepValue instanceof Function) {
      this.setDepValue(value);
    }
  }

  addItems = (items = []) => {
    const value = this.getCurrentDepValue();

    this.setNewDepValue([
      ...value,
      ...items
    ]);
  };

  addItem = (item) => {
    this.addItems([item]);
  };

  addItemsAtIndex = (items = [], index = 0) => {
    const value = this.getCurrentDepValue();
    const cleanIndex = getCleanIndex(index);

    if (cleanIndex >= value.length) {
      this.addItems(items);
    } else {
      const before = value.slice(0, cleanIndex);
      const after = value.slice(cleanIndex, value.length);

      this.setNewDepValue([
        ...before,
        ...items,
        ...after
      ]);
    }
  };

  addItemAtIndex = (item, index = 0) => {
    this.addItemsAtIndex([item], index);
  };

  removeItem = (item) => {
    const value = this.getCurrentDepValue();

    this.setNewDepValue(
      value.filter(v => v !== item)
    );
  };

  removeItemAtIndex = (index = 0) => {
    const value = this.getCurrentDepValue();
    const cleanIndex = getCleanIndex(index);

    this.setNewDepValue(
      value.filter((v, i) => i !== cleanIndex)
    );
  };

  removeItemByPrimaryKeyValue = (primaryKeyValue) => {
    const {primaryKey} = this.props;
    const value = this.getCurrentDepValue();

    this.setNewDepValue(
      value.filter(({[primaryKey]: pkv} = {}) => pkv !== primaryKeyValue)
    );
  };

  getIndicesForItem = (item) => {
    const value = this.getCurrentDepValue();

    return value.reduce((acc, v, i) => {
      if (v === item) {
        acc.push(i);
      }

      return acc;
    }, []);
  };

  getItemAtIndex = (index = 0) => {
    const value = this.getCurrentDepValue();
    const cleanIndex = getCleanIndex(index);

    return value[cleanIndex];
  };

  getItemByPrimaryKeyValue = (primaryKeyValue) => {
    const {primaryKey} = this.props;
    const value = this.getCurrentDepValue();

    return value.filter(({[primaryKey]: v} = {}) => v === primaryKeyValue)[0];
  };

  getMapByPrimaryKey = () => {
    const {primaryKey} = this.props;
    const value = this.getCurrentDepValue();

    return value.reduce((acc, item = {}) => {
      const {[primaryKey]: primaryKeyValue} = item;

      acc[primaryKeyValue] = item;

      return acc;
    }, {});
  };

  setFromMap = (map = {}) => {
    this.setNewDepValue(
      Object
        .keys(map)
        .map(k => map[k])
    );
  };

  addFromMap = (map = {}) => {
    const valueMap = this.getMapByPrimaryKey();
    const fullMap = {
      ...valueMap,
      ...map
    };

    this.setNewDepValue(
      Object
        .keys(fullMap)
        .map(k => fullMap[k])
    );
  };

  moveItemByIndex = (fromIndex = 0, toIndex = 0) => {
    const cleanFromIndex = getCleanIndex(fromIndex);
    const cleanToIndex = getCleanIndex(toIndex);

    if (cleanFromIndex !== cleanToIndex) {
      const item = this.getItemAtIndex(cleanFromIndex);
      const value = this.getCurrentDepValue();

      let newDepValue;

      if (cleanToIndex >= value.length) {
        newDepValue = [
          ...value,
          item
        ];
      } else {
        newDepValue = value.reduce((acc, v, i) => {
          if (i === cleanToIndex) {
            acc.push(item);
          }

          if (i !== cleanFromIndex) {
            acc.push(v);
          }

          return acc;
        }, []);
      }

      this.setNewDepValue(
        newDepValue
      );
    }
  };

  switchItemsByIndices = (indexA = 0, indexB = 0) => {
    const value = this.getCurrentDepValue();
    const cleanIndexA = getCleanIndex(indexA);
    const cleanIndexB = getCleanIndex(indexB);

    if (cleanIndexA !== cleanIndexB) {
      const itemA = this.getItemAtIndex(cleanIndexA);
      const itemB = this.getItemAtIndex(cleanIndexB);

      this.setNewDepValue(
        value.reduce((acc, v, i) => {
          if (i === cleanIndexA) {
            acc.push(itemB);
          } else if (i === cleanIndexB) {
            acc.push(itemA);
          } else {
            acc.push(v);
          }

          return acc;
        }, [])
      );
    }
  };

  switchItems = (itemA, itemB) => {
    const indexA = this.getIndicesForItem(itemA)[0];
    const indexB = this.getIndicesForItem(itemB)[0];

    if (typeof indexA !== 'undefined' && typeof indexB !== 'undefined') {
      this.switchItemsByIndices(indexA, indexB);
    }
  };

  updateItemByPrimaryKeyValue = (primaryKeyValue, item) => {
    const {primaryKey} = this.props;
    const value = this.getCurrentDepValue();

    this.setNewDepValue(
      value.map((v = {}) => {
        const {[primaryKey]: pkv} = v;

        return pkv === primaryKeyValue ? item : v;
      })
    );
  };

  updateItem = (item) => {
    if (item instanceof Object) {
      const {primaryKey} = this.props;
      const {[primaryKey]: primaryKeyValue} = item;

      this.updateItemByPrimaryKeyValue(primaryKeyValue, item);
    }
  };

  updateItemsByMap = (map = {}) => {
    const {primaryKey} = this.props;
    const value = this.getCurrentDepValue();

    this.setNewDepValue(
      value.map((v = {}) => {
        const {[primaryKey]: pkv} = v;

        return map.hasOwnProperty(pkv) ? map[pkv] : v;
      })
    );
  };

  clear = () => {
    this.setNewDepValue([]);
  };

  render() {
    const {
      name,
      dependencyPath
    } = this.props;

    return (
      <LifePod
        name={name}
        getters={{
          depValue: dependencyPath
        }}
        setters={{
          depValue: dependencyPath
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
