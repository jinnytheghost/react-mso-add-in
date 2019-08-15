import {timeZoneMap, getMyTimezone} from '../utils/DatetimeUtil';

function _getError(errorMsg: string): string {
    return `OutlookService: ${errorMsg}`;
}

export function getMailboxItem(): Office.Item {
    return Office.context.mailbox.item;
}

export function getUserEmail() {
    return Office.context.mailbox.userProfile.emailAddress;
}

export function getUserTimezone() {
    console.log('Office.context.mailbox.userProfile.timeZone', Office.context.mailbox.userProfile.timeZone);
    return timeZoneMap[Office.context.mailbox.userProfile.timeZone] || getMyTimezone();
}

export function setAppointmentBody(body) {
    return new Promise((resolve, reject) => {
        const appointment = getMailboxItem() as Office.AppointmentCompose;

        if (appointment.itemType !== Office.MailboxEnums.ItemType.Appointment) {
            reject(_getError(`incorrect item type: ${appointment.itemType}`));
        }

        appointment.body.setAsync(body, { coercionType: Office.CoercionType.Html }, (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                reject();
            } else {
                resolve();
            }
        });
    });
}

export function getAppointmentStartTime(): Promise<any> {
    return new Promise((resolve, reject) => {
        const appointment = getMailboxItem() as Office.AppointmentCompose;

        if (appointment.itemType !== Office.MailboxEnums.ItemType.Appointment) {
            reject(_getError(`incorrect item type: ${appointment.itemType}`));
        }

        appointment.start.getAsync((asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                reject(_getError(asyncResult.error.message));
            } else {
                resolve(asyncResult.value);
            }
        });
    });
}

export function setAppointmentStartTime(dateTime: Date): Promise<any> {
    return new Promise((resolve, reject) => {
        const appointment = getMailboxItem() as Office.AppointmentCompose;

        if (appointment.itemType !== Office.MailboxEnums.ItemType.Appointment) {
            reject(_getError(`incorrect item type: ${appointment.itemType}`));
        }

        appointment.start.setAsync(dateTime, (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                reject(_getError(asyncResult.error.message));
            } else {
                resolve();
            }
        });
    });
}

export function setAppointmentEndTime(dateTime: Date): Promise<any> {
    return new Promise((resolve, reject) => {
        const appointment = getMailboxItem() as Office.AppointmentCompose;

        if (appointment.itemType !== Office.MailboxEnums.ItemType.Appointment) {
            reject(_getError(`incorrect item type: ${appointment.itemType}`));
        }

        appointment.end.setAsync(dateTime, (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                reject(_getError(asyncResult.error.message));
            } else {
                resolve();
            }
        });
    });
}

export function setAppointmentLocation(location: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const appointment = getMailboxItem() as Office.AppointmentCompose;

        if (appointment.itemType !== Office.MailboxEnums.ItemType.Appointment) {
            reject(_getError(`incorrect item type: ${appointment.itemType}`));
        }

        appointment.location.setAsync(location, (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                reject(_getError(asyncResult.error.message));
            } else {
                resolve();
            }
        });
    });
}

export function getRequiredAttendees(): Promise<any> {
    return new Promise((resolve, reject) => {
        const appointment = getMailboxItem() as Office.AppointmentCompose;

        if (appointment.itemType !== Office.MailboxEnums.ItemType.Appointment) {
            reject(_getError(`incorrect item type: ${appointment.itemType}`));
        }

        appointment.requiredAttendees.getAsync((asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                reject(_getError(asyncResult.error.message));
            } else {
                resolve(asyncResult.value);
            }
        });
    });
}

export function getOptionalAttendees(): Promise<any> {
    return new Promise((resolve, reject) => {
        const appointment = getMailboxItem() as Office.AppointmentCompose;

        if (appointment.itemType !== Office.MailboxEnums.ItemType.Appointment) {
            reject(_getError(`incorrect item type: ${appointment.itemType}`));
        }

        appointment.optionalAttendees.getAsync((asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Failed) {
                reject(_getError(asyncResult.error.message));
            } else {
                resolve(asyncResult.value);
            }
        });
    });
}

export function getAllAttendees(): Promise<any> {
    return Promise.all([
        getRequiredAttendees(),
        getOptionalAttendees()
    ]).then(([required, optional]) => [].concat(required).concat(optional));
}

const _listeners = [];
let checkAttendeesRunning = false;
let prevAttendees = [];

function _checkAttendees(callback) {
    if (checkAttendeesRunning) {
        return;
    }

    checkAttendeesRunning = true;
    getAllAttendees().then((nextAttendees) => {
        const userEmail = getUserEmail();
        nextAttendees = nextAttendees.filter((attendees) => attendees.emailAddress !== userEmail);

        const prevEmails = prevAttendees.map(attendees => attendees.emailAddress).sort();
        const nextEmails = nextAttendees.map(attendees => attendees.emailAddress).sort();
        const equal = prevEmails.length === nextEmails.length
            && prevEmails.every((value, index) => value === nextEmails[index]);

        if (!equal) {
            console.log('getAllAttendees CHANGED');
            callback(nextAttendees);
        }

        prevAttendees = nextAttendees;
        checkAttendeesRunning = false;
    }, () => {
        checkAttendeesRunning = false;
    });
}

export const ATTENDEES_CHANGE = 'attendeesChange';

function _listening() {
    setTimeout(() => {
        _listeners.forEach(({event, callback}) => {
            switch (event) {
                case ATTENDEES_CHANGE:
                    _checkAttendees(callback);
                    break;
                default:
                    throw Error('Unknown event');
            }
        });

        if (_listeners.length > 0) {
            _listening();
        }
    }, 2000);
}

export function addEventListener(event, callback) {
    _listeners.push({
        event,
        callback
    });

    _listening();
}

export function removeAllListeners() {
    _listeners.splice(0, _listeners.length);
    prevAttendees = [];
}
