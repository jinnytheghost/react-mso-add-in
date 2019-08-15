import * as React from 'react';
import { isEmpty, validateEmail, validatePassword } from '../../utils/StringUtil';
import {
    verifyIfUserExists,
    getUser,
    runResetPasswordflow,
    registerNewEmail,
    resendConfirmationEmail
} from '../../services/AppAuthService';
import EmailInput from './EmailInput';
import PasswordInput from './PasswordInput';
import ResetPassword from './ResetPassword';
import SignUp from './SignUp';

export interface Props {
    onSignIn: (userCredentials) => void;
}

export interface State {
    email: string;
    onButtonClick(): void;
    style: object;
    buttonText: string;
    errors: object;
    newUser: object;
    disabledValue: boolean;
    showPasswordInput: boolean;
    inputType: boolean;
    showPasswordImage: boolean;
    disabledValuePassword: boolean;
    disabledValueReset: boolean;
    disabledValueSignUp: boolean;
    showEmailInput: boolean;
    showPasswordReset: boolean;
    showSignUp: boolean;
    userCredentials: object;
    linkMessage: string;
}

class LoginForm extends React.Component<Props, State> {
    state = {
        email: '',
        style: {},
        buttonText: '',
        onButtonClick: () => { },
        validateEmail: () => { },
        errors: {
            email: '',
            password: ''
        },
        newUser: {
            email: '',
            password: ''
        },
        disabledValue: true,
        disabledValuePassword: true,
        disabledValueReset: false,
        disabledValueSignUp: false,
        showPasswordInput: false,
        inputType: true,
        showPasswordImage: false,
        showEmailInput: true,
        showPasswordReset: false,
        showSignUp: false,
        linkMessage: 'Resend the confirmation e-mail',
        userCredentials: {
            username: '',
            email: ''
        }
    };

    handleSubmit = () => {
        verifyIfUserExists(this.state.email)
            .then(response => {
                if (response === 'Email is required') {
                    const emailRequired = {
                        email: 'Email is required'
                    };
                    this.setState({
                        errors: emailRequired
                    });
                }

                if (response['data'].status === 'registered') {
                    let email = '';
                    const showEmailInput = false;
                    const showPasswordInput = true;
                    this.setState({
                        showEmailInput,
                        showPasswordInput,
                        email
                    });
                } else {
                    const emailUnregistered = {
                        email: 'Please, confirm registration from email'
                    };
                    this.setState({ errors: emailUnregistered });
                }
            })
            .catch(ex => {
                if (ex.response && ex.response.status === 404) {
                    // send register email confirmation
                    registerNewEmail(this.state.newUser.email).then(data => {
                        console.log('registerNewEmail: ', data);
                    });

                    // go to confirmation sign up page with ability to resend registration email
                    const showEmailInput = false;
                    const showPasswordInput = false;
                    const showPasswordReset = false;
                    const showSignUp = true;
                    this.setState({
                        showEmailInput,
                        showPasswordInput,
                        showSignUp,
                        showPasswordReset
                    });
                } else if (ex.response && ex.response.status === 500) {
                    const emailPattern = {
                        password:
                            'We`re sorry, but something going wrong on the server! Please, try again later.'
                    };
                    this.setState({ errors: emailPattern });
                } else {
                    console.log(
                        'We`re sorry, but something going wrong on the server! Please, try again later.'
                    );
                }
            });
    }

    validate = () => {
        let errors = {
            email: '',
            password: ''
        };
        const { email, password } = this.state.newUser;
        if (isEmpty(email)) {
            errors.email = '';
        }
        let emailTested = validateEmail(email);
        if (isEmpty(password)) {
            errors.password = 'Password is required!';
        }
        let passwordTested = validatePassword(password);
        if (!emailTested) {
            errors.email = 'Please, enter correct e-mail address.';
        }
        if (!passwordTested) {
            errors.password = 'Wrong password';
        }
        return Object.keys(errors).length === 0 ? null : errors;
    }

