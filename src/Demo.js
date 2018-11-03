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
        >
          <LifePod
            name='RandomRange'
            factory={() => 10}
          />
        </Incarnate>
        <Incarnate
          name='Utils'
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
        </Incarnate>
        <IncarnateSwitch
          defaultSubPath='random'
        >
          <IncarnateRoute
            subPath='random'
          >
            <LifePod
              dependencies={{
                randomRange: 'State.RandomRange',
                random: 'Utils.RandomNumber'
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

          </IncarnateRoute>
        </IncarnateSwitch>
      </IncarnateRouter>
    );
  }
}

export default hot(module)(Demo);
