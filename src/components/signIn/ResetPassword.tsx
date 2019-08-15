import * as React from 'react';
import { CSSProperties } from 'react';
import Button from '../Button';

// styles
const continueButtonEnabled = {
    position: 'absolute',
    bottom: '-20px',
    borderRadius: '25px',
    backgroundColor: 'rgb(34, 166, 206)',
    color: 'white',
    fontWeight: '200',
    border: 'none',
    width: '230px',
    padding: '10px',
    marginTop: '0px'
};

const continueButtonDisabled = {
    position: 'absolute',
    bottom: '-20px',
    borderRadius: '25px',
    backgroundColor: 'rgb(131, 175, 189)',
    color: 'white',
    fontWeight: '200',
    border: 'none',
    width: '230px',
    padding: '10px',
    marginTop: '0px'
};

const description = {
    marginTop: '30px',
    color: 'grey',
    fontSize: '12px',
    width: '230px'
};

const emailSignIn: CSSProperties = {
    position: 'absolute',
    top: '120px',
    borderTop: 'none',
    borderRight: 'none',
    borderLeft: 'none',
    borderBottom: 'solid 1px grey',
    width: '100%'
};

const relativeForm: CSSProperties = {
    position: 'relative',
    height: '230px',
    width: '231px'
};

const headerSignIn: CSSProperties = {
    fontWeight: 'bold',
    fontSize: '28px',
    width: '230px'
};

const labelSignIn: CSSProperties = {
    color: 'grey',
    fontSize: '12px',
    marginTop: '10px',
    fontWeight: 'normal',
    width: '230px'
};

export interface ResetPasswordProps {
    header: string;
    label: string;
    value: string;
    disabledValueReset: boolean;
    disabled: object;
    onSubmit(): void;
}

const ResetPassword: React.FunctionComponent<ResetPasswordProps> = props => {
    return (
        <div style={props.disabled}>
            <form style={relativeForm}>
                <h2 style={headerSignIn}> {props.header}</h2>
                <br />
                <h4 style={labelSignIn}> {props.label} </h4>
                <br />
                <br />
                <input
                    name='email'
                    type='text'
                    value={props.value}
                    style={emailSignIn}
                />
                <p style={description}>
                    Just follow the link in our e-mail to create a new password
                    for your Scedule account.
                </p>

                <br />

                <Button
                    style={
                        props.disabledValueReset
                            ? continueButtonDisabled
                            : continueButtonEnabled
                    }
                    onButtonClick={e => {
                        props.onSubmit();
                        e.preventDefault();
                    }}
                    buttonText='Got it'
                    disabledValue={props.disabledValueReset}
                >
                    Got it
                </Button>
            </form>
        </div>
    );
};
export default ResetPassword;
