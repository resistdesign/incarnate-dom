import T from 'prop-types';
import React, {Component} from 'react';
import {Consumer} from '../Context';
import IncarnateProper from 'incarnate';

const DEFAULT_POPUP_WIDTH = 300;

function cleanDataStructure(value, cache = []) {
  if (cache.indexOf(value) !== -1) {
    return '[Circuar Reference]'
  } else {
    if (value instanceof Window) {
      return '[Window Reference]';
    } else if (value instanceof Location) {
      return '[Location Reference]';
    } else if (typeof value === 'object' && !(value instanceof Array) && value !== null) {
      try {
        return Object
          .keys(value)
          .reduce(
            (acc, k) => ({...acc, [k]: cleanDataStructure(value[k], [...cache, value])}),
            {}
          );
      } catch (error) {
        return `[Error: ${error && error.message}]`;
      }
    } else if (value instanceof Array) {
      try {
        return value
          .map(v => cleanDataStructure(v, [...cache, value]));
      } catch (error) {
        return `[Error: ${error && error.message}]`;
      }
    } else {
      return value;
    }
  }
}

function toFormattedJSON(value) {
  if (typeof value === 'object' && !(value instanceof Array) && value !== null) {
    const sets = Object
      .keys(value)
      .map(k => `
<div class="KEY_VALUE_SET">
  <code class="KEY">${k}:</code>
  <div class="VALUE">${toFormattedJSON(value[k])}</div>
</div>
`);

    return `
<div class="OBJECT">
  ${sets.join('\n')}
</div>
        `;
  } else if (value instanceof Array) {
    const valueList = value
      .map(v => `<div class="VALUE">${toFormattedJSON(v)}</div>`);

    return `
<div class="ARRAY">
  ${valueList.join('\n')}
</div>
`;
  } else {
    return `<code class="PRIMITIVE">${JSON.stringify(value)}</code>`;
  }
}

function toHTMLJSON(value) {
  return toFormattedJSON(cleanDataStructure(value));
}

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

  state = {
    output: '',
    popupError: '',
    popupOpen: false
  };

  componentWillUnmount() {
    this.parentIncarnate = undefined;
    this.onClosePopupWindow();
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
      popup,
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
      this._popupWindow.document.title = `Incarnate DOM Tree: '${fullDepName}'`;
      this.setState({
        popupOpen: true
      });
      this.onOutputChange();
    } catch (error) {
      this.onClosePopupWindow();
      this.setState({
        popupError: error && error.message
      });
    }
  };

  onClosePopupWindow = () => {
    if (!!this._popupWindow) {
      this._popupWindow.close();
      this._popupWindow = undefined;
    }

    this.setState({
      popupOpen: false
    });
  };

  onOutputChange = () => {
    if (this.parentIncarnate instanceof IncarnateProper) {
      clearTimeout(this.setStateTimeout);
      this.setStateTimeout = setTimeout(() => {
        const {
          dependencyPath,
          popup
        } = this.props;

        let output,
          hasError;

        try {
          const pathValue = this.parentIncarnate.getPath(dependencyPath);

          output = popup ?
            toHTMLJSON(pathValue) :
            toJSON(pathValue);
        } catch (error) {
          output = error && error.message;
          hasError = true;
        }

        if (popup) {
          if (this._popupWindow) {
            const errorStyle = 'style="color: white; background-color: #D80101; padding: 1em;"';

            this._popupWindow.document.body.innerHTML = hasError ?
              `<pre ${errorStyle}>${output}</pre>` :
              `
<div class="OUTPUT">
  <style type="text/css">
    body,
    body > .OUTPUT {
      display: flex;
    }
    
    body > .OUTPUT .OBJECT > .KEY_VALUE_SET,
    body > .OUTPUT .OBJECT > .KEY_VALUE_SET > .VALUE,
    body > .OUTPUT .ARRAY > .VALUE {
      margin-left: 2em;
    }
    
    body > .OUTPUT .OBJECT > .KEY_VALUE_SET > .KEY,
    body > .OUTPUT .OBJECT > .KEY_VALUE_SET > .VALUE,
    body > .OUTPUT .ARRAY > .VALUE {
      margin-bottom: 1em;
    }
    
    body > .OUTPUT .PRIMITIVE {
      background-color: gray;
      color: white;
      padding: 1em;
    }
    
    body > .OUTPUT div {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
    }
  </style>
  ${output}
</div>
`;
          }
        } else {
          this.setState({
            output
          });
        }
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
      dependencyPath,
      popup
    } = this.props;
    const fullDepName = this.getFullDependencyName();

    return (
      <Consumer>
        {parentIncarnate => {
          this.parentIncarnate = parentIncarnate;

          return popup ? (
            popupOpen ?
              undefined :
              (
                <div
                  style={{
                    padding: '1em',
                    textAlign: 'center'
                  }}
                >
                  {popupError ? (
                    <pre
                      style={{
                        color: white,
                        backgroundColor: '#D80101',
                        padding: '1em'
                      }}
                    >
                      {popupError}
                    </pre>
                  ) : undefined}
                  <button
                    onClick={this.onOpenPopupWindow}
                  >
                    Open Monitoring Tree Window For '{fullDepName}'
                  </button>
                </div>
              )
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
