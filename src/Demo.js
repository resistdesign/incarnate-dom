import {hot} from 'react-hot-loader';
import React, {Component} from 'react';
import {
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
            RandomRange: 'State.RandomRange'
          }}
        >
          <LifePod
            name='RandomNumber'
            dependencies={{
              range: 'RandomRange'
            }}
            factory={({dependencies: {range = 0} = {}} = {}) => Math.random() * range}
          />
          <LifePod
            name='Product'
            dependencies={{
              x: 'State.Multiply.X',
              y: 'State.Multiply.Y'
            }}
            factory={({dependencies: {x = 2, y = 2} = {}} = {}) => x * y}
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
              dependencies: {
                x = 2,
                y = 2,
                routeProps: {
                  history
                } = {}
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
                onClick={() => history.push(`multiply/${x}/${y}`)}
              >
                Multiply
              </button>
              <br/>
              <br/>
            </div>
          )}
        </LifePod>
        <IncarnateSwitch
          defaultSubPath='random'
        >
          <IncarnateRoute
            subPath='random'
          >
            <LifePod
              dependencies={{
                randomRange: 'State.RandomRange',
                random: 'Data.RandomNumber'
              }}
              setters={{
                setRandomRange: 'State.RandomRange'
              }}
            >
              {({
                  dependencies: {
                    randomRange = '',
                    random = 0
                  },
                  setters: {
                    setRandomRange
                  }
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
                  dependencies: {
                    x = 2,
                    y = 2,
                    product = 0,
                    routeProps: {
                      history
                    } = {}
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
// TODO: Reattach Incarnate and LifePod instances in their components. Create `override` property for LifePod.
