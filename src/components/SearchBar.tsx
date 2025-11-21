import { useAtom } from 'jotai';
import { searchQueryAtom, selectedPointAtom, mobileSearchExpandedAtom } from '../state';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import FilterControls from './FilterControls';
import '../styles/SearchBar.css';

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
    const [selectedPoint, setSelectedPoint] = useAtom(selectedPointAtom);
    const [mobileExpanded, setMobileExpanded] = useAtom(mobileSearchExpandedAtom);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isCompact = !!selectedPoint;
    const placeholderText = isMobile && !mobileExpanded ? "Search & Filter" : "Search locations...";

    const handleInteraction = () => {
        if (isMobile) {
            setMobileExpanded(true);
            if (selectedPoint) {
                setSelectedPoint(null);
            }
        }
    };

    return (
        <div className={`search-bar-container ${isCompact ? 'compact' : ''} ${mobileExpanded ? 'mobile-expanded' : ''}`}>
            <div className="search-input-wrapper" onClick={handleInteraction}>
                <Search className="search-icon" size={20} />
                <input
                    type="text"
                    placeholder={placeholderText}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleInteraction}
                    className="search-input"
                />
            </div>

            <div className={`filters-wrapper ${isMobile && !mobileExpanded ? 'hidden' : ''}`}>
                <FilterControls />
            </div>
        </div>
    );
}
