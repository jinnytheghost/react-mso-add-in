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

const emailSignUp: CSSProperties = {
    position: 'absolute',
    top: '120px',
    borderTop: 'none',
    borderRight: 'none',
    borderLeft: 'none',
    borderBottom: 'solid 1px grey',
    width: '230px'
};

const relativeForm: CSSProperties = {
    position: 'relative',
    height: '230px'
};

const headerSignUp: CSSProperties = {
    fontWeight: 'bold',
    fontSize: '28px',
};

const labelSignUp: CSSProperties = {
    color: 'grey',
    fontSize: '12px',
    marginTop: '10px',
    fontWeight: 'normal',
    width: '230px'
};

export interface SignUpProps {
    header: string;
    label: string;
    value: string;
    linkMessage: string;
    disabledValueSignUp: boolean;
    disabled: object;
    onSubmit(): void;
    onResendConfirmationEmail(): void;
}

const SignUp: React.FunctionComponent<SignUpProps> = props => {
    return (
        <div style={props.disabled}>
            <form style={relativeForm}>
                <h2 style={headerSignUp}> {props.header}</h2>
                <br />
                <h4 style={labelSignUp}> {props.label} </h4>
                <br />
                <br />
                <input
                    name='email'
                    type='text'
                    value={props.value}
                    style={emailSignUp}
                />
                <div style={(props.linkMessage !== 'E-mail sent') ? resendLink : emailSent}>
                    <p
                        className='hoverForgotPassword'
                        onClick={props.onResendConfirmationEmail}
                    >
                        {props.linkMessage}
                    </p>
                </div>
                <p style={description}>
                    Just follow the link in our e-mail to confirm your address.
                    You will then be able to sign up for App.
                </p>

                <br />

                <Button
                    style={
                        props.disabledValueSignUp
                            ? continueButtonDisabled
                            : continueButtonEnabled
                    }
                    onButtonClick={e => {
                        props.onSubmit();
                        e.preventDefault();
                    }}
                    buttonText='Got it'
                    disabledValue={props.disabledValueSignUp}
                >
                    Got it
                </Button>
            </form>
        </div>
    );
};

const resendLink: CSSProperties = {
    position: 'absolute',
    top: '138px',
    color: 'grey',
    fontSize: '10px',
    marginLeft: '87px'
};

const emailSent: CSSProperties = {
    position: 'absolute',
    top: '138px',
    color: 'grey',
    fontSize: '10px',
    marginLeft: '177px'
};

export default SignUp;
