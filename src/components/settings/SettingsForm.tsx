import * as React from 'react';
import { CSSProperties } from 'react';

import CalendarService, { Calendar, CalendarsGroup } from '../../services/CalendarService';
import SettingsService, { Settings } from '../../services/SettingsService';
import JsonUtil from '../../utils/JsonUtil';
import './SettingsForm.less';

import { History, rootLocation } from '../App';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import Caret from './Caret';
import Spinner from '../spinner/Spinner';

export interface SettingsState {
    dataLoading: boolean,
    showSaveSpinner: boolean,
    firstTimeSetup: boolean,
    collapsedGroupIds: any,
    selectedGroupIds: any;
    selectedCalendarIds: any;
    settings: Settings;
    calendarsGroups: CalendarsGroup[];
}

export interface SettingsProps {
    history: History;
    onSettingsSet: any;
    onLogOut: any;
}

export default class SettingsForm extends React.Component<SettingsProps, SettingsState> {

    state: SettingsState = {
        dataLoading: true,
        showSaveSpinner: false,
        firstTimeSetup: false,
        collapsedGroupIds: {},
        selectedGroupIds: {},
        selectedCalendarIds: {},
        settings: {
            user: null,
            meetingId: '',
            calendarsGroups: []
        },
        calendarsGroups: []
    };

    constructor(props) {
        super(props);
        this.onSaveSettings = this.onSaveSettings.bind(this);
        this.onResetSettings = this.onResetSettings.bind(this);
        this.onCalendarsGroupSelect = this.onCalendarsGroupSelect.bind(this);
        this.onCalendarSelect = this.onCalendarSelect.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onSkip = this.onSkip.bind(this);
    }

    async componentDidMount() {
        // this.setState(this.state);
        const promise = CalendarService.getGroupsWithCalendars().then((calendarsGroups: CalendarsGroup[]) => {
            calendarsGroups = calendarsGroups.filter(group => {
                // we should not display birthday calendars in the settings
                group.calendars = group.calendars.filter(calendar => {
                    return (calendar.name.toLowerCase().trim() !== 'birthdays') && (calendar.name.toLowerCase().trim() !== 'geburtstage');
                });
                return group.calendars.length > 0;
            });
            this.state.calendarsGroups = calendarsGroups;
            this.onResetSettings();
        });
        this.showDataLoadingSpinner(promise);
    }

    onCalendarsGroupSelect(calendarsGroup: CalendarsGroup, selected: boolean): void {
        this.state.selectedGroupIds[calendarsGroup.calendarGroup.id] = selected;
        calendarsGroup.calendars.forEach(calendar => {
            this.state.selectedCalendarIds[calendar.id] = selected;
        });
        this.setState({});
    }

    onCalendarSelect(calendar: Calendar, calendarsGroup: CalendarsGroup, newValue: boolean) {
        this.state.selectedCalendarIds[calendar.id] = newValue;
        if (newValue) {
            const allSelected = !calendarsGroup.calendars.filter((c) => !this.state.selectedCalendarIds[c.id])[0];
            this.state.selectedGroupIds[calendarsGroup.calendarGroup.id] = allSelected;
        } else {
            this.state.selectedGroupIds[calendarsGroup.calendarGroup.id] = false;
        }
        this.setState({});
    }

    onSaveSettings(event?): void {
        if (event) {
            event.preventDefault();
        }
        const selectedGroups = new Array<CalendarsGroup>();

        this.state.calendarsGroups.forEach(group => {
            const result: CalendarsGroup = {
                calendarGroup: group.calendarGroup,
                calendars: []
            };
            group.calendars.forEach(calendar => {
                if (this.state.selectedCalendarIds[calendar.id]) {
                    result.calendars.push(calendar);
                }
            });
            if (result.calendars) {
                selectedGroups.push(result);
            }
        });

        const newSettings: Settings = {
            user: null,
            calendarsGroups: selectedGroups,
            meetingId: this.state.settings.meetingId
        };

        const promise: Promise<any> = SettingsService.saveSettings(newSettings).then(() => {
            this.props.onSettingsSet();
        });
        this.showSaveSpinner(promise);
    }

    onCancel() {
        this.props.history.push(rootLocation);
    }

    onSkip() {
        this.onResetSettings().then(() => this.onSaveSettings());
    }

    async onResetSettings(): Promise<any> {
        let settings = await SettingsService.getSettings();
        const firstTimeSetup = !settings;
        settings = this.getNullSafeSettings(settings);
        const selectedGroupIds = {};
        const selectedCalendarIds = {};
        if (firstTimeSetup) { // if not saved yet then all calendars should be selected
            this.state.calendarsGroups.forEach(group => {
                selectedGroupIds[group.calendarGroup.id] = true;
                group.calendars.forEach(calendar => {
                    selectedCalendarIds[calendar.id] = true;
                });
            });
            const virtualMeetingLink = await SettingsService.getVirtualMeetingLink();
            settings.meetingId = virtualMeetingLink;
        } else { // select from saved settings
            settings.calendarsGroups.forEach(group => {
                // select group if all its calendars are selected
                const remoteGroup: CalendarsGroup = this.state.calendarsGroups.filter(v => v.calendarGroup.id === group.calendarGroup.id)[0];
                const groupSelected = remoteGroup && group.calendars.length === remoteGroup.calendars.length;
                selectedGroupIds[group.calendarGroup.id] = groupSelected;
                group.calendars.forEach(calendar => {
                    selectedCalendarIds[calendar.id] = true;
                });
            });
        }
        return new Promise(resolve => {
            this.setState({
                firstTimeSetup: firstTimeSetup,
                selectedGroupIds: selectedGroupIds,
                selectedCalendarIds: selectedCalendarIds,
                settings: settings
            }, () => resolve());
        });
    }