    handleChange = e => {
        const errors = { ...this.state.errors };
        const errorMessage = this.validateProperty(e.target);
        if (
            errorMessage &&
            (errorMessage !== 'Please, enter correct e-mail address.' ||
                errorMessage !== 'Wrong password')
        ) {
            errors[e.target.name] = errorMessage;
        } else {
            delete errors[e.target.name];
        }

        let value = e.target.value;
        let name = e.target.name;
        this.setState(
            prevState => {
                return {
                    newUser: {
                        ...prevState.newUser,
                        [name]: value
                    },
                    errors,
                    email: value
                };
            },
            () => { }
        );
    }

    validateProperty = (input: any): any => {
        if (input.name === 'email') {
            if (isEmpty(input.value)) {
                return 'Email is required';
            } else {
                let newUser = {
                    email: '',
                    password: ''
                };

                let errors = {
                    email: '',
                    password: ''
                };

                const email = input.value;

                newUser.email = email.toLowerCase();
                this.setState({
                    newUser
                });

                const errorsFromValidate = this.validate();
                errors.email = errorsFromValidate.email;
                errors.password = errorsFromValidate.password;
                if (validateEmail(input.value)) {
                    let disabledValue = false;
                    errors.email = '';
                    this.setState({ disabledValue, errors });
                }
                let errorMessage;
                if (errors.email) {
                    errorMessage = errorsFromValidate.email
                        ? 'Please, enter correct e-mail address.'
                        : null;
                }
                return errorMessage;
            }
        } else if (input.name === 'password') {
            if (isEmpty(input.value)) {
                return 'Password is required';
            } else {
                const email = this.state.newUser.email;
                let newUser = {
                    email: email.toLowerCase(),
                    password: ''
                };

                let errors = {
                    email: '',
                    password: ''
                };

                newUser.password = input.value;
                this.setState({
                    newUser
                });

                const errorsFromValidate = this.validate();
                errors.email = errorsFromValidate.email;
                errors.password = errorsFromValidate.password;
                if (validatePassword(input.value)) {
                    let disabledValuePassword = false;
                    errors.password = '';
                    this.setState({ disabledValuePassword, errors });
                }
                let errorMessage;
                if (errors.password) {
                    errorMessage = errorsFromValidate.password ? '' : null;
                }
                return errorMessage;
            }
        }
        if (input.name === 'password') {
            if (isEmpty(input.value)) {
                return 'Password is required';
            }
        }
    }

    handleSubmitPassword = () => {
        const userCredentials = {
            password: this.state.newUser.password,
            email: this.state.newUser.email
        };

        const userAppToken = btoa(
            `${userCredentials.email}:${userCredentials.password}`
        );

        getUser(userAppToken)
            .then(response => {
                if (response.status === 200) {
                    const showEmailInput = false;
                    const userCredentials = {
                        username: response['name'],
                        email: response['email']
                    };
                    this.setState({
                        showEmailInput,
                        userCredentials
                    });
                    this.props.onSignIn(userCredentials);
                }
            })
            .catch(ex => {
                if (ex.response && ex.response.status === 401) {
                    const wrongPassword = {
                        password: 'Wrong password'
                    };
                    this.setState({ errors: wrongPassword });
                } else if (ex.response && ex.response.status === 500) {
                    const passwordPattern = {
                        password: 'Please, enter the valid password'
                    };
                    this.setState({ errors: passwordPattern });
                }
            });
    }

    togglePsswordImage = () => {
        const showPasswordImage = !this.state.showPasswordImage;
        const inputType = !this.state.inputType;
        this.setState({
            showPasswordImage,
            inputType
        });
    }

    handleForgotPassword = () => {
        const showEmailInput = false;
        const showPasswordInput = false;
        const showSignUp = false;
        const showPasswordReset = true;
        this.setState({
            showEmailInput,
            showPasswordInput,
            showSignUp,
            showPasswordReset
        });
        const email = this.state.newUser.email;
        runResetPasswordflow(email).then(res =>
            console.log(
                'The password reset flow has been started and the notification mail has been sent. Res.status: ',
                res.status
            )
        );
    }

