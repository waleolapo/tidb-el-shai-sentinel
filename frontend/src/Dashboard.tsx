import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Recommendations from './Recommendations';
import HealthSearch from './HealthSearch';

// Define the structure of a sensor reading object
interface SensorReading {
  id: number;
  value: number;
  timestamp: string;
  sensor_type: string;
  farm_name: string;
}

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: string }) => (
  <div className="col-md-6 mb-4">
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <i className={`bi ${icon} fs-1 text-primary me-4`}></i>
          <div>
            <h5 className="card-title text-muted">{title}</h5>
            <p className="card-text fs-2 fw-bold">{value}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function Dashboard() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const [loadingReadings, setLoadingReadings] = useState<boolean>(true);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(true);
  const [errorReadings, setErrorReadings] = useState<string | null>(null);
  const [errorWeather, setErrorWeather] = useState<string | null>(null);

  // Default location for weather (e.g., San Francisco)
  const latitude = 37.7749;
  const longitude = -122.4194;

  // Fetch sensor readings
  useEffect(() => {
    const fetchReadings = () => {
      setLoadingReadings(true);
      fetch(`http://127.0.0.1:5001/api/readings`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          setReadings(data);
          setLoadingReadings(false);
        })
        .catch(error => {
          setErrorReadings(error.message);
          setLoadingReadings(false);
        });
    };
    fetchReadings();
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const response = await fetch(`http://127.0.0.1:5001/api/weather?lat=${latitude}&lon=${longitude}`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeather(data);
      } catch (err: any) {
        setErrorWeather(err.message);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Determine latest temperature, prioritizing OpenWeather
  const latestTempFromWeather = weather?.main?.temp !== undefined ? weather.main.temp.toFixed(1) + ' °C (Weather)' : null;
  const latestTempFromSensor = readings.find(r => r.sensor_type === 'temperature')?.value.toFixed(1) + ' °C (Sensor)' || null;
  const displayTemp = latestTempFromWeather || latestTempFromSensor || 'N/A';

  const latestMoisture = readings.find(r => r.sensor_type === 'soil_moisture')?.value.toFixed(1) + ' %' || 'N/A';
  const weatherHumidity = weather?.main?.humidity !== undefined ? weather.main.humidity.toFixed(1) + ' %' : 'N/A';

  const chartData = readings.map(r => ({
    timestamp: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: r.sensor_type === 'temperature' ? r.value : null,
    soil_moisture: r.sensor_type === 'soil_moisture' ? r.value : null,
  })).reverse();

  return (
    <div className="container-fluid py-4">
      <h1 className="h2 mb-4">Farm Dashboard</h1>
      <div className="row">
        <StatCard title="Latest Temperature" value={displayTemp} icon="bi-thermometer-half" />
        <StatCard title="Latest Soil Moisture" value={latestMoisture} icon="bi-droplet-half" />
        <StatCard title="Atmospheric Humidity" value={weatherHumidity} icon="bi-cloud-haze" />
      </div>

      {/* Health Search Component */}
      <HealthSearch />

      <div className="row mb-4">
        <div className="col-12">
          <Recommendations />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Sensor Data Over Time</h5>
              {(loadingReadings || loadingWeather) ? <p>Loading chart...</p> : 
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis yAxisId="left" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Moisture (%)', angle: -90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature" stroke="#ff6384" connectNulls dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="soil_moisture" name="Soil Moisture" stroke="#36a2eb" connectNulls dot={false} />
                </LineChart>
              </ResponsiveContainer>}
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">All Readings</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Farm</th>
                      <th>Sensor Type</th>
                      <th>Value</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(loadingReadings || loadingWeather) ? <tr><td colSpan={4}>Loading...</td></tr> : readings.map(reading => (
                      <tr key={reading.id}>
                        <td>{reading.farm_name}</td>
                        <td>{reading.sensor_type}</td>
                        <td>{reading.value}</td>
                        <td>{new Date(reading.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;