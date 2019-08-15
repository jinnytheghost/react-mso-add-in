import * as React from 'react';
import { CSSProperties } from 'react';
import Button from '../Button';

export interface PasswordInputProps {
    header: string;
    email: string;
    errors: string;
    disabledValuePassword: boolean;
    inputType: boolean;
    onChange(e): void;
    onSubmit(): void;
    showPasswordImage: boolean;
    togglePsswordImage(): void;
    onForgotPassword(): void;
}

const PasswordInput: React.FunctionComponent<PasswordInputProps> = props => {
    return (
        <div>
            <form style={relativeForm}>
                <h2 style={headerSignIn}>{props.header}</h2>
                <br />
                <h4 style={labelSignIn}>Please sign in with your password.</h4>
                <br />
                <br />
                <img
                    style={passwordImage}
                    src={props.showPasswordImage ? showPassword : hidePassword}
                    onMouseDown={props.togglePsswordImage}
                />
                <input
                    name="password"
                    type={props.inputType ? 'password' : 'text'}
                    placeholder="Password"
                    onChange={e => {
                        props.onChange(e);
                    }}
                    style={passwordSignIn}
                />
                <div style={forgotPassword}>
                    <p
                        className="hoverForgotPassword"
                        onClick={props.onForgotPassword}
                    >
                        Forgot password
                    </p>
                </div>
                {props.errors && (
                    <div style={errorMessagePassword}>{props.errors}</div>
                )}
                <br />

                <Button
                    style={
                        props.disabledValuePassword
                            ? continueButtonDisabled
                            : continueButtonEnabled
                    }
                    onButtonClick={e => {
                        props.onSubmit();
                        e.preventDefault();
                    }}
                    buttonText="Sign In"
                    disabledValue={props.disabledValuePassword}
                >
                    Sign in
                </Button>
            </form>
        </div>
    );
};

const passwordImage: CSSProperties = {
    position: 'absolute',
    top: '113px',
    left: '205px',
    opacity: 0.6,
    cursor: 'pointer',
    zIndex: 100
};

const headerSignIn: CSSProperties = {
    fontWeight: 'bold',
    fontSize: '28px'
};

const labelSignIn: CSSProperties = {
    color: 'grey',
    fontSize: '12px',
    marginTop: '10px',
    fontWeight: 'normal'
};

const passwordSignIn: CSSProperties = {
    position: 'absolute',
    top: '110px',
    borderTop: 'none',
    borderRight: 'none',
    borderLeft: 'none',
    borderBottom: 'solid 1px grey',
    width: '230px'
};

const hidePassword = '../assets/eye-closed.png';
const showPassword = '../assets/eye-open.png';

const errorMessagePassword: CSSProperties = {
    position: 'absolute',
    top: '150px',
    marginTop: '-10px',
    color: 'red',
    fontSize: '10px'
};

const forgotPassword: CSSProperties = {
    position: 'absolute',
    top: '140px',
    color: 'grey',
    fontSize: '10px',
    marginLeft: '155px'
};

const relativeForm: CSSProperties = {
    position: 'relative',
    height: '230px'
};

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

export default PasswordInput;