    handleGotIt = () => {
        // show sign in password component
        const showEmailInput = false;
        const showPasswordInput = true;
        const showPasswordReset = false;
        const showSignUp = false;
        this.setState({
            showEmailInput,
            showPasswordInput,
            showPasswordReset,
            showSignUp
        });
    }

    handleGotItSignUp = () => {
        const showEmailInput = true;
        const showPasswordInput = false;
        const showPasswordReset = false;
        const showSignUp = false;
        const disabledValue = true;
        const newUser = {
            email: '',
            password: ''
        };
        this.setState({
            showEmailInput,
            showPasswordInput,
            showPasswordReset,
            showSignUp,
            newUser,
            disabledValue
        });
    }

    handleResendConfirmationEmail = () => {
        resendConfirmationEmail(this.state.newUser.email).then(response => {
            if (response.status === 403) {
                const errors = {
                    email: response.data.errorMessage,
                    password: ''
                };

                const linkMessage =
                    'The caller is forbidden to resend the mail.';

                this.setState({
                    errors,
                    linkMessage
                });
            } else if (response.status === 412) {
                const errors = {
                    email: response.data.errorMessage,
                    password: ''
                };

                const linkMessage =
                    'RegistrationData is not in a state to resend the verification mail.';

                this.setState({
                    errors,
                    linkMessage
                });
            } else {
                let linkMessage = 'E-mail sent';
                this.setState({
                    linkMessage
                });
            }
            setTimeout(() => {
                const linkMessage = 'Resend the confirmation e-mail';
                this.setState({
                    linkMessage
                });
            }, 10000);
        });
    }

    render() {
        if (this.state.showEmailInput) {
            const emailInputLabel = `App is your smartest tool to find the best time for your next business meeting.`;
            return (
                <div>
                    <EmailInput
                        header='Welcome'
                        label={emailInputLabel}
                        placeholder='E-mail'
                        email={this.state.email}
                        errors={this.state.errors.email}
                        disabledValue={this.state.disabledValue}
                        onChange={e => {
                            this.handleChange(e);
                        }}
                        onSubmit={this.handleSubmit}
                        disabled={
                            this.state.showEmailInput ? styleShow : styleHide
                        }
                    />
                </div>
            );
        }

        if (this.state.showPasswordInput) {
            return (
                <div>
                    <PasswordInput
                        header='Sign in'
                        inputType={this.state.inputType}
                        email={this.state.email}
                        errors={this.state.errors.password}
                        disabledValuePassword={this.state.disabledValuePassword}
                        onChange={e => {
                            this.handleChange(e);
                        }}
                        onForgotPassword={this.handleForgotPassword}
                        onSubmit={this.handleSubmitPassword}
                        showPasswordImage={this.state.showPasswordImage}
                        togglePsswordImage={this.togglePsswordImage}
                    />
                </div>
            );
        }
        if (this.state.showPasswordReset) {
            return (
                <div>
                    <ResetPassword
                        header='Password reset'
                        label='Please, check your inbox. We`ve sent an e-mail to:'
                        value={this.state.newUser.email}
                        disabledValueReset={this.state.disabledValueReset}
                        onSubmit={this.handleGotIt}
                        disabled={
                            this.state.showPasswordReset ? styleShow : styleHide
                        }
                    />
                </div>
            );
        }
        if (this.state.showSignUp) {
            return (
                <div>
                    <SignUp
                        header='Sign up'
                        label='Please, check your inbox. We`ve sent an e-mail to:'
                        value={this.state.newUser.email}
                        disabledValueSignUp={this.state.disabledValueSignUp}
                        disabled={this.state.showSignUp ? styleShow : styleHide}
                        onSubmit={this.handleGotItSignUp}
                        onResendConfirmationEmail={
                            this.handleResendConfirmationEmail
                        }
                        linkMessage={this.state.linkMessage}
                    />
                </div>
            );
        } else {
            return (
                <div>
                    <p>Nothing to render!</p>
                </div>
            );
        }
    }
}

const styleHide = {
    display: 'none'
};
const styleShow = {
    display: 'block'
};

export default LoginForm;
