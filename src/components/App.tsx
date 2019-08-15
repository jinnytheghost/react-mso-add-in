import * as React from 'react';
import { CSSProperties } from 'react';
import { Route, Redirect, withRouter } from 'react-router-dom';

import Spinner from './spinner/Spinner';
import SettingsForm from './settings/SettingsForm';
import SearchProposal from './search-proposal/SearchProposal';
import LoginForm from './signIn/LoginForm';
import Footer from './footer/Footer';
import Button from './Button';

import { getCurrentUser } from '../services/AppAuthService';
import { runSyncing, runBackgroundSyncing } from '../services/SyncService';
import { acquireToken, acquireTokenSilent, signOut } from '../services/MSTokenService';
import SettingsService from '../services/SettingsService';

export const settingsLocation = '/settings';
export const rootLocation = '/';

export interface History {
    push(location: string);
    goBack(): void;
}

export interface AppProps {
    location: any;
    history: History;
}

export interface AppState {
    style: object;
    userRetrievalState: UserDataRetrievalState;
    syncedCalendars: [object];
    syncedContacts: [string, [{ string }]];
    msTokenInvalid: boolean;
}

enum UserDataRetrievalState {
    InProgress,
    Success,
    Failure
}

class App extends React.Component<AppProps, AppState | any> {
    constructor(props, context) {
        super(props, context);
        this.state = {
            userData: null,
            userRetrievalState: UserDataRetrievalState.InProgress,
            syncedCalendars: [],
            syncedContacts: [],
            style: {},
            msTokenInvalid: false,
        };
    }

    callSync = (syncImmediate) => {
        acquireTokenSilent().then(
            () => {
                this.setState({
                    msTokenInvalid: false
                });
                SettingsService.getAllSavedCallendars().then((calendars) => {
                    if (calendars.length > 0) {
                        //sync
                        this._startSyncing(syncImmediate);
                    } else {
                        // redirect
                        const userRetrievalState = UserDataRetrievalState.Success;
                        this.setState({
                            userRetrievalState
                        });
                        this.props.history.push(settingsLocation);
                    }
                });
            },
            () =>
                this.setState({
                    msTokenInvalid: true
                })

        );
    }

    private _getUserData(syncImmediate = true) {
        getCurrentUser()
            .then(userData => {
                this.setState({
                    userData,
                });
                this.callSync(syncImmediate);
            })
            .catch(() => {
                const userRetrievalState = UserDataRetrievalState.Failure;
                this.setState({
                    userRetrievalState
                });
            });
    }

    private _startSyncing(syncImmediate = false) {
        console.log(syncImmediate);

        this.setState({
            syncing: true
        });


        runSyncing().then(
            () => {
                console.log('finish');
                this.setState({
                    syncing: false
                });
                const userRetrievalState = UserDataRetrievalState.Success;
                this.setState({
                    userRetrievalState
                });
                this.props.history.push(rootLocation);

                this._startBackgroundSyncing();
            },
            error => {
                console.log('error', error);

                this.setState({
                    syncing: false
                });
                this.props.history.push(rootLocation);
                this._startBackgroundSyncing();
            }
        );
    }

    _startBackgroundSyncing() {
        runBackgroundSyncing(() => {
            console.log('MS fail');

            acquireTokenSilent().then(
                () => this._startBackgroundSyncing(),
                () => {
                    this.setState({ msTokenInvalid: true });
                }
            );
        });
    }

    componentWillMount() {
        this._getUserData();
    }

    onAppSignIn() {
        this._getUserData(true);
    }

    handleTokenAcquire = () => {
        acquireToken().then(() => {
            this._getUserData(true);
            console.log('ACQUIRE TOKEN SUCCESS');
        });
    }

    handleTellMyTeamClick = e => {
        e.preventDefault();
        if (Office.context.mailbox.displayNewMessageForm !== undefined) {
            Office.context.mailbox.displayNewMessageForm({
                subject: 'App',
                htmlBody:
                    'I discovered App, a perfect way to arrange our meetings.<br/>Let`s give it a try!<br/>https://www.App.com'
            });
        } else {
            const method = '$$d_displayNewMessageFormApi';
            Office.context.mailbox[method]({
                subject: 'App',
                htmlBody:
                    'I discovered App, a perfect way to arrange our meetings.<br/>Let`s give it a try!<br/>https://www.App.com'
            });
        }
    }

    onSettingsSet = () => {
        this.callSync(true);
    }

