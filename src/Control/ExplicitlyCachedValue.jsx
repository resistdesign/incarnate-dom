import T from 'prop-types';
import React, {Component} from 'react';
import {LifePod} from '../index';

/**
 * Use this controller to safeguard against unnecessary updates due to the
 * nature of the invalidation chain.
 * */
export default class ExplicitlyCachedValue extends Component {
  static propTypes = {
    name: T.string,
    dependencyPath: T.string
  };

  value = undefined;
  changeHandlerSet = false;

  render() {
    const {
      name,
      dependencyPath = ''
    } = this.props;

    return (
      <LifePod
        name={name}
        getters={{
          getValue: dependencyPath
        }}
        setters={{
          setCachedValue: name
        }}
        listeners={{
          onValueChange: dependencyPath
        }}
        override
        factory={({
                    getValue,
                    onValueChange,
                    setCachedValue
                  } = {}) => {
          if (!this.changeHandlerSet) {
            this.changeHandlerSet = true;

            onValueChange(() => {
              const depValue = getValue();

              if (typeof depValue !== 'undefined') {
                this.value = depValue;

                setCachedValue(this.value);
              }
            });

            this.value = getValue();
          }

          return this.value;
        }}
      />
    );
  }
}
