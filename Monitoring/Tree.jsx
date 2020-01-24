import T from 'prop-types';
import ReactDOM from 'react-dom';
import React, {Component} from 'react';
import {Consumer} from '../src/Context';
import IncarnateProper from 'incarnate';
import {cleanDataStructure} from './Tree/Utils';
import Popup from './Tree/Popup';

const DEFAULT_POPUP_WIDTH = 400;

function toJSON(value) {
  return JSON.stringify(
    cleanDataStructure(value),
    null,
    '  '
  );
}

export default class Tree extends Component {
  static propTypes = {
    dependencyPath: T.string,
    popup: T.bool,
    popupWidth: T.number,
    popupHeight: T.number
  };
  static defaultProps = {
    dependencyPath: '',
    popupWidth: DEFAULT_POPUP_WIDTH,
    popupHeight: (16 / 9) * DEFAULT_POPUP_WIDTH
  };

  setStateTimeout;
  _parentIncarnate;

  get parentIncarnate() {
    return this._parentIncarnate;
  }

  set parentIncarnate(value) {
    if (value !== this._parentIncarnate) {
      if (this._parentIncarnate instanceof IncarnateProper) {
        this._parentIncarnate.removeChangeHandler(this.props.dependencyPath, this.onOutputChange);
      }

      this._parentIncarnate = value;

      if (this._parentIncarnate instanceof IncarnateProper) {
        this._parentIncarnate.addChangeHandler(this.props.dependencyPath, this.onOutputChange);
        this.onOutputChange();
      }
    }
  }

  _popupWindow;

  mounted = false;

  state = {
    output: '',
    popupOpen: false,
    popupError: undefined
  };

  safeSetState = (...args) => !!this.mounted ? this.setState(...args) : undefined;

  componentDidMount() {
    this.mounted = true;
    this.onOutputChange();
  }

  componentWillUnmount() {
    this.onClosePopupWindow();
    this.parentIncarnate = undefined;
    this.mounted = false;
  }

  getFullDependencyName() {
    const {dependencyPath = ''} = this.props;
    const {
      name: parentName = '',
      pathDelimiter = ''
    } = this.parentIncarnate || {};

    return `${parentName}${parentName && dependencyPath ? pathDelimiter : ''}${dependencyPath}`;
  }

  onOpenPopupWindow = () => {
    const {
      dependencyPath,
      popupWidth,
      popupHeight
    } = this.props;
    const fullDepName = this.getFullDependencyName();

    this.onClosePopupWindow();

    try {
      this._popupWindow = window.open(
        '',
        `INCARNATE_DOM_TREE:${fullDepName}`,
        `width=${popupWidth},height=${popupHeight},menubar=0,toolbar=0,location=0,personalbar=0,infobar=0,status=0,attention=1,dependent=1,alwaysRaised=1`,
        true
      );
      this._popupWindow.onbeforeunload = this.onClosePopupWindow;
      // TRICKY: Clear the popup head and body in case this window is being replaced/reused.
      this._popupWindow.document.head.innerHTML = '';
      this._popupWindow.document.body.innerHTML = '';
      this._popupWindow.document.title = `Incarnate DOM Tree: '${fullDepName}'`;
      const popupRootElement = this._popupWindow.document.createElement('div');
      this._popupWindow.document.body.appendChild(popupRootElement);
      ReactDOM.render(
        (
          <Popup
            dependencyPath={dependencyPath}
            incarnateProper={this.parentIncarnate}
          />
        ),
        popupRootElement
      );
      this.safeSetState({
        popupOpen: true,
        popupError: undefined
      });
    } catch (error) {
      this.onClosePopupWindow();

      this.safeSetState({
        popupError: error && error.message
      });
    }
  };

  onClosePopupWindow = () => {
    if (!!this._popupWindow) {
      this._popupWindow.close();
      this._popupWindow = undefined;
    }

    this.safeSetState({
      popupOpen: false
    });
  };

  onOutputChange = () => {
    if (this.parentIncarnate instanceof IncarnateProper) {
      clearTimeout(this.setStateTimeout);
      this.setStateTimeout = setTimeout(() => {
        const {dependencyPath} = this.props;

        let output;

        try {
          const pathValue = this.parentIncarnate.getPath(dependencyPath);

          output = toJSON(pathValue);
        } catch (error) {
          output = error && error.message;
        }

        this.safeSetState({
          output
        });
      }, 0);
    }
  };

  render() {
    const {
      output = '',
      popupError = '',
      popupOpen
    } = this.state;
    const {
      popup
    } = this.props;
    const fullDepName = this.getFullDependencyName();

    return (
      <Consumer>
        {parentIncarnate => {
          this.parentIncarnate = parentIncarnate;

          return popup ? (
            <div
              style={{
                padding: '1em',
                textAlign: 'center'
              }}
            >
              {popupError ? (
                <pre
                  style={{
                    color: 'white',
                    backgroundColor: '#D80101',
                    padding: '1em'
                  }}
                >
                      {popupError}
                    </pre>
              ) : undefined}
              {popupOpen ?
                undefined :
                (
                  <button
                    onClick={this.onOpenPopupWindow}
                  >
                    Open Monitoring Tree Window For '{fullDepName}'
                  </button>
                )}
            </div>
          ) : (
            <pre
              style={{
                backgroundColor: 'black',
                color: 'white',
                position: 'absolute',
                top: 0,
                right: 0,
                left: '50vw',
                opacity: 0.25,
                pointerEvents: 'none',
                margin: 0,
                padding: '1em'
              }}
            >
              {output}
            </pre>
          );
        }}
      </Consumer>
    );
  }
}
