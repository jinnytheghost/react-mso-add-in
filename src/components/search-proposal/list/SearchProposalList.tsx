import * as React from 'react';
import SearchProposalListItem from './SearchProposalListItem';
import './SearchProposalList.less';

export interface ISearchProposalListProps {
    timeSlots: Array<any>;
    duration: string;
    onTimeSlotSelect: Function;
}

const SearchProposalList: React.FunctionComponent<ISearchProposalListProps> = ({ timeSlots, duration, onTimeSlotSelect }) => (
    <div className='search-proposal-list'>
        {timeSlots && timeSlots.map((timeSlot) => (
            <SearchProposalListItem
                timeSlot={timeSlot}
                duration={duration}
                onItemSelect={onTimeSlotSelect}
            />
        ))}
    </div>
);

export default SearchProposalList;
