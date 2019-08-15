import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Spinner from './components/spinner/Spinner';
import authConfig from './config/authConfig';
import { UserAgentApplication } from 'msal';
import * as JSCookie from 'js-cookie';
import './styles.less';

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const saveStorageToCookie = () => {
    const props = {};
    const keys = Object.keys(localStorage);
    let i = keys.length;

    while (i--) {
        JSCookie.set(keys[i], localStorage.getItem(keys[i]), 30);
    }

    JSCookie.set('MSAuthKeys', keys.join('|,|'), 30);

    return props;
};

const processAuthentication = (saveToCookie = false) => {
    const msal = new UserAgentApplication(authConfig.clientId, null, () => { }, {
        storeAuthStateInCookie: true,
        cacheLocation: 'localStorage',
        redirectUri: window.location.origin + '/auth.html'
    });

    msal.acquireTokenSilent(authConfig.graphScopes).then(
        accessToken => {
            console.log(accessToken);
            const STORAGE_KEY = 'SecretToken';
            localStorage.setItem(STORAGE_KEY, accessToken);

            if (saveToCookie) {
                saveStorageToCookie();
            }
            window.close();
        },
        error => {
            console.log(error);
            if (
                error.indexOf('consent_required') !== -1 ||
                error.indexOf('interaction_required') !== -1 ||
                error.indexOf('login_required') !== -1
            ) {
                msal.acquireTokenRedirect(authConfig.graphScopes);
            }

            if (error.indexOf('user_login_error') !== -1) {
                msal.loginRedirect(authConfig.graphScopes);
            }
        }
    );
};

if (isSafari) {
    setTimeout(() => {
        window.opener = null;
        processAuthentication(true);
    }, 3000);
} else {
    processAuthentication();
}

ReactDOM.render(<Spinner />, document.getElementById('container'));

