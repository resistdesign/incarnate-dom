import T from 'prop-types';
import React, {PureComponent} from 'react';
import Incarnate from '../Incarnate';

export const DEFAULT_PRIMARY_KEY = 'id';
export const STATES = {
  SELECTED: 'SELECTED',
  NEW: 'NEW',
  EXISTING: 'EXISTING',
  CHANGED: 'CHANGED',
  DELETED: 'DELETED',
  ALL: 'ALL'
};
export const SETS = {
  ACTIVE: 'ACTIVE',
  ITEMS: 'ITEMS',
  ERRORS: 'ERRORS'
};
export const OPERATIONS = {
  SELECT: 'SELECT',
  DESELECT: 'DESELECT',
  TOGGLE_SELECTION: 'TOGGLE_SELECTION',
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  RECONCILE: 'RECONCILE',
  IS: 'IS'
};

export function updateList(list = [], replace = {}, remove = []) {
  return list
    .map((item, index) => replace.hasOwnProperty(index) ? replace[index] : item)
    .filter(item => remove.indexOf(item) === -1);
}

const ITEM_IN_MAP_TESTER_FACTORY_FACTORY = (primaryKey = DEFAULT_PRIMARY_KEY) => {
  return (getItemMap) => {
    return ({[primaryKey]: key} = {}) => {
      const {[key]: item} = getItemMap() || {};

      return !!item;
    };
  };
};

export default class ItemStateController extends PureComponent {
  static propTypes = {
    name: T.string,
    primaryKey: T.string,
    reconciliationMap: T.shape({
      [STATES.NEW]: T.func,
      [STATES.EXISTING]: T.func,
      [STATES.CHANGED]: T.func,
      [STATES.DELETED]: T.func
    })
  };
  static defaultProps = {
    primaryKey: DEFAULT_PRIMARY_KEY,
    reconciliationMap: {}
  };

