import { useAtom } from 'jotai';
import { searchQueryAtom, selectedPointAtom } from '../state';
import { Search } from 'lucide-react';
import FilterControls from './FilterControls';
import '../styles/SearchBar.css';

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
    const [selectedPoint] = useAtom(selectedPointAtom);

    const isCompact = !!selectedPoint;

    return (
        <div className={`search-bar-container ${isCompact ? 'compact' : ''}`}>
            <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="filters-wrapper">
                <FilterControls />
            </div>
        </div>
    );
}
