import * as React from 'react';
import { CSSProperties } from 'react';
import Button from '../Button';

// styles
const continueButtonEnabled = {
    position: 'absolute',
    bottom: '-340px',
    borderRadius: '25px',
    backgroundColor: 'rgb(34, 166, 206)',
    color: 'white',
    fontWeight: '200',
    border: 'none',
    width: '230px',
    padding: '10px',
    marginTop: '40px'
};

const continueButtonDisabled = {
    position: 'absolute',
    bottom: '-340px',
    borderRadius: '25px',
    backgroundColor: 'rgb(131, 175, 189)',
    color: 'white',
    fontWeight: '200',
    border: 'none',
    width: '230px',
    padding: '10px',
    marginTop: '40px'
};

const errorMessageEmail: CSSProperties = {
    position: 'absolute',
    top: '490px',
    marginTop: '0px',
    color: 'red',
    fontSize: '10px'
};

const emailSignIn: CSSProperties = {
    position: 'absolute',
    top: '470px',
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

const headerSignIn: CSSProperties = {
    fontWeight: 'bold',
    fontSize: '28px'
};

const labelSignIn: CSSProperties = {
    color: 'grey',
    fontSize: '12px',
    marginTop: '10px',
    fontWeight: 'normal',
    width: '230px'
};

const labelSignInlink: CSSProperties = {
    color: 'rgb(34, 166, 206)',
    fontSize: '12px',
    marginTop: '10px',
    fontWeight: 'normal',
    width: '230px',
    cursor: 'pointer'
};

export interface EmailSignInProps {
    header: string;
    label: string;
    placeholder: string;
    email: string;
    errors: string;
    disabledValue: boolean;
    onChange(e): void;
    onSubmit(): void;
    disabled: object;
}

const EmailSignIn: React.FunctionComponent<EmailSignInProps> = props => {

    const labelDescriptionPart1 = `The App Outlook Add In makes it easy to schedule meetings with your colleagues and business partners. App identifies appointment suggestions that simply fit and that cover the calendars and personal preferences of all participants.`;
    const labelDescriptionPart2 = `If you want to experience App before signing up, just `;
    const labelDescriptionPart3 = `watch our short explanatory video`;
    const labelDescriptionGetIn = 'Do you already have an account with App? Then simply enter your registered e-mail address to sign in. If you are not yet a registered user, please enter your e-mail address to sign up.';



    return (
        <div style={props.disabled}>
            <form style={relativeForm}>
                <h2 style={headerSignIn}>{props.header}</h2>
                <br />
                <h4 style={labelSignIn}>{props.label}</h4>
                <br />
                <h4 style={labelSignIn}>{labelDescriptionPart1}</h4>
                <br />
                <h4 style={labelSignIn}>{labelDescriptionPart2} <span className='link-to-short-video' style={labelSignInlink} onClick={() => { window.open('https://App.zendesk.com/hc/en-us/articles/360022454011-Outlook-Add-In'); }}>{labelDescriptionPart3}</span>.</h4>
                <br />
                <br />
                <h2 style={headerSignIn}>Get in</h2>
                <br />
                <h4 style={labelSignIn}>{labelDescriptionGetIn}</h4>

                <input
                    name='email'
                    type='text'
                    placeholder={props.placeholder}
                    onChange={e => {
                        props.onChange(e);
                    }}
                    style={emailSignIn}
                />
                {props.errors && (
                    <div style={errorMessageEmail}>{props.errors}</div>
                )}
                <br />

                <Button
                    style={
                        props.disabledValue
                            ? continueButtonDisabled
                            : continueButtonEnabled
                    }
                    onButtonClick={e => {
                        props.onSubmit();
                        e.preventDefault();
                    }}
                    buttonText='Continue'
                    disabledValue={props.disabledValue}
                >
                    Continue
                </Button>
            </form>
        </div>
    );
};

export default EmailSignIn;