  render() {
    const {
      name,
      primaryKey,
      reconciliationMap = {},
      ...props
    } = this.props;
    const map = {
      [SETS.ACTIVE]: {
        subMap: {
          [STATES.NEW]: {
            required: [],
            factory: () => false
          },
          [STATES.EXISTING]: {
            required: [],
            factory: () => false
          },
          [STATES.CHANGED]: {
            required: [],
            factory: () => false
          },
          [STATES.DELETED]: {
            required: [],
            factory: () => false
          },
          [STATES.ALL]: {
            required: [
              STATES.NEW,
              STATES.EXISTING,
              STATES.CHANGED,
              STATES.DELETED
            ],
            factory: (
              newActive,
              existingActive,
              changedActive,
              deletedActive
            ) => newActive || existingActive || changedActive || deletedActive
          }
        }
      },
      [SETS.ITEMS]: {
        subMap: {
          [STATES.SELECTED]: {
            factory: () => []
          },
          [STATES.NEW]: {
            factory: () => []
          },
          [STATES.EXISTING]: {
            factory: () => ({})
          },
          [STATES.CHANGED]: {
            factory: () => []
          },
          [STATES.DELETED]: {
            factory: () => []
          },
          [STATES.ALL]: {
            required: [
              STATES.NEW,
              STATES.EXISTING,
              STATES.CHANGED,
              STATES.DELETED
            ],
            factory: (
              newItems = [],
              existingItems = {},
              changedItems = {},
              deletedItems = {}
            ) => {
              // Transpose changes.
              const updatedMap = {
                ...existingItems,
                ...changedItems
              };
              // Remove deletes.
              const cleanMap = Object
                .keys(updatedMap)
                .reduce((acc, key) => {
                  if (!deletedItems.hasOwnProperty(key)) {
                    acc[key] = updatedMap[key];
                  }

                  return acc;
                }, {});

              // Combine new and clean.
              return [
                ...newItems,
                ...Object
                  .keys(cleanMap)
                  .map(key => cleanMap[key])
              ];
            }
          }
        }
      },
      [SETS.ERRORS]: {
        subMap: {
          [STATES.NEW]: {
            factory: () => []
          },
          [STATES.EXISTING]: {
            factory: () => []
          },
          [STATES.CHANGED]: {
            factory: () => []
          },
          [STATES.DELETED]: {
            factory: () => []
          },
          [STATES.ALL]: {
            required: [
              STATES.NEW,
              STATES.EXISTING,
              STATES.CHANGED,
              STATES.DELETED
            ],
            factory: (
              newErrors = [],
              existingErrors = {},
              changedErrors = {},
              deletedErrors = {}
            ) => [
              ...newErrors,
              ...Object
                .keys(existingErrors)
                .map(key => existingErrors[key]),
              ...Object
                .keys(changedErrors)
                .map(key => changedErrors[key]),
              ...Object
                .keys(deletedErrors)
                .map(key => deletedErrors[key]),
            ]
          }
        }
      },
      [OPERATIONS.IS]: {
        subMap: {
          [STATES.SELECTED]: {
            getters: [
              [SETS.ITEMS, STATES.SELECTED]
            ],
            factory: (getSelected) => {
              return (item) => {
                const selected = getSelected() || [];

                return selected.indexOf(item) !== -1;
              };
            }
          },
          [STATES.NEW]: {
            getters: [
              [SETS.ITEMS, STATES.NEW]
            ],
            factory: (getNew) => {
              return (item) => {
                const newItems = getNew() || [];

                return newItems.indexOf(item) !== -1;
              };
            }
          },
          [STATES.EXISTING]: {
            getters: [
              [SETS.ITEMS, STATES.EXISTING]
            ],
            factory: ITEM_IN_MAP_TESTER_FACTORY_FACTORY(primaryKey)
          },
          [STATES.CHANGED]: {
            getters: [
              [SETS.ITEMS, STATES.CHANGED]
            ],
            factory: ITEM_IN_MAP_TESTER_FACTORY_FACTORY(primaryKey)
          },
          [STATES.DELETED]: {
            getters: [
              [SETS.ITEMS, STATES.DELETED]
            ],
            factory: ITEM_IN_MAP_TESTER_FACTORY_FACTORY(primaryKey)
          },
          [STATES.ALL]: {
            required: [
              STATES.SELECTED,
              STATES.NEW,
              STATES.EXISTING,
              STATES.CHANGED,
              STATES.DELETED
            ],
            factory: (
              itemIsSelected,
              itemIsNew,
              itemIsExisting,
              itemIsChanged,
              itemIsDeleted
            ) => {
              return (item) => {
                return itemIsSelected(item) ||
                  itemIsNew(item) ||
                  itemIsExisting(item) ||
                  itemIsChanged(item) ||
                  itemIsDeleted(item);
              };
            }
          }
        }
      },
      [OPERATIONS.RECONCILE]: {
        subMap: {
          [STATES.NEW]: {
            getters: [
              [SETS.ITEMS, STATES.SELECTED],
              [SETS.ITEMS, STATES.NEW],
              [SETS.ITEMS, STATES.EXISTING]
            ],
            setters: [
              [SETS.ACTIVE, STATES.NEW],
              [SETS.ITEMS, STATES.SELECTED],
              [SETS.ITEMS, STATES.NEW],
              [SETS.ITEMS, STATES.EXISTING],
              [SETS.ERRORS, STATES.NEW]
            ],
            factory: (
              getSelectedItems,
              getNewItems,
              getExistingItems,
              setNewActive,
              setSelectedItems,
              setNewItems,
              setExistingItems,
              setNewErrors
            ) => {
              return async () => {
                const newItems = getNewItems() || [];
                const {[STATES.NEW]: reconcileNew} = reconciliationMap;

                if (reconcileNew instanceof Function && newItems.length) {
                  const selectedItemsList = getSelectedItems() || [];
                  const replaceSelected = {};
                  const newErrors = [];
                  const newNewItems = [];
                  const existingItems = getExistingItems();
                  const newExistingItems = {...existingItems};

                  setNewActive(true);

                  for (let i = 0; i < newItems.length; i++) {
                    const item = newItems[i];
                    const selectedItemIndex = selectedItemsList.indexOf(item);

                    try {
                      const newItem = await reconcileNew(item);
                      const {[primaryKey]: newKey} = newItem;

                      newExistingItems[newKey] = newItem;

                      if (selectedItemIndex !== -1) {
                        replaceSelected[selectedItemIndex] = newItem;
                      }
                    } catch (error) {
                      newErrors.push(error);
                      newNewItems.push(item);
                    }
                  }

                  setNewErrors(newErrors);
                  setNewItems(newNewItems);
                  setExistingItems(newExistingItems);
                  setSelectedItems(updateList(selectedItemsList, replaceSelected));
                  setNewActive(false);
                }
              };
            }
          },
          [STATES.EXISTING]: {
            getters: [
              [SETS.ITEMS, STATES.SELECTED],
              [SETS.ITEMS, STATES.EXISTING],
              [SETS.ERRORS, STATES.EXISTING]
            ],
            setters: [
              [SETS.ACTIVE, STATES.EXISTING],
              [SETS.ITEMS, STATES.SELECTED],
              [SETS.ITEMS, STATES.EXISTING],
              [SETS.ERRORS, STATES.EXISTING]
            ],
            factory: (
              getSelectedItems,
              getExistingItems,
              getExistingErrors,
              setExistingActive,
              setSelectedItems,
              setExistingItems,
              setExistingErrors
            ) => {
              return async (query = `${Date.now()}`, ...args) => {
                const {[STATES.EXISTING]: reconcileExisting} = reconciliationMap;

                if (reconcileExisting instanceof Function) {
                  const selectedItemsList = getSelectedItems() || [];
                  const replaceSelected = {};
                  const existingItemsMap = getExistingItems() || {};
                  const newExistingItemsMap = {
                    ...existingItemsMap
                  };
                  const existingErrors = getExistingErrors() || {};
                  const newExistingErrors = {...existingErrors};

                  setExistingActive(true);

                  try {
                    const remoteExistingItems = (await reconcileExisting(query, ...args)) || [];

                    remoteExistingItems.forEach(item => {
                      const {[primaryKey]: key} = item;
                      const oldItem = existingItemsMap[key];
                      const selectedItemIndex = selectedItemsList.indexOf(oldItem);

                      newExistingItemsMap[key] = item;

                      if (selectedItemIndex !== -1) {
                        replaceSelected[selectedItemIndex] = item;
                      }
                    });
                  } catch (error) {
                    newExistingErrors[query] = error;
                  }

                  setExistingErrors(newExistingErrors);
                  setExistingItems(newExistingItemsMap);
                  setSelectedItems(updateList(selectedItemsList, replaceSelected));
                  setExistingActive(false);
                }
              };
            }
          },
          [STATES.CHANGED]: {
            getters: [
              [SETS.ITEMS, STATES.SELECTED],
              [SETS.ITEMS, STATES.CHANGED],
              [SETS.ITEMS, STATES.EXISTING]
            ],
            setters: [
              [SETS.ACTIVE, STATES.CHANGED],
              [SETS.ITEMS, STATES.SELECTED],
              [SETS.ITEMS, STATES.CHANGED],
              [SETS.ITEMS, STATES.EXISTING],
              [SETS.ERRORS, STATES.CHANGED]
            ],
            factory: (
              getSelectedItems,
              getChangedItems,
              getExistingItems,
              setChangedActive,
              setSelectedItems,
              setChangedItems,
              setExistingItems,
              setChangedErrors
            ) => {
              return async () => {
                const {[STATES.CHANGED]: reconcileChanged} = reconciliationMap;
                const changedItems = getChangedItems() || {};
                const changedItemsList = Object
                  .keys(changedItems)
                  .map(key => changedItems[key]);

                if (reconcileChanged instanceof Function && changedItemsList.length) {
                  const selectedItemsList = getSelectedItems() || [];
                  const replaceSelected = {};
                  const existingItems = getExistingItems() || {};
                  const newExistingItems = {...existingItems};
                  const newChangedItems = {};
                  const newChangedErrors = {};

                  setChangedActive(true);

                  for (let i = 0; i < changedItemsList.length; i++) {
                    const item = changedItemsList[i];
                    const {[primaryKey]: oldKey} = item;
                    const oldItem = existingItems[oldKey];
                    const selectedItemIndex = selectedItemsList.indexOf(oldItem);

                    try {
                      const newItem = await reconcileChanged(item, oldItem);
                      const {[primaryKey]: newKey} = newItem;

                      newExistingItems[newKey] = newItem;
                      delete newExistingItems[oldKey];

                      if (selectedItemIndex !== -1) {
                        replaceSelected[selectedItemIndex] = newItem;
                      }
                    } catch (error) {
                      newChangedErrors[oldKey] = error;
                      newChangedItems[oldKey] = item;
                    }
                  }

                  setChangedErrors(newChangedErrors);
                  setChangedItems(newChangedItems);
                  setExistingItems(newExistingItems);
                  setSelectedItems(updateList(selectedItemsList, replaceSelected));
                  setChangedActive(false);
                }
              };
            }
          },
          [STATES.DELETED]: {
            getters: [
              [SETS.ITEMS, STATES.DELETED],
              [SETS.ITEMS, STATES.EXISTING]
            ],
            setters: [
              [SETS.ACTIVE, STATES.DELETED],
              [SETS.ITEMS, STATES.DELETED],
              [SETS.ITEMS, STATES.EXISTING],
              [SETS.ERRORS, STATES.DELETED]
            ],
            factory: (
              getDeletedItems,
              getExistingItems,
              setDeletedActive,
              setDeletedItems,
              setExistingItems,
              setDeletedErrors
            ) => {
              return async () => {
                const {[STATES.DELETED]: reconcileDeleted} = reconciliationMap;
                const deletedItems = getDeletedItems() || {};
                const deletedItemsList = Object
                  .keys
                  .map(key => deletedItems[key]);

                if (reconcileDeleted instanceof Function && deletedItemsList.length) {
                  const existingItems = getExistingItems() || {};
                  const newExistingItems = {...existingItems};
                  const newDeletedItems = {};
                  const newDeletedErrors = {};

                  setDeletedActive(true);

                  for (let i = 0; i < deletedItemsList.length; i++) {
                    const item = deletedItemsList[i];
                    const {[primaryKey]: key} = item;

                    try {
                      await reconcileDeleted(item);

                      delete newExistingItems[key];
                    } catch (error) {
                      newDeletedErrors[key] = error;
                      newDeletedItems[key] = item;
                    }
                  }

                  setDeletedErrors(newDeletedErrors);
                  setDeletedItems(newDeletedItems);
                  setExistingItems(newExistingItems);
                  setDeletedActive(false);
                }
              };
            }
          },
          [STATES.ALL]: {
            required: [
              STATES.CHANGED,
              STATES.DELETED,
              STATES.NEW,
              STATES.EXISTING
            ],
            factory: (
              reconcileChanged,
              reconcileDeleted,
              reconcileNew,
              reconcileExisting
            ) => {
              return async () => {
                // TRICKY: IMPORTANT: The order matters.
                // Make your changes.
                await reconcileChanged();
                // Delete item, that may have even just been changed.
                await reconcileDeleted();
                // Add any new items.
                await reconcileNew();
                // Get the results.
                await reconcileExisting();
              };
            }
          }
        }
      },
      [OPERATIONS.SELECT]: {
        required: [
          [OPERATIONS.IS, STATES.SELECTED]
        ],
        getters: [
          [SETS.ITEMS, STATES.SELECTED]
        ],
        setters: [
          [SETS.ITEMS, STATES.SELECTED]
        ],
        factory: (
          isSelected,
          getSelected,
          setSelected
        ) => {
          return (item, moreThanOnce = false) => {
            if (moreThanOnce || !isSelected(item)) {
              const selectedList = getSelected() || [];
              const newSelectedList = [
                ...selectedList,
                item
              ];

              setSelected(newSelectedList);
            }
          };
        }
      },
      [OPERATIONS.DESELECT]: {
        required: [
          [OPERATIONS.IS, STATES.SELECTED]
        ],
        getters: [
          [SETS.ITEMS, STATES.SELECTED]
        ],
        setters: [
          [SETS.ITEMS, STATES.SELECTED]
        ],
        factory: (
          isSelected,
          getSelected,
          setSelected
        ) => {
          return (item, moreThanOnce = false) => {
            if (isSelected(item)) {
              const selectedList = getSelected() || [];
              const newSelectedList = [];

              let removedAtLeastOnce = false;

              for (let i = 0; i < selectedList.length; i++) {
                const selectedItem = selectedList[i];

                if (
                  item === selectedItem &&
                  (moreThanOnce || !removedAtLeastOnce)
                ) {
                  // Don't keep the selected item.
                  removedAtLeastOnce = true;
                } else {
                  // Keep the selected item.
                  newSelectedList.push(selectedItem);
                }
              }

              setSelected(newSelectedList);
            }
          };
        }
      },
      [OPERATIONS.TOGGLE_SELECTION]: {
        required: [
          [OPERATIONS.IS, STATES.SELECTED],
          OPERATIONS.SELECT,
          OPERATIONS.DESELECT
        ],
        factory: (
          isSelected,
          select,
          deselect
        ) => {
          return (item) => {
            if (isSelected(item)) {
              deselect(item, true);
            } else {
              select(item);
            }
          };
        }
      },
      [OPERATIONS.CREATE]: {
        getters: [
          [SETS.ITEMS, STATES.NEW]
        ],
        setters: [
          [SETS.ITEMS, STATES.NEW]
        ],
        factory: (
          getNewItems,
          setNewItems
        ) => {
          return (item) => {
            const newItem = {
              ...item
            };
            const newItemList = getNewItems() || [];
            const newNewItemList = [
              newItem,
              ...newItemList
            ];

            delete newItem[primaryKey];

            setNewItems(newNewItemList);

            return newItem;
          };
        }
      },
      [OPERATIONS.READ]: {
        getters: [
          [SETS.ITEMS, STATES.CHANGED],
          [SETS.ITEMS, STATES.EXISTING]
        ],
        factory: (
          getChangedItems,
          getExistingItems
        ) => {
          return (key, existingOnly = false) => {
            const {[key]: changedItem} = getChangedItems() || {};
            const {[key]: existingItem} = getExistingItems() || {};

            return existingOnly ?
              existingItem :
              (
                !!changedItem ?
                  changedItem :
                  existingItem
              );
          };
        }
      },
      [OPERATIONS.UPDATE]: {
        required: [
          [OPERATIONS.IS, STATES.NEW]
        ],
        getters: [
          [SETS.ITEMS, STATES.SELECTED],
          [SETS.ITEMS, STATES.NEW],
          [SETS.ITEMS, STATES.EXISTING],
          [SETS.ITEMS, STATES.CHANGED]
        ],
        setters: [
          [SETS.ITEMS, STATES.SELECTED],
          [SETS.ITEMS, STATES.NEW],
          [SETS.ITEMS, STATES.CHANGED]
        ],
        factory: (
          itemIsNew,
          getSelectedItems,
          getNewItems,
          getExistingItems,
          getChangedItems,
          setSelectedItems,
          setNewItems,
          setChangedItems
        ) => {
          return (newItem, oldItem) => {
            const selectedItemsList = getSelectedItems() || [];
            const replaceSelected = {};

            if (itemIsNew(oldItem)) {
              const newItemsList = getNewItems() || [];
              const newNewItemsList = [];

              for (let i = 0; i < newItemsList.length; i++) {
                const itemInNew = newItemsList[i];

                if (oldItem === itemInNew) {
                  const selectedItemIndex = selectedItemsList.indexOf(oldItem);

                  newNewItemsList.push(newItem);

                  if (selectedItemIndex !== -1) {
                    replaceSelected[selectedItemIndex] = newItem;
                  }
                } else {
                  newNewItemsList.push(itemInNew);
                }
              }

              setNewItems(newNewItemsList);
            } else {
              const {[primaryKey]: key} = newItem;
              const changedItemsMap = getChangedItems() || {};
              const existingItemsMap = getExistingItems() || {};
              const oldChangedItem = changedItemsMap[key];
              const oldExistingItem = existingItemsMap[key];
              const newChangedItemsMap = {
                [key]: newItem,
                ...changedItemsMap
              };
              const changedSelectedItemIndex = selectedItemsList.indexOf(oldChangedItem);
              const existingSelectedItemIndex = selectedItemsList.indexOf(oldExistingItem);

              setChangedItems(newChangedItemsMap);

              if (changedSelectedItemIndex !== -1) {
                replaceSelected[changedSelectedItemIndex] = newItem;
              } else if (existingSelectedItemIndex !== -1) {
                replaceSelected[existingSelectedItemIndex] = newItem;
              }
            }

            setSelectedItems(updateList(selectedItemsList, replaceSelected));
          };
        }
      },
      [OPERATIONS.DELETE]: {
        required: [
          [OPERATIONS.IS, STATES.NEW],
          [OPERATIONS.IS, STATES.CHANGED],
          OPERATIONS.DESELECT
        ],
        getters: [
          [SETS.ITEMS, STATES.NEW],
          [SETS.ITEMS, STATES.CHANGED],
          [SETS.ITEMS, STATES.DELETED]
        ],
        setters: [
          [SETS.ITEMS, STATES.NEW],
          [SETS.ITEMS, STATES.CHANGED],
          [SETS.ITEMS, STATES.DELETED]
        ],
        factory: (
          itemIsNew,
          itemIsChanged,
          deselectItem,
          getNewItems,
          getChangedItems,
          getDeletedItems,
          setNewItems,
          setChangedItems,
          setDeletedItems
        ) => {
          return (item) => {
            if (itemIsNew(item)) {
              const newItemsList = getNewItems() || [];
              const newNewItemsList = [];

              for (let i = 0; i < newItemsList.length; i++) {
                const itemInNew = newItemsList[i];

                if (item !== itemInNew) {
                  newNewItemsList.push(itemInNew);
                }
              }

              setNewItems(newNewItemsList);
            } else {
              const {[primaryKey]: key} = item;
              const deletedItemsMap = getDeletedItems() || {};
              const newDeletedItemsMap = {
                [key]: item,
                ...deletedItemsMap
              };

              if (itemIsChanged(item)) {
                // TRICKY: IMPORTANT: Remove any changed item so that they are not reconciled.
                const changedItemsMap = getChangedItems() || {};
                const newChangedItemsMap = {...changedItemsMap};

                delete newChangedItemsMap[key];

                setChangedItems(newChangedItemsMap);
              }

              setDeletedItems(newDeletedItemsMap);
            }

            deselectItem(item, true);
          };
        }
      }
    };

    return (
      <Incarnate
        {...props}
        name={name}
        map={map}
      />
    );
  }
}
