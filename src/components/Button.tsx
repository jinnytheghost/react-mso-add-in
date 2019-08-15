import * as React from 'react';

export interface ButtonProps {
    style: object;
    buttonText: string;
    onButtonClick(e): void;

    disabledValue: boolean;
}

const Button: React.SFC<ButtonProps> = props => {
    return (
        <button
            type='submit'
            style={props.style}
            onClick={e => props.onButtonClick(e)}
            disabled={props.disabledValue}
            className='btn'
        >
            {props.buttonText}
        </button>
    );
};

export default Button;
