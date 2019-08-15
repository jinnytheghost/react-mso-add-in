import * as React from 'react';
import Spinner from '../spinner/Spinner';
import SearchProposalFilter from './filter/SearchProposalFilter';
import SearchProposalList from './list/SearchProposalList';
import SettingsService from '../../services/SettingsService';
import { retrieveTimeSlots, retrieveUsersInformation } from '../../services/appApiService';
import {
    getUserTimezone,
    setAppointmentStartTime,
    setAppointmentEndTime,
    setAppointmentLocation,
    setAppointmentBody,
    addEventListener,
    removeAllListeners,
    ATTENDEES_CHANGE
} from '../../services/OutlookService';
import * as DatetimeUtil from '../../utils/DatetimeUtil';
import * as TimeSlotsUtil from '../../utils/TimeSlotsUtil';
import './SearchProposal.less';

const HOUR_RANGE_START_DEFAULT = 8;
const HOUR_RANGE_END_DEFAULT = 18;

const WEEKDAYS_DEFAULT = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export interface ISearchProposalState {
    timeSlots: any;
    filterParams: any;
    meetingId: any;
    isLoading: boolean;
}

class SearchProposal extends React.Component<any, ISearchProposalState> {
    constructor(props) {
        super(props);

        this.state = {
            meetingId: null,
            timeSlots: {},
            isLoading: false,
            filterParams: {
                priority: TimeSlotsUtil.Priorities.MEDIUM,
                timeOfDay: [HOUR_RANGE_START_DEFAULT, HOUR_RANGE_END_DEFAULT],
                timeFrame: 30,
                daysOfWeek: WEEKDAYS_DEFAULT,
                duration: 'PT0H30M',
                withinWorkingHours: true,
                allowVirtualAttendance: false,
                useRandomizer: false,
                ignoreParticipantsAvailability: false,
                attendees: []
            }
        };
    }

    static readonly appLink = 'https://www.app.com';

    static getMeetingBody(meetingId: string, allowVirtualAttendance: boolean) {
        const body = [
            '',
            '--------------------------------------------------',
            `Date proposal created with <a href="${SearchProposal.appLink}" target="_blank">${SearchProposal.appLink}</a>`
        ];

        if (allowVirtualAttendance) {
            body.unshift('Join Online Meeting:', `<a href="${meetingId}" target="_blank">${meetingId}</a>`);
        }

        return body.join('<br />');
    }

    componentDidMount() {
        this.searchDateProposals(this.state.filterParams);

        SettingsService.getSettings().then((settings) => {
            if (settings && settings.meetingId) {
                this.setState({
                    meetingId: settings.meetingId,
                    filterParams: {
                        ...this.state.filterParams,
                        allowVirtualAttendance: true
                    }
                });
            }
        });

        addEventListener(ATTENDEES_CHANGE, (attendees) => {
            const emails = attendees.map(attendee => attendee.emailAddress);

            retrieveUsersInformation(emails).then((usersInfo) => {
                const relationDictionary = usersInfo.reduce(function (dict, { user }) {
                    dict[user.email] = user.relation;
                    return dict;
                }, {});

                this.updateFilterWithAttendees(emails, relationDictionary);
            }, () => {
                this.updateFilterWithAttendees(emails);
            });
        });
    }

    updateFilterWithAttendees(emails, relationDictionary = {}) {
        this.handleFilterChange({
            ...this.state.filterParams,
            attendees: emails.map((email) => ({
                email,
                relation: relationDictionary[email] || 'none'
            }))
        });
    }

    componentWillUnmount() {
        removeAllListeners();
    }

    searchDateProposals(filterParams) {
        const query = {
            timeOfDay: TimeSlotsUtil.formatTimeOfDayQuery(filterParams.timeOfDay),
            duration: filterParams.duration,
            daysOfWeek: filterParams.daysOfWeek.map(d => d.toLowerCase() + 's'),
            timeFrame: filterParams.timeFrame,
            withinWorkingHours: filterParams.withinWorkingHours,
            allowVirtualAttendance: filterParams.allowVirtualAttendance,
            useRandomizer: !filterParams.disableRandomizer,
            bossMode: filterParams.ignoreParticipantsAvailability,
            participants: filterParams.attendees.map(attendees => attendees.email),
            organiserTimeZone: getUserTimezone()
        };

        this.setState({ isLoading: true });

        retrieveTimeSlots(query).then(
            (timeSlots = {}) => this.setState({ timeSlots, isLoading: false }),
            () => this.setState({ isLoading: false })
        );
    }

    handleTimeSlotSelect = ({ startLocalDate }) => {
        const { filterParams, timeSlots, meetingId } = this.state;
        const startDateTime = DatetimeUtil.parseString(startLocalDate);
        const endDateTime = DatetimeUtil.addDurationToDateTime(startDateTime, timeSlots.duration);

        Promise.all([
            setAppointmentStartTime(startDateTime),
            setAppointmentEndTime(endDateTime),
            setAppointmentLocation(filterParams.allowVirtualAttendance ? 'Online Meeting' : ''),
            setAppointmentBody(SearchProposal.getMeetingBody(meetingId, filterParams.allowVirtualAttendance))
        ]).then(() => {
            console.log('success');
        }, (error) => {
            console.log(error);
        });
    }

    handleFilterChange = (filterParams) => {
        this.setState({ filterParams });
        this.searchDateProposals(filterParams);

        console.log(filterParams);
    }

    render() {
        const { filterParams, timeSlots, meetingId, isLoading } = this.state;
        const timeSlotsByPriority = TimeSlotsUtil.selectTimeSlotsByPriority(timeSlots, filterParams.priority);
        const duration = DatetimeUtil.parseISO8601Duration(timeSlots.duration);

        return (
            <div className='search-proposal'>
                <h2 style={{ fontSize: '28px' }}>Proposed dates</h2>
                <br />

                <SearchProposalFilter
                    meetingId={meetingId}
                    onFilterParamsChange={this.handleFilterChange}
                    filterParams={filterParams}
                />
                <div className='delimiter' />
                <SearchProposalList
                    timeSlots={timeSlotsByPriority}
                    duration={duration}
                    onTimeSlotSelect={this.handleTimeSlotSelect}
                />
                {isLoading &&
                    <div className='search-proposal__loading'>
                        <Spinner className='search-proposal__spinner' />
                        <div className='search-proposal__fade' />
                    </div>}
            </div>
        );
    }
}

export default SearchProposal;
