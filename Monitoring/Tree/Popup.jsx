import T from 'prop-types';
import React, {Component, Fragment} from 'react';
import IncarnateProper from 'incarnate';
import ValueRenderer from './Popup/ValueRenderer';
import {cleanDataStructure} from './Utils';
import {DefaultStyle} from '../Style/Default';

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
    data: undefined,
    search: ''
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

  getFullDependencyPath(search = '', asArray = false) {
    if (this.incarnateProper instanceof IncarnateProper) {
      const {dependencyPath} = this.props;
      const method = asArray ? ::this.incarnateProper.getPathArray : ::this.incarnateProper.getPathString;

      return method(search, dependencyPath);
    }

    return asArray ? [] : '';
  }

  onDataChange = () => {
    if (this.incarnateProper instanceof IncarnateProper) {
      clearTimeout(this.setStateTimeout);
      this.setStateTimeout = setTimeout(() => {
        const {search = ''} = this.state;
        const fullDependencyPath = this.getFullDependencyPath(search);
        const rawData = this.incarnateProper.getPath(fullDependencyPath);
        const data = cleanDataStructure(rawData);

        this.setState({
          data
        });
      }, 0);
    }
  };

  onSetSearch = (search = '') => {
    this.setState({
      search
    });

    this.onDataChange();
  };

  onSearchChange = ({target: {value = ''} = {}} = {}) => {
    this.onSetSearch(value);
  };

  onPathChange = (path) => {
    if (path instanceof Array) {
      const {search = ''} = this.state;
      const newSearch = this.incarnateProper.getPathString(path, search);

      this.onSetSearch(newSearch);
    }
  };

  render() {
    const {
      data,
      search = ''
    } = this.state;
    const fullSearchPath = this.getFullDependencyPath(search);

    return (
      <Fragment>
        <DefaultStyle/>
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start'
          }}
        >
          <input
            type='search'
            placeholder='Search'
            style={{
              flex: 1
            }}
            value={search}
            onChange={this.onSearchChange}
          />
          <br/>
          {!!search ?
            (
              <Fragment>
                <div
                  style={{
                    color: '#aaaaaa',
                    wordBreak: 'break-word'
                  }}
                >
                  &nbsp;Search Path: {fullSearchPath}
                </div>
                <br/>
              </Fragment>
            ) :
            undefined}
          <ValueRenderer
            value={data}
            onPathChange={this.onPathChange}
          />
        </main>
      </Fragment>
    );
  }
}
