import authConfig from '../config/authConfig';
import { UserAgentApplication } from 'msal';
import * as JSCookie from 'js-cookie';

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const msal = new UserAgentApplication(authConfig.clientId, null, () => { }, {
    storeAuthStateInCookie: true,
    cacheLocation: 'localStorage',
    redirectUri: window.location.origin + '/auth.html',
    postLogoutRedirectUri: 'https://app.com/index.html'
});

(msal as any).isInIframe = () => false;

const STORAGE_KEY = 'MSToken';

function getAuthKeysFromCookie() {
    try {
        return JSCookie.get('MSAuthKeys').split('|,|');
    } catch (e) {
        console.log(e);
        return [];
    }
}

function clearAuthDataInCookie() {
    try {
        const authKeys = getAuthKeysFromCookie();
        authKeys.forEach(key => JSCookie.remove(key));
    } catch (e) {
        console.log(e);
    }
}

export const acquireToken = () => {
    localStorage.removeItem(STORAGE_KEY);

    return new Promise(resolve => {
        window.open(`${window.location.origin}/auth.html`);

        const checkOpenedWindow = () => {
            setTimeout(() => {
                const token = localStorage.getItem(STORAGE_KEY);
                if (token) {
                    resolve(token);
                    return;
                }

                if (isSafari && JSCookie.get('MSToken')) {
                    try {
                        const authKeys = getAuthKeysFromCookie();
                        authKeys.forEach(key => localStorage.setItem(key, JSCookie.get(key)));
                        resolve(JSCookie.get('MSToken'));
                    } catch (e) {
                        console.log(e);
                    }

                    clearAuthDataInCookie();
                }

                checkOpenedWindow();
            }, 1000);
        };

        checkOpenedWindow();
    });
};

export const acquireTokenSilent = () => {
    return new Promise((resolve, reject) => {
        msal.acquireTokenSilent(authConfig.graphScopes).then(
            accessToken => {
                console.log(accessToken);
                localStorage.setItem(STORAGE_KEY, accessToken);
                resolve(accessToken);
            },
            error => {
                console.log(error);
                reject(error);
            }
        );
    });
};

export const getToken = () => {
    return localStorage.getItem(STORAGE_KEY);
};

export const getUserId = () => {
    try {
        return (msal.getUser().idToken as any).oid;
    } catch (e) {
        console.log(e);
        return null;
    }
};

export const signOut = () => {
    msal.logout();
};
