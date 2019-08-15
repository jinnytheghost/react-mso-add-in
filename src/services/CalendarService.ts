import { makeGraphRequest } from './MSApiService';


export interface CalendarGroup {
    id: string;
    name: string;
    classId: string;
    changeKey: string
}

export interface Owner {
    name: string
    address: string;
}

export interface Calendar {
    id: string;
    name: string;
    changeKey: string;
    color: string;
    backgroundColorHex: string
    canEdit: boolean;
    canShare: boolean;
    canViewPrivateItems: boolean;
    owner: Owner;
}

export interface CalendarsGroup {
    calendarGroup: CalendarGroup;
    calendars: Array<Calendar>;
}


/**
 * The service provides bindings for microsoft outlook calendars API
 */
export class CalendarService {

    public async getCalendarGroups(): Promise<CalendarGroup[]> {
        return makeGraphRequest('/me/calendargroups').then((data: any) => {
            console.log('Received calendar groups', data);
            return data.value as Array<CalendarGroup>;
        });
    }

    public async getCalendarsByGroupId(calendarGroupId: string): Promise<Calendar[]> {
        return makeGraphRequest(`/me/calendargroups/${calendarGroupId}/calendars`).then((data: any) => {
            console.log(`Received calendars by the group id: ${calendarGroupId}`, data);
            const calendars: Calendar[] = data.value;
            calendars.forEach(calendar => this.enrichCalendarData(calendar));
            return calendars;
        });
    }

    public async getGroupsWithCalendars(): Promise<CalendarsGroup[]> {
        const calendarGroups: CalendarGroup[] = await this.getCalendarGroups();
        const promises = new Array<Promise<CalendarsGroup>>();

        calendarGroups.forEach((calendarGroup) => {
            const promise: Promise<CalendarsGroup> = this.getCalendarsByGroupId(calendarGroup.id).then((calendars: Calendar[]) => {
                const group: CalendarsGroup = {
                    calendarGroup: calendarGroup,
                    calendars: calendars
                };
                return group;
            });
            promises.push(promise);
        });

        return Promise.all(promises);
    }

    private enrichCalendarData(calendar: Calendar): void {
        const colorMap = {
            'auto': '#22a6ce',
            'white': 'lightBrown',
            'lightBrown': '#dbbba4',
            'lightTeal': '#b5efe9',
            'lightBlue': '#caecfe',
            'lightRed': '#f9a7b3',
            'lightGrey': '#dfdfdf',
            'lightGreen': '#c3e9c7',
            'lightYellow': '#f8ea92',
            'lightOrange': '#fdc99d'
        };
        if (colorMap[calendar.color]) {
            calendar.backgroundColorHex = colorMap[calendar.color];
        } else {
            console.warn(`Unknown color name ${calendar.color}`, calendar);
            calendar.backgroundColorHex = calendar.color;
        }
    }
}

export default new CalendarService();
