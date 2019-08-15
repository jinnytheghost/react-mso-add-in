import { getToken } from './MSTokenService';
import { outlookApiBaseURL } from '../config/apiEndpoints';

// todo : improve
export const makeRequest = (resourceUrl) => {
    return new Promise((resolve, reject) => {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status < 300) {
                    resolve(JSON.parse(this.response));
                } else {
                    reject(this.responseText);
                }
            }
        };
        xmlHttp.open('GET', resourceUrl, true); // true for asynchronous
        xmlHttp.setRequestHeader('Authorization', 'Bearer ' + getToken());
        xmlHttp.setRequestHeader('X-Frame-Options', 'allow-from https://login.microsoftonline.com/');
        xmlHttp.send();
    });
};

export const makeGraphRequest = (path) => {
    return makeRequest(outlookApiBaseURL + path);
};
