import axios from 'axios';
import { AppApiBaseURL } from '../config/apiEndpoints';

const userCredentials = getUserAppToken();
let currentUser = null;

export interface User {
    email: string;
    name: string;
}

export function verifyIfUserExists(email: string): Promise<any> {
    if (email.length > 0) {
        // convert email to lowercase before sending the request
        let lowerCaseEmail = email.toLowerCase();
        const url = `${AppApiBaseURL}/registrations/${lowerCaseEmail}`;
        return axios.get(url);
    } else {
        return new Promise((resolve) => {
            resolve('Email is required');
        });
    }
}

export enum RequestTypes {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
}

export function makeAuthenticatedRequest(path: string, requestType: RequestTypes, user) {
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    const url = `${AppApiBaseURL}/${path}`;
    if (user !== null) {
        localStorage.setItem('userAppToken', user);
        axios.defaults.headers.common['Authorization'] = `Basic ${user}`;
    }
    return axios({
        method: requestType,
        url
    });
}

export function makeAuthenticatedRequestPut(path: string, requestType: RequestTypes, payload: any) {
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    const url = `${AppApiBaseURL}/${path}`;
    const user = localStorage.getItem('userAppToken');

    axios.defaults.headers.common['Authorization'] = `Basic ${user}`;
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    return axios({
        method: requestType,
        url,
        data: payload,
        headers: {
            'Content-Type': 'application/json',
        }
    });
}

/**
 * @return current authorized user. After first call the result should be cached
 */
export function getCurrentUser(): Promise<User> {
    if (currentUser) {
        return Promise.resolve(currentUser);
    }
    return getUser(userCredentials).then((userData) => {
        currentUser = userData.data;
        return currentUser;
    });
}

export function getUser(userData?: any): Promise<any> {
    return makeAuthenticatedRequest('users/me', RequestTypes.GET, userData);
}

export function getUserAppToken() {
    return localStorage.getItem('userAppToken');
}

export function runResetPasswordflow(email) {
    const url = `${AppApiBaseURL}/password-reset/${email}`;
    return axios.post(url);
}

export function registerNewEmail(email) {
    let toLoverCaseEmail = email.toLowerCase();
    const url = `${AppApiBaseURL}/registrations/${toLoverCaseEmail}`;
    const body = {
        languageIso: 'en'
    };
    return axios({
        method: 'post',
        url: url,
        data: body,
        headers: { 'Content-Type': 'application/json' },
    });
}

export function resendConfirmationEmail(email) {
    let toLoverCaseEmail = email.toLowerCase();
    const url = `${AppApiBaseURL}/registrations/${toLoverCaseEmail}/resend-confirmation-email`;
    return axios.post(url);
}



