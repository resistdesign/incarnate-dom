import {hot} from 'react-hot-loader';
import React, {Component} from 'react';
import {
  Memoize,
  Traverse,
  IncarnateRouter,
  IncarnateSwitch,
  IncarnateRoute,
  Incarnate,
  LifePod
} from './index';

export class Demo extends Component {
  render() {
    return (
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
                                x = 2
                              } = {}
                            } = {}
                          } = {}
                        } = {}) => parseFloat(x)}
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
                                y = 2
                              } = {}
                            } = {}
                          } = {}
                        } = {}) => parseFloat(y)}
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
          dependencies={{
            x: 'State.Multiply.X',
            y: 'State.Multiply.Y',
            routeProps: 'ROUTE_PROPS'
          }}
        >
          {({
              x = 2,
              y = 2,
              routeProps: {
                history
              } = {}
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
        </IncarnateSwitch>
      </IncarnateRouter>
    );
  }
}

export default hot(module)(Demo);
