import * as React from 'react';
import { convertToDatetimeParts } from '../../../utils/DatetimeUtil';
import './SearchProposalListItem.less';

export interface ISearchProposalListProps {
    onItemSelect: Function;
    timeSlot: any;
    duration: string;
}

const SearchProposalListItem: React.FunctionComponent<ISearchProposalListProps> = ({ timeSlot, duration, onItemSelect }) => {
    const {date, day, month, year, time} = convertToDatetimeParts(timeSlot.startLocalDate);
    return (
        <div className='search-proposal-item' onClick={() => onItemSelect(timeSlot)}>
            <div className='search-proposal-item__part'>{date}</div>
            <div className='search-proposal-item__part'>
                <div>{day}</div>
                <div className='search-proposal-item--greyed'>{month} {year}</div>
            </div>
            <div className='search-proposal-item__part'>
                <div>{time}</div>
                <div className='search-proposal-item--greyed'>{duration}</div>
            </div>
        </div>
    );
};

export default SearchProposalListItem;
