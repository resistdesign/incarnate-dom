import T from 'prop-types';
import React, {Component} from 'react';
import IncarnateProper from 'incarnate';
import ValueRenderer from './Popup/ValueRenderer';
import {cleanDataStructure} from './Utils';

export default class Popup extends Component {
  static propTypes = {
    dependencyPath: T.string,
    incarnateProper: T.instanceOf(IncarnateProper)
  };
  static defaultProps = {
    dependencyPath: ''
  };

  /**
   * @type {IncarnateProper}
   * */
  _incarnateProper;

  get incarnateProper() {
    return this._incarnateProper;
  }

  set incarnateProper(value) {
    const {dependencyPath} = this.props;

    if (this._incarnateProper instanceof IncarnateProper) {
      this._incarnateProper.removeChangeHandler(dependencyPath, this.onDataChange);
    }

    this._incarnateProper = value;

    if (this._incarnateProper instanceof IncarnateProper) {
      this._incarnateProper.addChangeHandler(dependencyPath, this.onDataChange);
    }
  }

  setStateTimeout;

  state = {
    data: undefined
  };

  componentDidMount() {
    const {incarnateProper} = this.props;

    this.incarnateProper = incarnateProper;
    this.onDataChange();
  }

  componentWillUnmount() {
    clearTimeout(this.setStateTimeout);
    this.incarnateProper = undefined;
  }

  onDataChange = () => {
    if (this.incarnateProper instanceof IncarnateProper) {
      clearTimeout(this.setStateTimeout);
      this.setStateTimeout = setTimeout(() => {
        const {dependencyPath} = this.props;
        const rawData = this.incarnateProper.getPath(dependencyPath);
        const data = cleanDataStructure(rawData);

        this.setState({
          data
        });
      }, 0);
    }
  };

  render() {
    const {data} = this.state;

    return (
      <main>
        <ValueRenderer
          value={data}
        />
      </main>
    );
  }
}