    handleLogOut = () => {
        // log out the user
        //localStorage.clear();

        // msal method to logout firstly
        signOut();
        // then reset the token received from App after sign in
        //clear userAppToken from localStorage
        //localStorage.removeItem('userAppToken');
        localStorage.clear();
        const userRetrievalState = UserDataRetrievalState.InProgress;
        const msTokenInvalid = false;
        const userData = null;
        const syncedCalendars = [];
        const syncedContacts = [];
        const style = {};

        this.setState({
            userRetrievalState,
            msTokenInvalid,
            userData,
            style,
            syncedCalendars,
            syncedContacts
        });

        // and maybe smth in cookies
        // stop the syncing
        // redirect to sign in page

        /* const userRetrievalState = UserDataRetrievalState.Failure;
         const msTokenInvalid = false;
         const userData = null;
         const syncedCalendars = [];
         const syncedContacts = [];
         const style = {};
         this.setState({
             userRetrievalState,
             msTokenInvalid,
             userData,
             style,
             syncedCalendars,
             syncedContacts
         });
         */
        this.props.history.push('/signin');
        self.location.reload();
        console.log('log out the user');
    }

    render() {
        const { userRetrievalState, msTokenInvalid } = this.state;
        const isAuthenticated =
            userRetrievalState === UserDataRetrievalState.Success;


        if (msTokenInvalid) {
            return (
                <div style={containerContent}>
                    <div style={relativeForm}>
                        <h2 style={headerSignIn}>Sign in</h2>
                        <br />
                        <h4 style={labelSignIn}>
                            Please sign in with your Microsoft account.
                        </h4>
                        <br />
                        <br />
                        <Button
                            style={SignToMSButton}
                            onButtonClick={this.handleTokenAcquire}
                            buttonText='Sign in'
                            disabledValue={this.state.disabledValueSignUp}
                        >
                            Got it
                        </Button>
                    </div>
                    <Footer
                        history={this.props.history}
                        isAuthenticated={isAuthenticated}
                        onClick={e => {
                            this.handleTellMyTeamClick(e);
                        }}
                    />
                </div>
            );
        }

        if (this.state.syncing) {
            return (
                <div style={{ paddingTop: '15px', paddingLeft: '15px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 700 }}>Syncing</h2>
                    <br />
                    <div style={{ fontSize: '12px' }}>Please wait for App to sync data.</div>
                    <Spinner />
                </div>
            );
        }

        if (userRetrievalState === UserDataRetrievalState.InProgress) {
            return (
                <div style={{ paddingTop: '15px', paddingLeft: '15px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 700 }}>Loading...</h2>
                    <Spinner />
                </div>
            );
        }

        return (
            <div>
                <AuthenticatedOnlyRoute
                    exact
                    path={settingsLocation}
                    isAuthenticated={isAuthenticated}
                    component={<SettingsForm
                        onSettingsSet={this.onSettingsSet}
                        onLogOut={this.handleLogOut}
                        history={this.props.history} />}
                />
                <AuthenticatedOnlyRoute
                    exact
                    path='/'
                    isAuthenticated={isAuthenticated}
                    component={<SearchProposal />}
                />
                <NonAuthenticatedOnlyRoute
                    exact
                    path='/signin'
                    isAuthenticated={isAuthenticated}
                    component={
                        <div style={containerContent}>
                            <LoginForm
                                onSignIn={() => {
                                    this.onAppSignIn();
                                }}
                            />
                        </div>
                    }
                />
                <Footer
                    history={this.props.history}
                    isAuthenticated={isAuthenticated}
                    onClick={e => {
                        this.handleTellMyTeamClick(e);
                    }}
                />
            </div>
        );
    }
}

const AuthenticatedOnlyRoute = ({ isAuthenticated, component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            isAuthenticated ? (
                component
            ) : (
                    <Redirect
                        to={{
                            pathname: '/signin',
                            state: { from: props.location }
                        }}
                    />
                )
        }
    />
);

const NonAuthenticatedOnlyRoute = ({ isAuthenticated, component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            !isAuthenticated ? (
                component
            ) : (
                    <Redirect
                        to={{
                            pathname: '/settings',
                            state: { from: props.location }
                        }}
                    />
                )
        }
    />
);

const containerContent: CSSProperties = {
    paddingLeft: '15px',
    paddingTop: '15px'
};

const SignToMSButton = {
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

const relativeForm: CSSProperties = {
    position: 'relative',
    height: '230px'
};

export default withRouter(App);
