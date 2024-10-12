import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

interface Pin {
  id: number;
  latitude: number;
  longitude: number;
  note: string;
  start_date: string | null;
  end_date: string | null;
}

function App() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [newNote, setNewNote] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchPins();
  }, []);

  const fetchPins = async () => {
    try {
      const response = await axios.get('/api/pins');
      setPins(response.data);
    } catch (error) {
      console.error('Error fetching pins:', error);
    }
  };

  const addPin = async (position: LatLngTuple) => {
    try {
      const newPin = {
        latitude: position[0],
        longitude: position[1],
        note: newNote,
        startDate: startDate?.toISOString().split('T')[0] || null,
        endDate: endDate?.toISOString().split('T')[0] || null,
      };
      await axios.post('/api/pins', newPin);
      fetchPins();
      setNewNote('');
      setStartDate(null);
      setEndDate(null);
    } catch (error) {
      console.error('Error adding pin:', error);
    }
  };

  const removePin = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/pins/${id}`);
      fetchPins();
    } catch (error) {
      console.error('Error removing pin:', error);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        addPin([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-green-50">
      <header className="bg-green-600 text-white p-4">
        <h1 className="text-2xl font-bold flex items-center">
          <MapPin className="mr-2" /> Portland Fruit Tree Tracker
        </h1>
      </header>
      <main className="flex-grow relative">
        <MapContainer center={[45.5152, -122.6784]} zoom={12} className="h-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapEvents />
          {pins.map((pin) => (
            <Marker key={pin.id} position={[pin.latitude, pin.longitude]}>
              <Popup>
                <div className="max-w-xs">
                  <p className="font-semibold mb-2">{pin.note}</p>
                  {pin.start_date && pin.end_date && (
                    <p className="text-sm mb-2">
                      Fruit Season: {new Date(pin.start_date).toLocaleDateString()} - {new Date(pin.end_date).toLocaleDateString()}
                    </p>
                  )}
                  <button
                    onClick={(e) => removePin(pin.id, e)}
                    className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm flex items-center"
                  >
                    <X size={16} className="mr-1" /> Remove
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
      <footer className="bg-green-100 p-4 space-y-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter fruit tree type..."
          className="w-full p-2 border border-green-300 rounded"
        />
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className="w-full p-2 border border-green-300 rounded"
            />
            <Calendar className="absolute right-2 top-2 text-green-500" size={20} />
          </div>
          <div className="flex-1 relative">
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="w-full p-2 border border-green-300 rounded"
            />
            <Calendar className="absolute right-2 top-2 text-green-500" size={20} />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;