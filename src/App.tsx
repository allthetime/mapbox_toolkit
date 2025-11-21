import Map from "./Map";
import SearchBar from "./components/SearchBar";
import DetailsSidebar from "./components/DetailsSidebar";

export default function App() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <SearchBar />
      <DetailsSidebar />
      <Map />
    </div>
  );
}