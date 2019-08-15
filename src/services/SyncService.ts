import { RequestTypes, makeAuthenticatedRequest, makeAuthenticatedRequestPut } from './AppAuthService';
import { outlookApiBaseURL } from '../config/apiEndpoints';
import { makeGraphRequest, makeRequest } from './MSApiService';
import { getUserId } from './MSTokenService';
import SettingsService from './SettingsService';
import { getEmailHash } from '../utils/StringUtil';


const SYNC_TIMESTAMP = 120000;

function _saveUserContacts(userData: any, sourceId): Promise<any> {
    const userId = sourceId;
    const path = `users/me/sources/${userId}/contacts`;
    return makeAuthenticatedRequestPut(path, RequestTypes.PUT, userData);
}

function _saveUserEvents(userData: any, sourceId: string): Promise<any> {
    const userId = sourceId;
    const path = `users/me/availability/sources/${userId}/events`;
    return makeAuthenticatedRequestPut(path, RequestTypes.PUT, userData);
}

function _normalizeContacts(syncedContacts) {
    const contactsArray = syncedContacts
        .filter((contact) => contact.emailAddresses.length)
        .map((contact) => [...contact.emailAddresses.map((eachAddress) => eachAddress.address)]);

    return [].concat(...contactsArray);
}

function _normalizeEvents(eventsArray) {
    const arrayOfEvents = eventsArray.map((event) => {
        const startTimestamp = Date.parse(event.start.dateTime);
        const endTimestamp = Date.parse(event.end.dateTime);
        const diffMs = (endTimestamp - startTimestamp);
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.round((diffMs % 3600000) / 60000);

        let durationISO = 'PT';
        if (diffHrs > 0) { durationISO += diffHrs + 'H'; }
        if (diffMins > 0) { durationISO += diffMins + 'M'; }
        return {
            startDate: `${event.start.dateTime}Z`,
            duration: durationISO,
            location: event.location.displayName
        };
    });
    return arrayOfEvents;
}

export function getContactRelation() {
    return makeAuthenticatedRequest('users/me/contacts', RequestTypes.GET, null);
}

function retrieveCalendarEvents(calendar) {

    let allEvents = [];
    return new Promise<Array<any>>((resolve, reject) => {
        let startDateTime: any = Date.now(); //ms timestamp
        const days: any = 180;
        let endDateTime: any = (startDateTime + 86400000 * days); // ms timestamp
        startDateTime = new Date(startDateTime).toISOString(); // iso date
        endDateTime = new Date(endDateTime).toISOString(); // iso date
        const id = calendar.id;

        const url = `/me/calendars/${id}/calendarView?startDateTime=${startDateTime}&endDateTime=${endDateTime}&$top=100`;
        retrieveCalendarEventsStep(`${outlookApiBaseURL}/${url}`, (events) => {
            const resultEventsArray = events.filter((event) => !event.isAllDay && !event.isCancelled);
            resultEventsArray.map((event) => {
                return {
                    start: event.start,
                    end: event.end,
                    location: event.location,
                    locations: event.locations,
                    id: event.id,
                    isAllDay: event.isAllDay,
                    isCancelled: event.isCancelled
                };
            });
            resolve(resultEventsArray);
        }, (error) => reject(error));
    });


    function retrieveCalendarEventsStep(url, retrieveCallback, failCallback) {
        makeRequest(url).then((data: any) => {
            allEvents = allEvents.concat(data.value);

            if (data['@odata.nextLink']) {
                retrieveCalendarEventsStep(data['@odata.nextLink'], retrieveCallback, failCallback);
            } else {
                retrieveCallback(allEvents);
            }
        }, (error) => {
            console.log('step', error);

            failCallback(error);
        });
    }
}


export function runCalendarSyncing() {
    return new Promise((resolve, reject) => {
        SettingsService.getAllSavedCallendars().then((calendars) => {
            //retriveCalendars().then((calendars) => {
            const eventsPromises = calendars.map((calendar) => retrieveCalendarEvents(calendar));
            Promise.all(eventsPromises)
                .then((result) => {
                    let allEvents = [];
                    for (let i = 0; i < result.length; i++) {
                        allEvents = allEvents.concat(result[i]);
                    }
                    const arrayOfEventsNormalized = _normalizeEvents(allEvents);
                    const readyToSendEvents = JSON.stringify({
                        events: arrayOfEventsNormalized
                    });

                    // only for testing
                    console.log('ready to send events: ', readyToSendEvents);

                    _saveUserEvents(readyToSendEvents, getUserId()).then((res) => {
                        console.log('Put request have been passed...', res);

                        resolve('success');
                    }, (error) => {
                        reject(error);
                    });
                }, (error) => {
                    reject(error);
                });
        }, (error) => {
            reject(error);
        });
    });
}

export function retriveContacts() {
    return new Promise<Array<any>>((resolve, reject) => {
        makeGraphRequest('/me/contacts').then((data: any) => {
            resolve(data.value);
        }, (error) => {
            reject(error);
        });
    });
}

export function runContactsSyncing() {
    return new Promise((resolve, reject) => {
        retriveContacts().then((syncedContacts) => {
            syncedContacts = syncedContacts.map((contact) => {
                return {
                    id: contact.id,
                    emailAddresses: contact.emailAddresses,
                    displayName: contact.displayName
                };
            });
            const hashPromises = _normalizeContacts(syncedContacts).map((email) => getEmailHash(email.toLowerCase()));
            Promise.all(hashPromises)
                .then((contactsHashes) => contactsHashes.map((contactHash) => ({ contactHash })))
                .then((res) => {
                    const readyToSendContacts = JSON.stringify({
                        contacts: res
                    });

                    // only for testing
                    console.log('ready to send contacts: ', readyToSendContacts);

                    return _saveUserContacts(readyToSendContacts, getUserId());
                }, (error) => {
                    reject(error);
                })
                .then(() => getContactRelation())
                .then(res => {
                    console.log('trusted contacts: ', res.data);
                    resolve(res.data);
                }, (error) => {
                    reject(error);
                });
        });
    });
}

export function runSyncing() {
    return Promise.all([
        runCalendarSyncing(),
        runContactsSyncing()
    ]).then(() => {
        localStorage.setItem('lastSyncingTime', `${Date.now()}`);
    });
}

export function runBackgroundSyncing(onError) {
    const runBackgroundSyncingStep = () => {
        setTimeout(() => {
            if (SYNC_TIMESTAMP < Date.now() - Number(localStorage.getItem('lastSyncingTime'))) {
                runSyncing().then(() => runBackgroundSyncingStep()).catch(onError);
            } else {
                runBackgroundSyncingStep();
            }

        }, 10000);

    };
    runBackgroundSyncingStep();
}
