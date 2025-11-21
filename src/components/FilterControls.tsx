import { useAtom } from 'jotai';
import { filterStateAtom } from '../state';
import jsonData from '../assets/data.json';
import { RotateCcw } from 'lucide-react';

// Extract unique municipalities from data
const municipalities = Array.from(new Set((jsonData as any[]).map(d => d.Municipality))).sort();

export default function FilterControls() {
    const [filters, setFilters] = useAtom(filterStateAtom);

    const resetFilters = () => {
        setFilters({
            municipality: 'All',
            severity: 'All',
            startDate: '',
            endDate: ''
        });
    };

    const isModified = filters.municipality !== 'All' ||
        filters.severity !== 'All' ||
        filters.startDate !== '' ||
        filters.endDate !== '';

    return (
        <div className="filter-controls">
            <select
                value={filters.municipality}
                onChange={(e) => setFilters(prev => ({ ...prev, municipality: e.target.value }))}
                className="filter-select"
            >
                <option value="All">All Municipalities</option>
                {municipalities.map(m => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>

            <div className="filter-toggles">
                {(['All', 'Deaths', 'Injuries'] as const).map((type) => (
                    <button
                        key={type}
                        className={`filter-btn ${filters.severity === type ? 'active' : ''}`}
                        onClick={() => setFilters(prev => ({ ...prev, severity: type }))}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="date-filters">
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="date-input"
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="date-input"
                    placeholder="End Date"
                />
            </div>

            {isModified && (
                <span className="reset-btn" onClick={resetFilters} title="Reset Filters">
                    <RotateCcw size={16} />
                </span>
            )}
        </div>
    );
}
