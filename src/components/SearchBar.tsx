import { useAtom } from 'jotai';
import { searchQueryAtom, selectedPointAtom, mobileSearchExpandedAtom } from '../state';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X } from 'lucide-react';
import FilterControls from './FilterControls';
import '../styles/SearchBar.css';
import MiniSearch from 'minisearch';
import jsonData from '../assets/data.json';
import Autocomplete, { type SearchResult } from './Autocomplete';
import type { CrashData } from '../geo/makeGeoJSON';

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
    const [selectedPoint, setSelectedPoint] = useAtom(selectedPointAtom);
    const [mobileExpanded, setMobileExpanded] = useAtom(mobileSearchExpandedAtom);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize MiniSearch
    const miniSearch = useMemo(() => {
        const ms = new MiniSearch({
            fields: ['Intersection or street block', 'Municipality', 'VZ Tweet Description ( * = Corrected/Edited)'],
            storeFields: [
                'ID',
                'Date (DD/MM/YY)',
                'Intersection or street block',
                'Municipality',
                'VZ Tweet Description ( * = Corrected/Edited)',
                'Photo link',
                'latitude',
                'longitude',
                'hasDeaths',
                'hasInjuries',
                'validationErrors'
            ],
            searchOptions: {
                boost: {
                    'Intersection or street block': 3,
                    'Municipality': 2,
                    'VZ Tweet Description ( * = Corrected/Edited)': 1
                },
                prefix: true,
                fuzzy: 0.2
            }
        });

        // Use index as ID to ensure uniqueness, as data.json has duplicate IDs
        const dataWithIds = (jsonData as any[]).map((item, index) => ({
            id: index,
            ...item
        }));

        ms.addAll(dataWithIds);
        return ms;
    }, []);

    // Perform search
    useEffect(() => {
        if (searchQuery.length >= 3) {
            const results = miniSearch.search(searchQuery);
            const formattedResults: SearchResult[] = results.map(r => ({
                id: r.id,
                date: r['Date (DD/MM/YY)'],
                location: `${r['Intersection or street block']}, ${r['Municipality']}`,
                municipality: r['Municipality'],
                description: r['VZ Tweet Description ( * = Corrected/Edited)'],
                thumbnail: r['Photo link'],
                score: r.score,
                originalData: {
                    ...r,
                    // Ensure numbers for coordinates
                    longitude: Number(r.longitude),
                    latitude: Number(r.latitude)
                }
            }));
            setSearchResults(formattedResults);
            setShowAutocomplete(true);
        } else {
            setSearchResults([]);
            setShowAutocomplete(false);
        }
    }, [searchQuery, miniSearch]);

    // Handle click outside to close autocomplete
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowAutocomplete(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [containerRef]);

    // Actually, let's keep the original logic if we want, but for now let's simplify.
    // The original was: const isCompact = !!selectedPoint;
    // But if we are searching, we probably want it expanded.

    const isCompact = !!selectedPoint;
    const placeholderText = isMobile && !mobileExpanded ? "Search & Filter" : "Search locations...";

    const handleInteraction = () => {
        if (isMobile) {
            setMobileExpanded(true);
            // Don't clear selected point immediately on interaction, only on new search or clear?
            // Original logic: if (selectedPoint) setSelectedPoint(null);
            // Let's keep it to avoid confusion
            setSelectedPoint(null);
        }
    };

    const handleSelectResult = (result: SearchResult) => {
        const crashData = result.originalData as CrashData;
        setSelectedPoint(crashData);
        setSearchQuery(result.location); // Or keep the query? Or set to name?
        // Usually better to show the selected item name or clear. 
        // Let's set it to the location name for feedback.
        setShowAutocomplete(false);
        setMobileExpanded(false); // Collapse on mobile after selection
    };

    const clearSearch = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchQuery('');
        setSearchResults([]);
        setShowAutocomplete(false);
        setSelectedPoint(null);
    };

    return (
        <div
            className={`search-bar-container ${isCompact ? 'compact' : ''} ${mobileExpanded ? 'mobile-expanded' : ''}`}
            ref={containerRef}
        >
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
                {searchQuery && (
                    <button className="clear-search-btn" onClick={clearSearch}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {showAutocomplete && (
                <Autocomplete
                    results={searchResults}
                    onSelect={handleSelectResult}
                />
            )}

            <div className={`filters-wrapper ${isMobile && !mobileExpanded ? 'hidden' : ''}`}>
                <FilterControls />
            </div>
        </div>
    );
}
