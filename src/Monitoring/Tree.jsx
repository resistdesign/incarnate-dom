import T from 'prop-types';
import React, {Component} from 'react';
import {Consumer} from '../Context';
import IncarnateProper from 'incarnate';

const DEFAULT_POPUP_WIDTH = 300;

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

  constructor(props) {
    const {
      dependencyPath,
      popup,
      popupWidth,
      popupHeight
    } = props;

    super(props);

    if (popup) {
      this._popupWindow = window.open(
        '',
        `INCARNATE_DOM_TREE:${dependencyPath}`,
        'menubar=0 toolbar=0 location=0 personalbar=0 infobar=0 status=0 attention=1 dependent=1 alwaysRaised=1',
        true
      );
      this._popupWindow.document.title = `Incarnate DOM Tree: '${dependencyPath}'`;
      this._popupWindow.resizeTo(popupWidth, popupHeight);
    }
  }

  state = {
    output: ''
  };

  componentWillUnmount() {
    this.parentIncarnate = undefined;

    if (!!this._popupWindow) {
      this._popupWindow.close();
      this._popupWindow = undefined;
    }
  }

  onOutputChange = () => {
    const {popup} = this.props;

    if (this.parentIncarnate instanceof IncarnateProper) {
      clearTimeout(this.setStateTimeout);
      this.setStateTimeout = setTimeout(() => {
        let output,
          hasError;

        try {
          output = JSON.stringify(
            this.parentIncarnate.getPath(this.props.dependencyPath),
            null,
            '  '
          );
        } catch (error) {
          output = error && error.message;
          hasError = true;
        }

        if (popup && !!this._popupWindow) {
          const errorStyle = ' style="color: white; background-color: #D80101; padding: 1em;"';

          this._popupWindow.document.body.innerHTML = `<pre${hasError ? errorStyle : ''}>${output}</pre>`;
        } else {
          this.setState({
            output
          });
        }
      }, 0);
    }
  };

  render() {
    const {output = ''} = this.state;
    const {popup} = this.props;

    return (
      <Consumer>
        {parentIncarnate => {
          this.parentIncarnate = parentIncarnate;

          return popup ? undefined : (
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