    showDataLoadingSpinner(promise: Promise<any>): void {
        if (promise) {
            this.setState({ dataLoading: true });
            promise.then(() => this.setState({ dataLoading: false }))
                .catch(() => this.setState({ dataLoading: false }));
        }
    }

    showSaveSpinner(promise: Promise<any>): void {
        if (promise) {
            this.setState({ showSaveSpinner: true });
            promise.then(() => this.setState({ showSaveSpinner: false }))
                .catch(() => this.setState({ showSaveSpinner: false }));
        }
    }

    render() {
        const { dataLoading, showSaveSpinner, firstTimeSetup, collapsedGroupIds, selectedGroupIds,
            selectedCalendarIds, settings, calendarsGroups } = this.state;
        return (
            <form className='settings-form' onSubmit={this.onSaveSettings}>
                <h2 style={this.headerSettings}>Settings</h2>
                <br />
                <p className='settings-form__light-text' style={{ marginTop: '0.2em', fontSize: '12px' }}>Please adjust your preferences</p>
                {dataLoading && (<Spinner />)}
                <br />
                <div style={{ display: dataLoading ? 'none' : 'block' }}>
                    <p style={{ marginTop: '1em', width: '230px', fontSize: '12px', color: '#262626', fontWeight: 550, paddingBottom: '5px' }}>Calendars to consider in order to identify your availability:</p>

                    {calendarsGroups.map((group) => (
                        <div style={{ marginTop: '0.2em' }} className='' key={group.calendarGroup.id}>
                            <div>
                                <Caret open={!collapsedGroupIds[group.calendarGroup.id]} onClick={() => {
                                    collapsedGroupIds[group.calendarGroup.id] = !collapsedGroupIds[group.calendarGroup.id];
                                    this.setState({});
                                }} />
                                <Checkbox checked={!!selectedGroupIds[group.calendarGroup.id]}
                                    styles={{
                                        root: {
                                            display: 'inline-block'
                                        },
                                        checkboxChecked: {
                                            backgroundColor: '#22a6ce'
                                        }
                                    }}
                                    label={group.calendarGroup.name}
                                    onChange={(_, newValue) => this.onCalendarsGroupSelect(group, newValue)}
                                />
                            </div>
                            <div style={{ display: collapsedGroupIds[group.calendarGroup.id] ? 'none' : 'block' }}>
                                {group.calendars.map((calendar) => (
                                    <div style={{ marginLeft: '2em' }} key={calendar.id}>
                                        <Checkbox checked={!!selectedCalendarIds[calendar.id]}
                                            label={calendar.name}
                                            styles={{
                                                checkboxChecked: {
                                                    backgroundColor: calendar.backgroundColorHex
                                                },
                                                checkmarkChecked: {
                                                    color: 'black'
                                                }
                                            }}
                                            onChange={(_, newValue) => this.onCalendarSelect(calendar, group, newValue)}
                                        />
                                        <span style={{ backgroundColor: calendar.backgroundColorHex }}>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <br />
                    <div className='settings-form__meeting-tool-text' style={{ fontSize: '12px', color: '#262626' }}>
                        <p style={{ fontWeight: 550 }}>The meeting ID from your preferred tool, to add to a virtual meeting invite:</p>
                        <p className='settings-form__light-text'
                            style={{
                                marginTop: '0.5em',
                                fontSize: '10px'
                            }}>E. G.: Skype name, Zoom meeting ID<br />GoToMeeting IDm Slack workspace URL</p>
                    </div>

                    <div className='settings-form_text-field'>
                        <TextField placeholder='Add your meeting ID here'
                            value={settings.meetingId}
                            onChanged={(newValue) => {
                                settings.meetingId = newValue;
                                this.setState({});
                            }}
                        />
                        <div className='settings-form__buttons-container'>
                            {showSaveSpinner &&
                                <Spinner style={{ margin: 'auto' }} />
                            }
                            <PrimaryButton
                                text='Save'
                                type='submit'
                                styles={{ root: { backgroundColor: '#22a6ce' } }}
                            />
                            <DefaultButton
                                text={firstTimeSetup ? 'Skip' : 'Cancel'}
                                styles={{ root: { backgroundColor: 'transparent', color: '#22a6ce' } }}
                                onClick={firstTimeSetup ? this.onSkip : this.onCancel}
                            />
                            <br />
                            <br />
                            <br />
                            <br />
                            <DefaultButton
                                text='Sign out'
                                styles={{ root: { backgroundColor: 'transparent', color: '#22a6ce' } }}
                                onClick={this.props.onLogOut}
                            />
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    private getNullSafeSettings(settings: Settings): Settings {
        return settings ? JsonUtil.cloneJson(settings) : {
            user: null,
            meetingId: '',
            calendarsGroups: []
        };
    }

    private headerSettings: CSSProperties = {
        fontWeight: 'bold',
        fontSize: '28px',
    };
}
