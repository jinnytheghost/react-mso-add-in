import * as React from 'react';
import Slider from 'rc-slider';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import 'rc-slider/assets/index.css';
import {convertTo24TimeFormat, getWeekDays, parseISO8601Duration, timeFrameLabel} from '../../../utils/DatetimeUtil';
import { Priorities } from '../../../utils/TimeSlotsUtil';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import './SearchProposalFilter.less';

const priorities = [Priorities.LOW, Priorities.MEDIUM, Priorities.HIGH];

const priorityIcons = {
    [Priorities.LOW]: <span>&#10141;</span>,
    [Priorities.MEDIUM]: <span>&#8211;</span>,
    [Priorities.HIGH]: <span>!</span>
};

const durationOptions = [
    'PT0H10M',
    'PT0H20M',
    'PT0H30M',
    'PT0H45M',
    'PT1H00M',
    'PT1H30M',
    'PT2H00M',
    'PT2H30M',
    'PT3H00M',
    'PT3H30M',
    'PT4H00M'
];

const timeFramesInDays = [1, 7, 14, 21, 30, 60, 90, 120, 150, 180];

const HOUR_RANGE_STEP = 0.5;
const HOUR_RANGE_START = 5;
const HOUR_RANGE_END = 24;

const RANGE_HANDLE_LEFT = 1;
const RANGE_HANDLE_RIGHT = 2;

const createCustomHandle = (formatter) => ({value, offset, ...restProps}) => (
    <React.Fragment>
        <div className={classNames('slider-label', `slider-label--${restProps.tabIndex}`)} style={{left: `${offset}%`}}>
            <div className={classNames('slider-label__inner', `slider-label__inner--${restProps.tabIndex}`)}>{formatter(value)}</div>
        </div>
        <Slider.Handle value={value} offset={offset} {...restProps} />
    </React.Fragment>
);

export interface AppProps {
    meetingId: any;
    onFilterParamsChange: Function,
    filterParams: any
}

class SearchProposalFilter extends React.Component<AppProps, any> {
    private _handlePriorityChange = (priority) => {
        this._updateFilterParams({
            priority
        });
    }

    private _handleDurationChange = (event) => {
        this._updateFilterParams({
            duration: event.target.value
        });
    }

    private _handleDayToggle = (day) => {
        const daysOfWeek = [...this.props.filterParams.daysOfWeek];
        const index = daysOfWeek.indexOf(day);

        if (index === -1) {
            daysOfWeek.push(day);
        } else if (daysOfWeek.length > 1) {
            daysOfWeek.splice(index, 1);
        }

        this._updateFilterParams({
            daysOfWeek
        });
    }

    private _handleTimeFrameChange = (timeFrame) => {
        this._updateFilterParams({
            timeFrame: timeFramesInDays[timeFrame]
        });
    }

    private _handleTimeOfDayChange = (timeOfDay) => {
        this._updateFilterParams({
            timeOfDay
        });
    }

    private _handleIgnoreParticipantsAvailabilityChange = () => {
        this._updateFilterParams({
            ignoreParticipantsAvailability: !this.props.filterParams.ignoreParticipantsAvailability
        });
    }

    private _handleWithinWorkingHoursChange = () => {
        this._updateFilterParams({
            withinWorkingHours: !this.props.filterParams.withinWorkingHours
        });
    }

    private _handleDisableRandomizerChange = () => {
        this._updateFilterParams({
            disableRandomizer: !this.props.filterParams.disableRandomizer
        });
    }

    private _handleAllowVirtualAttendanceChange = () => {
        this._updateFilterParams({
            allowVirtualAttendance: !this.props.filterParams.allowVirtualAttendance
        });
    }

    private _timeOfDayFormatter = (value: number): string => {
        return convertTo24TimeFormat(value * 3600 * 1000);
    }

    private _timeFrameFormatter = (value: number): string => {
        return timeFrameLabel(timeFramesInDays[value]);
    }

    private _isDurationSelected = (option: string) => {
        return this.props.filterParams.duration === option;
    }

    private _isPrioritySelected = (priority: string) => {
        return this.props.filterParams.priority === priority;
    }

    private _isDaySelected = (day: string) => {
        return this.props.filterParams.daysOfWeek.indexOf(day) !== -1;
    }

    private _updateFilterParams(updates) {
        this.props.onFilterParamsChange({
            ...this.props.filterParams,
            ...updates
        });
    }

    private _getAvailableParticipantsCount() {
        const {attendees, ignoreParticipantsAvailability} = this.props.filterParams;

        return (ignoreParticipantsAvailability || (attendees.length === 1 && attendees[0].relation !== 'trusted-contact'))
            ? 0
            : attendees.filter(attendee => ['trusted-contact', 'contact'].indexOf(attendee.relation) !== -1).length;
    }

    private _getAllParticipantsCount() {
        return this.props.filterParams.attendees.length;
    }

