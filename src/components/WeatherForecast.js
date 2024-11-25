// src/components/WeatherForecast.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './WeatherForecast.css';

const WeatherForecast = ({ city }) => {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
        );
        setForecast(response.data.list.filter((_, index) => index % 8 === 0));
      } catch (error) {
        console.error(error);
      }
    };

    fetchForecast();
  }, [city]);

  return (
    <div className="forecast-container">
      <h3>5-Day Forecast for {city}</h3>
      <ul className="forecast-list">
        {forecast.map((item) => (
          <li key={item.dt} className="forecast-item">
            <span className="forecast-date">{new Date(item.dt * 1000).toLocaleDateString()}</span>
            <span className="forecast-temp">{Math.round(item.main.temp - 273.15)}°C</span>
            <span className="forecast-desc">{item.weather[0].description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeatherForecast;
