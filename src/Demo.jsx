import {hot} from 'react-hot-loader';
import React, {Component, StrictMode} from 'react';
import {
  Memoize,
  Traverse,
  IncarnateRouter,
  IncarnateSwitch,
  IncarnateRoute,
  Incarnate,
  LifePod
} from './index';
import Tree from '../Monitoring/Tree';

const MULTIPLICATION_VALUE_FILTER = n => typeof n === 'number';

export class Demo extends Component {
  render() {
    return (
      <StrictMode>
        <div>
          <IncarnateRouter
            name='Demo'
            incarnateInstanceRef={inc => window.INC = inc}
          >
            <Incarnate
              name='State'
              shared={{
                ROUTE_PROPS: 'ROUTE_PROPS'
              }}
            >
              <LifePod
                name='RandomRange'
                factory={() => 10}
              />
              <Incarnate
                name='Multiply'
                shared={{
                  ROUTE_PROPS: 'ROUTE_PROPS'
                }}
              >
                <LifePod
                  name='X'
                  dependencies={{
                    routeProps: 'ROUTE_PROPS'
                  }}
                  factory={({
                              routeProps: {
                                match: {
                                  params: {
                                    x
                                  } = {}
                                } = {}
                              } = {}
                            } = {}) => {
                    const parsed = parseFloat(x);

                    return isNaN(parsed) ? undefined : parsed;
                  }}
                />
                <Memoize
                  name='MemX'
                  dependencyPath='X'
                  filter={MULTIPLICATION_VALUE_FILTER}
                />
                <LifePod
                  name='Y'
                  dependencies={{
                    routeProps: 'ROUTE_PROPS'
                  }}
                  factory={({
                              routeProps: {
                                match: {
                                  params: {
                                    y
                                  } = {}
                                } = {}
                              } = {}
                            } = {}) => {
                    const parsed = parseFloat(y);

                    return isNaN(parsed) ? undefined : parsed;
                  }}
                />
                <Memoize
                  name='MemY'
                  dependencyPath='Y'
                  filter={MULTIPLICATION_VALUE_FILTER}
                />
              </Incarnate>
            </Incarnate>
            <Incarnate
              name='Data'
              shared={{
                State: 'State'
              }}
            >
              <LifePod
                name='RandomNumber'
                dependencies={{
                  range: 'State.RandomRange'
                }}
                factory={({range = 0} = {}) => Math.random() * range}
              />
              <LifePod
                name='Product'
                dependencies={{
                  x: 'State.Multiply.X',
                  y: 'State.Multiply.Y'
                }}
                factory={({x = 2, y = 2} = {}) => x * y}
              />
            </Incarnate>
            <LifePod
              name='MultiplyNavValues'
              dependencies={{
                x: 'State.Multiply.X',
                y: 'State.Multiply.Y',
                memX: 'State.Multiply.MemX',
                memY: 'State.Multiply.MemY'
              }}
              factory={({
                          x,
                          y,
                          memX = [],
                          memY = []
                        }) => ({
                x: typeof x !== 'number' ? [...memX].pop() : x,
                y: typeof y !== 'number' ? [...memY].pop() : y
              })}
            />
            <LifePod
              dependencies={{
                multiplyNavValues: 'MultiplyNavValues',
                history: 'ROUTE_PROPS.history'
              }}
            >
              {({
                  multiplyNavValues: {
                    x = 2,
                    y = 2
                  } = {},
                  history
                } = {}) => (
                <div>
                  <button
                    onClick={() => history.push('/random')}
                  >
                    Random Number
                  </button>
                  &nbsp;
                  <button
                    onClick={() => history.push(`/multiply/${x}/${y}`)}
                  >
                    Multiply
                  </button>
                  &nbsp;
                  <button
                    onClick={() => history.push('/query-interactions')}
                  >
                    Query Interactions
                  </button>
                  <br/>
                  <br/>
                </div>
              )}
            </LifePod>
            <Memoize
              name='RandomRangeHistory'
              dependencyPath='State.RandomRange'
            />
            <IncarnateSwitch
              defaultSubPath='random'
            >
              <IncarnateRoute
                subPath='random'
              >
                <Traverse
                  name='RandomRangeHistoryController'
                  dependencyPath='State.RandomRange'
                />
                <LifePod
                  dependencies={{
                    randomRange: 'State.RandomRange',
                    randomRangeHistory: 'RandomRangeHistory',
                    randomRangeHistoryController: 'RandomRangeHistoryController',
                    random: 'Data.RandomNumber',
                  }}
                  setters={{
                    setRandomRange: 'State.RandomRange'
                  }}
                  invalidators={{
                    invalidateRandom: 'Data.RandomNumber'
                  }}
                >
                  {({
                      randomRange = '',
                      randomRangeHistory = [],
                      randomRangeHistoryController,
                      random = 0,
                      setRandomRange,
                      invalidateRandom
                    } = {}) => (
                    <div>
                      Random Number: {random}
                      <br/>
                      <br/>
                      Random Range:
                      <br/>
                      <input
                        type='number'
                        value={randomRange}
                        onChange={({target: {value} = {}} = {}) => setRandomRange(parseFloat(value))}
                      />
                      &nbsp;
                      <button
                        onClick={() => invalidateRandom()}
                      >
                        Regenerate
                      </button>
                      <br/>
                      <br/>
                      <button
                        onClick={randomRangeHistoryController.back}
                        disabled={!randomRangeHistoryController.canUndo()}
                      >
                        Undo
                      </button>
                      &nbsp;
                      <button
                        onClick={randomRangeHistoryController.forward}
                        disabled={!randomRangeHistoryController.canRedo()}
                      >
                        Redo
                      </button>
                      <br/>
                      <br/>
                      Random Range History:
                      <br/>
                      {randomRangeHistory.map((v, i) => (
                        <div
                          key={`Value:${i}`}
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  )}
                </LifePod>
              </IncarnateRoute>
              <IncarnateRoute
                subPath='multiply/:x/:y'
              >
                <LifePod
                  dependencies={{
                    x: 'State.Multiply.X',
                    y: 'State.Multiply.Y',
                    product: 'Data.Product',
                    routeProps: 'ROUTE_PROPS'
                  }}
                >
                  {({
                      x = 2,
                      y = 2,
                      product = 0,
                      routeProps: {
                        history,
                        query: {
                          units = 'feet'
                        } = {}
                      } = {}
                    } = {}) => (
                    <div>
                      Product: {product} {units}
                      <br/>
                      <br/>
                      <input
                        type='number'
                        value={x}
                        onChange={({target: {value = 0} = {}} = {}) => history.push(`/multiply/${value}/${y}`)}
                      />
                      &nbsp;
                      *
                      &nbsp;
                      <input
                        type='number'
                        value={y}
                        onChange={({target: {value = 0} = {}} = {}) => history.push(`/multiply/${x}/${value}`)}
                      />
                      <br/>
                      <br/>
                      Units:
                      &nbsp;
                      <input
                        type='text'
                        value={units}
                        onChange={({target: {value = 'feet'} = {}} = {}) => history.push(`/multiply/${x}/${y}?units=${value}`)}
                      />
                    </div>
                  )}
                </LifePod>
              </IncarnateRoute>
              <IncarnateRoute
                subPath='query-interactions'
              >
                <LifePod
                  dependencies={{
                    routeProps: 'ROUTE_PROPS'
                  }}
                >
                  {({routeProps: {query = {}, setQuery} = {}} = {}) => (
                    <textarea
                      cols={50}
                      rows={20}
                      defaultValue={JSON.stringify(query, null, '  ')}
                      onChange={({target: {value = ''} = {}} = {}) => {
                        try {
                          setQuery(
                            JSON.parse(value)
                          );
                        } catch (error) {
                          // Ignore.
                        }
                      }}
                    >

                  </textarea>
                  )}
                </LifePod>
              </IncarnateRoute>
            </IncarnateSwitch>
            <Tree
              dependencyPath='Data'
              popup
            />
            <Tree
              dependencyPath='State'
              popup
            />
            <Tree
              popup
            />
          </IncarnateRouter>
        </div>
      </StrictMode>
    );
  }
}

export default hot(module)(Demo);
