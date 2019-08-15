import { Calendar, CalendarsGroup } from './CalendarService';
import JsonUtil from '../utils/JsonUtil';
import axios from 'axios';
import { getCurrentUser, User, makeAuthenticatedRequestPut } from './AppAuthService';
import { RequestTypes } from './AppAuthService';
import { getMyTimezone } from '../utils/DatetimeUtil';
import { AppApiBaseURL } from '../config/apiEndpoints';


const settingsKeyPrefixInLocalStorage = 'AppShadow.SettingsService.settings.';

/**
 * Selected and saved calendars and meeting id
 */
export interface Settings {
    user: User,
    meetingId: string;
    calendarsGroups: CalendarsGroup[]
}

class SettingsService {


    private settings: Settings;

    /**
     * @return Promise with local copy of settings or Promise with null value if user didn't save settings yet
     * rejects if settings present but can't be parsed, or if unable to fetch current logged in user
     */
    public async getSettings(): Promise<Settings> {
        const virtualMeetingLink = await this.getVirtualMeetingLink();

        if (this.settings) {
            const settings = JsonUtil.cloneJson(this.settings);
            settings.meetingId = virtualMeetingLink;
            return settings;
        }
        const value = localStorage.getItem(await this.getSettingsKey());
        if (value) {
            const settings: Settings = JSON.parse(value);
            settings.meetingId = virtualMeetingLink;
            if (!this.isSettingsValid(settings)) {
                console.log('Removing invalid settings', settings);
                this.deleteSettings();
                return null;
            }
            console.log('Parsed settings from local storage', settings);
            this.settings = settings;
            return this.settings;
        }
        return null;
    }

    public getVirtualMeetingLink = async () => {
        const url = `${AppApiBaseURL}/users/me/settings`;
        const data = await axios.get(url);
        return data.data.virtualMeetingLink;
    }

    public async getAllSavedCallendars(): Promise<Calendar[]> {
        const calendars = new Array<Calendar>();
        const settings = await this.getSettings();

        if (!settings) {
            return calendars;
        }

        settings.calendarsGroups.forEach(calendarsGroup => {
            if (calendarsGroup.calendars) {
                calendars.push.apply(calendars, calendarsGroup.calendars);
            }
        });
        return calendars;
    }

    public deleteSettings(): void {
        if (this.settings && this.settings.user) {
            localStorage.removeItem(this.getSettingsKeyByUser(this.settings.user));
        }
        console.log('Settings have been deleted');
        this.settings = null;
    }

    public async saveSettings(settings: Settings): Promise<void> {
        if (!settings) {
            this.deleteSettings();
        } else {
            settings.user = await getCurrentUser();
            if (!this.isSettingsValid(settings)) {
                throw new Error(`The following settings are invalid: ${JSON.stringify(settings)}`);
            }
            localStorage.setItem(await this.getSettingsKey(), JSON.stringify(settings));
            const userTimeZone = getMyTimezone();
            const meetingID = {
                'language': '',
                'timeZone': userTimeZone,
                'virtualMeetingLink': settings.meetingId
            };
            const path = 'users/me/settings';
            makeAuthenticatedRequestPut(path, RequestTypes.PUT, meetingID);
            this.settings = JsonUtil.cloneJson(settings);
        }
    }

    private isSettingsValid(settings: Settings): boolean {
        return settings.meetingId != null || settings.calendarsGroups != null && settings.user != null && settings.user.email != null;
    }

    private async getSettingsKey(): Promise<string> {
        const currentUser = await getCurrentUser();
        return this.getSettingsKeyByUser(currentUser);
    }

    private getSettingsKeyByUser(user: User): string {
        return settingsKeyPrefixInLocalStorage + user.email;
    }
}

export default new SettingsService();
