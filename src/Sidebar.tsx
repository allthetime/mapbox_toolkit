import './styles/Sidebar.css';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Crash Data Map</h2>
      <p>This map visualizes crash data with clustering and color-coded points based on severity.</p>
      <ul>
        <li><strong>Red Points:</strong> Crashes with fatalities.</li>
        <li><strong>Yellow Points:</strong> Crashes with injuries but no fatalities.</li>
        <li><strong>Green Points:</strong> Crashes with no injuries or fatalities.</li>
      </ul>
      <p>Clusters are represented by blue circles, with size and color intensity indicating the number of crashes in that area.</p>
    </div>
  );
}