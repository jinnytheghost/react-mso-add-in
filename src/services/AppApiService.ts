import { makeAuthenticatedRequest, makeAuthenticatedRequestPut, RequestTypes } from './AppAuthService';
import * as queryString from 'querystring';
import { getEmailHash } from '../utils/StringUtil';

function _getError(errorMsg: string): string {
    return `AppApiService: ${errorMsg}`;
}

function retrieveTimeSlots(params: any): Promise<any> {
    return makeAuthenticatedRequest(`App/time-slots?${queryString.stringify(params)}`, RequestTypes.GET, null).then((response) => {
        return response.data.timeSlots;
    }, (error) => {
        console.log(_getError(error));
    });
}

function retrieveUsersInformation(emails: Array<string>): Promise<any> {
    const payload = {
        include: {
            emailHashes: emails.map(getEmailHash)
        }
    };
    return makeAuthenticatedRequestPut(`users/search`, RequestTypes.POST, payload).then((response) => {
        return response.data.users;
    }, (error) => {
        console.log(_getError(error));
    });
}

export {
    retrieveTimeSlots,
    retrieveUsersInformation
};