    render() {
        return (
            <div className='filter-panel'>
                <div className='filter-panel__item'>
                    <div className='filter-panel__item-title'>Priority</div>
                    <div className='filter-panel__item-control'>
                        {this._renderPrioritySelector()}
                    </div>
                </div>
                <div className='filter-panel__item'>
                    <div className='filter-panel__item-title'>Duration</div>
                    <div className='filter-panel__item-control'>
                        {this._renderDurationSelector()}
                    </div>
                </div>
                <div className='filter-panel__item'>
                    <div className='filter-panel__item-title'>Time of day</div>
                    <div className='filter-panel__item-control'>
                        {this._renderTimeOfDaySlider()}
                    </div>
                </div>
                <div className='filter-panel__item'>
                    <div className='filter-panel__item-title'>Days of week</div>
                    <div className='filter-panel__item-control'>
                        {this._renderDaysSelector()}
                    </div>
                </div>
                <div className='filter-panel__item'>
                    <div className='filter-panel__item-title'>Time frame</div>
                    <div className='filter-panel__item-control'>
                        {this._renderTimeFrameSlider()}
                    </div>
                </div>
                <div className='filter-panel__item filter-panel__item--vertical'>
                    <div className='filter-panel__item-title'>
                        {this._renderAvailabilityLabel()}
                    </div>
                    <div className='filter-panel__item-control text-small'>
                        {this._renderIgnoreParticipantsAvailabilityCheckbox()}
                    </div>
                    <div className='filter-panel__item-control text-small'>
                        {this._renderWithinWorkingHoursCheckbox()}
                    </div>
                    <div className='filter-panel__item-control text-small'>
                        {this._renderDisableRandomizerCheckbox()}
                    </div>
                    <div className='filter-panel__item-control text-small'>
                        {this._renderAllowVirtualAttendanceCheckbox()}
                    </div>
                </div>
            </div>
        );
    }

    private _renderPrioritySelector = () => (
        <div className='priority-selector'>
            {priorities.map((priority) => (
                <div
                    className={classNames('priority-selector__option', {'priority-selector__option--selected': this._isPrioritySelected(priority)})}
                    key={priority}
                    onClick={() => this._handlePriorityChange(priority)}>
                    <div className={classNames('priority-selector__icon', `priority-selector__icon--${priority}`)}>{priorityIcons[priority]}</div>
                </div>
            ))}
        </div>
    )

    private _renderDurationSelector = () => (
        <select className='duration-selector' onChange={this._handleDurationChange}>
            {durationOptions.map((option) => (
                <option
                    className='duration-selector__option'
                    value={option}
                    selected={this._isDurationSelected(option)}>
                    {parseISO8601Duration(option)}
                </option>
            ))}
        </select>
    )

    private _renderDaysSelector = () => (
        <div className='days-selector'>
            {getWeekDays().map((day) => (
                <div
                    className={`days-selector__option ${this._isDaySelected(day) ? 'days-selector__option--selected' : ''}`}
                    onClick={() => this._handleDayToggle(day)}>{day[0]}</div>
            ))}
        </div>
    )

    private _renderTimeFrameSlider = () => (
        <Slider
            min={0}
            max={timeFramesInDays.length - 1}
            defaultValue={timeFramesInDays.indexOf(this.props.filterParams.timeFrame)}
            handle={createCustomHandle(this._timeFrameFormatter)}
            onAfterChange={this._handleTimeFrameChange}/>
    )

    private _renderTimeOfDaySlider = () => (
        <Slider.Range
            allowCross={false}
            min={HOUR_RANGE_START}
            max={HOUR_RANGE_END}
            step={HOUR_RANGE_STEP}
            tabIndex={[RANGE_HANDLE_LEFT, RANGE_HANDLE_RIGHT]}
            pushable={HOUR_RANGE_STEP}
            defaultValue={this.props.filterParams.timeOfDay}
            handle={createCustomHandle(this._timeOfDayFormatter)}
            onAfterChange={this._handleTimeOfDayChange}/>
    )

    private _renderIgnoreParticipantsAvailabilityCheckbox = () => this._renderCheckbox(
        this.props.filterParams.ignoreParticipantsAvailability,
        `Ignore invitees' availability`,
        this._handleIgnoreParticipantsAvailabilityChange
    )

    private _renderAvailabilityLabel = () => (
        `Considers your availability and ${this._getAvailableParticipantsCount()} out of ${this._getAllParticipantsCount()} participants`
    )

    private _renderWithinWorkingHoursCheckbox = () => this._renderCheckbox(
        this.props.filterParams.withinWorkingHours,
        'Within working hours',
        this._handleWithinWorkingHoursChange
    )

    private _renderDisableRandomizerCheckbox = () => this._renderCheckbox(
        this.props.filterParams.disableRandomizer,
        'Disable smart algorithm',
        this._handleDisableRandomizerChange
    )

    private _renderAllowVirtualAttendanceCheckbox = () => {
        if (!this.props.meetingId) {
            return <span><Link to='/settings'>Configure meeting ID</Link> to allow virtual attendance</span>;
        }

        return this._renderCheckbox(
            this.props.filterParams.allowVirtualAttendance,
            'Allow virtual attendance',
            this._handleAllowVirtualAttendanceChange
        );
    }

    private _renderCheckbox = (checked, label, handler) => (
        <Checkbox checked={checked}
              styles={{
                  checkbox: {
                      width: '16px',
                      height: '16px',
                      borderColor: '#0aa5d0'
                  },
                  text: {
                      fontFamily: 'Tahoma, Arial, sans-serif',
                      fontSize: '12px',
                      color: '#000000'
                  },
                  checkboxChecked: {
                      backgroundColor: '#0aa5d0'
                  }
              }}
              label={label}
              onChange={handler}
        />
    )
}

export default SearchProposalFilter;
