import React, { useState, useEffect } from 'react';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

function WeatherDisplay() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Default location for demonstration (e.g., San Francisco)
  const latitude = 37.7749;
  const longitude = -122.4194;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5001/api/weather?lat=${latitude}&lon=${longitude}`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        setWeather(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading weather...</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;
  if (!weather) return <p>No weather data available.</p>;

  const weatherIconUrl = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title"><i className="bi bi-cloud-sun me-2"></i>Current Weather in {weather.name}</h5>
        <div className="d-flex align-items-center">
          <img src={weatherIconUrl} alt={weather.weather[0].description} className="me-3" style={{ width: '60px', height: '60px' }} />
          <div>
            <p className="card-text fs-3 fw-bold mb-0">{weather.main.temp.toFixed(1)}°C</p>
            <p className="text-muted mb-0">Feels like: {weather.main.feels_like.toFixed(1)}°C</p>
          </div>
        </div>
        <ul className="list-unstyled mt-3">
          <li><i className="bi bi-thermometer me-2"></i>Description: {weather.weather[0].description}</li>
          <li><i className="bi bi-droplet me-2"></i>Humidity: {weather.main.humidity}%</li>
          <li><i className="bi bi-wind me-2"></i>Wind: {weather.wind.speed.toFixed(1)} m/s</li>
        </ul>
      </div>
    </div>
  );
}

export default WeatherDisplay;
