import * as React from 'react';
import {CSSProperties} from 'react';
import classNames from 'classnames';

export interface SpinnerProps {
    style?: CSSProperties;
    className?: string;
}

const Spinner: React.FunctionComponent<SpinnerProps> = (props) => {
    return (
        <div className={classNames('spinner', props.className)} style={props.style}>
            <div className='bounce1'></div>
            <div className='bounce2'></div>
            <div className='bounce3'></div>
            <div className='bounce4'></div>
        </div>
    );
};

export default Spinner;