import {hot} from 'react-hot-loader';
import React, {Component} from 'react';
import {
  Memoize,
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
            <LifePod
              dependencies={{
                randomRange: 'State.RandomRange',
                randomRangeHistory: 'RandomRangeHistory',
                random: 'Data.RandomNumber'
              }}
              setters={{
                setRandomRange: 'State.RandomRange'
              }}
            >
              {({
                  randomRange = '',
                  randomRangeHistory = [],
                  random = 0,
                  setRandomRange
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
                    history
                  } = {}
                } = {}) => (
                <div>
                  Product: {product}
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
