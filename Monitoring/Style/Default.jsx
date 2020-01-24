export const DefaultStyle = `
main {
    font-family: sans-serif
}

main details > summary {
    color: #777;
    padding: 1em
}

main details > summary:focus {
    outline: none;
    border-bottom: .25em solid #ddd;
    margin-bottom: -.25em;
    animation: SummaryFocusAnimation 1s forwards infinite ease-in-out
}

@keyframes SummaryFocusAnimation {
    0% {
        border-bottom: .25em solid #ddd
    }
    50% {
        border-bottom: .25em solid hsla(0, 0%, 87%, 0)
    }
    to {
        border-bottom: .25em solid #ddd
    }
}

main section {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: row;
    flex-direction: row;
    -ms-flex-align: stretch;
    align-items: stretch;
    -ms-flex-pack: stretch;
    justify-content: stretch;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap
}

main section > * {
    -ms-flex: 1;
    flex: 1
}

main section > details, main section > div {
    margin-left: .5em
}

main section > details:first-child, main section > div:first-child {
    margin-left: 0
}

main details, main div {
    position: relative;
    box-sizing: border-box;
    border-top: .25em solid #ddd;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    -ms-flex-align: stretch;
    align-items: stretch;
    -ms-flex-pack: stretch;
    justify-content: stretch;
    margin: 0;
    padding: 0
}

main details > *, main div > * {
    -ms-flex: 1;
    flex: 1
}

main details:before, main div:before {
    content: "";
    width: .25em;
    height: 1.5em;
    background: #ddd;
    position: absolute;
    margin: -.25em 0 0 -.25em
}

main details details, main details div, main div details, main div div {
    margin-top: .5em;
    margin-left: .5em
}

main details section, main div section {
    margin-left: .5em
}

main button {
    background-color: #aaa;
    color: #fff;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: 0 solid #000;
    box-sizing: border-box;
    margin: 0;
    padding: 2em;
    font-size: 1em;
    cursor: pointer;
    transition: background-color .5s ease-in-out, color .5s ease-in-out
}

main button:focus {
    outline: none;
    transition: none;
    animation: ButtonFocusBackgroundAnimation 1s forwards infinite ease-in-out
}

@keyframes ButtonFocusBackgroundAnimation {
    0% {
        background-color: #aaa;
        color: #fff
    }
    50% {
        background-color: #fff;
        color: unset
    }
    to {
        background-color: #aaa;
        color: #fff
    }
}

main button:active {
    background-color: #fff;
    color: unset;
    animation: none
}

main textarea {
    min-height: 9em;
    resize: none
}

main input, main textarea {
    background-color: #eee;
    color: #777;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: 0 solid #000;
    box-sizing: border-box;
    margin: 0;
    padding: 1em;
    font-size: 1em;
    transition: background-color .5s ease-in-out, color .5s ease-in-out
}

main input:focus, main textarea:focus {
    outline: none;
    background: none;
    color: unset;
    border-bottom: .25em solid #ddd;
    margin-bottom: -.25em;
    animation: InputFocusBorderAnimation 1s forwards infinite ease-in-out
}

@keyframes InputFocusBorderAnimation {
    0% {
        border-bottom: .25em solid #ddd
    }
    50% {
        border-bottom: .25em solid hsla(0, 0%, 87%, 0)
    }
    to {
        border-bottom: .25em solid #ddd
    }
}

main textarea:focus {
    margin-bottom: 0
}

main code, main pre {
    box-sizing: border-box;
    background-color: #f7f7f7;
    margin: 0;
    padding: .75em;
    display: inline-block;
    font-size: 1.25em;
    color: #000
}

main code:before, main pre:before {
    content: ">";
    height: 100%;
    color: #ccc;
    margin-right: .5em
}
`;
