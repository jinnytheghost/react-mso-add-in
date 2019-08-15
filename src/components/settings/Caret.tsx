import * as React from 'react';

interface CaretProperties {
    open: boolean,
    onClick(): void
}

const style = {
    marginRight: '0.3em',
    verticalAlign: 'text-bottom',
    cursor: 'pointer',
};

const Caret: React.FunctionComponent<CaretProperties> = props => {
    return (
        <span onClick={props.onClick}
              style={style}>{props.open ? '−' : '+'}</span>
    );
};

export default Caret;
