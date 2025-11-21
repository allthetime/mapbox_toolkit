import '../styles/Autocomplete.css';

export interface SearchResult {
    id: string | number;
    date: string;
    location: string;
    municipality: string;
    description: string;
    thumbnail?: string;
    score: number;
    originalData: any;
}

interface AutocompleteProps {
    results: SearchResult[];
    onSelect: (result: SearchResult) => void;
}

export default function Autocomplete({ results, onSelect }: AutocompleteProps) {
    if (!results || results.length === 0) return null;

    return (
        <div className="autocomplete-container">
            {results.map((result) => (
                <div
                    key={result.id}
                    className="autocomplete-item"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent bubbling to map or other elements
                        onSelect(result);
                    }}
                >
                    {result.thumbnail && (
                        <div className="item-thumbnail">
                            <img src={result.thumbnail} alt="Thumbnail" loading="lazy" />
                        </div>
                    )}
                    <div className="item-content">
                        <div className="item-header">
                            <span className="item-location" title={result.location}>
                                {result.location}
                            </span>
                            <span className="item-date">{result.date}</span>
                        </div>
                        <div className="item-description" title={result.description}>
                            {result.description}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
