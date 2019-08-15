import {convertTo24TimeFormat, toTimestamp} from './DatetimeUtil';

export enum Priorities {
    LOW = 'timeSlotsLow',
    MEDIUM = 'timeSlotsMedium',
    HIGH = 'timeSlotsHigh'
}

export enum SortOrder {
    ASC = -1,
    DESC = 1
}

export function selectTimeSlotsByPriority(timeSlots: any, priority = Priorities.MEDIUM): Array<any> {
    return sortTimeSlotsByDate(timeSlots[priority] || []);
}

export function sortTimeSlotsByDate(timeSlots: Array<any>, order = SortOrder.ASC): Array<any> {
    return timeSlots.sort((a: any, b: any) => {
        return toTimestamp(a.startLocalDate) < toTimestamp(b.startLocalDate) ? order : -1 * order;
    });
}

export function formatTimeOfDayQuery(timeOfDay) {
    return `${convertTo24TimeFormat(timeOfDay[0] * 3600 * 1000)}-${convertTo24TimeFormat(timeOfDay[1] * 3600 * 1000)}`;
}
