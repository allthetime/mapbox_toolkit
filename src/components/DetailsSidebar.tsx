import { useAtom } from 'jotai';
import { selectedPointAtom } from '../state';
import { X, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import '../styles/DetailsSidebar.css';

export default function DetailsSidebar() {
    const [selectedPoint, setSelectedPoint] = useAtom(selectedPointAtom);

    if (!selectedPoint) return null;

    const closeSidebar = () => setSelectedPoint(null);

    const {
        "VZ Tweet Description ( * = Corrected/Edited)": description,
        "Photo link": photoLink,
        "Photo caption": photoCaption,
        "Example news source": newsLink,
        "Intersection or street block": location,
        "Municipality": municipality,
        "Date (DD/MM/YY)": date,
        "Deaths": deaths,
        "Injuries": injuries
    } = selectedPoint as any;

    const hasPhoto = photoLink && photoLink !== 'n/a';
    const cleanDescription = (description as string)?.replace(/^\*?\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+\s+\d+:\s*/i, '');

    return (
        <div className={`details-sidebar ${selectedPoint ? 'open' : ''}`}>
            <span className="close-btn" onClick={closeSidebar}>
                <X size={24} color="red" />
            </span>

            <div className="sidebar-content">
                <div className="header-section">
                    <div className="severity-badge">
                        {deaths > 0 && <span className="badge death">Fatal</span>}
                        {injuries > 0 && <span className="badge injury">Injury</span>}
                    </div>
                    <h2 className="description">{cleanDescription || "Crash Details"}</h2>
                </div>

                {hasPhoto && (
                    <div className="photo-section">
                        <img src={photoLink} alt={photoCaption || "Crash scene"} className="crash-photo" />
                        {photoCaption && photoCaption !== 'n/a' && <p className="caption">{photoCaption}</p>}
                    </div>
                )}

                <div className="info-grid">
                    <div className="info-item">
                        <MapPin size={18} className="icon" />
                        <div>
                            <label>Location</label>
                            <p>{location}, {municipality}</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <Calendar size={18} className="icon" />
                        <div>
                            <label>Date</label>
                            <p>{date}</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <AlertTriangle size={18} className="icon" />
                        <div>
                            <label>Casualties</label>
                            <p>{deaths > 0 ? `${deaths} Killed` : ''} {injuries > 0 ? `${injuries} Injured` : ''}</p>
                        </div>
                    </div>
                </div>

                {newsLink && newsLink !== 'n/a' && (
                    <a href={newsLink} target="_blank" rel="noopener noreferrer" className="news-link-btn">
                        Read News Report
                    </a>
                )}

                <div className="raw-data-section">
                    <h3>Raw Data</h3>
                    <pre>{JSON.stringify(selectedPoint, null, 2)}</pre>
                </div>

            </div>
        </div>
    );
}
