import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTemperatureHigh, faTint, faWind, faSmog } from '@fortawesome/free-solid-svg-icons';
import Fuse from 'fuse.js';
import LocationForm from './LocationForm';
import Frame from './Frame';
import { cities } from './cities';
import WeatherForecast from './WeatherForecast'; // Import WeatherForecast component
import './Weather.css';

const Weather = () => {
  const [locations, setLocations] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const savedLocations = JSON.parse(localStorage.getItem('locations')) || [];
    const savedWeatherData = JSON.parse(localStorage.getItem('weatherData')) || {};
    setLocations(savedLocations);
    setWeatherData(savedWeatherData);
    refreshWeatherData(savedLocations);
  }, []);

  useEffect(() => {
    localStorage.setItem('locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('weatherData', JSON.stringify(weatherData));
  }, [weatherData]);

  const addLocation = (city) => {
    if (city && !locations.includes(city) && !weatherData[city]?.notAvailable) {
      setLocations([...locations, city]);
      fetchWeather(city, setWeatherData);
      setSearchResult(null); // Reset search result after adding the city
    }
  };

  const deleteLocation = (city) => {
    setLocations(locations.filter((location) => location !== city));
    setWeatherData((prevData) => {
      const updatedData = { ...prevData };
      delete updatedData[city];
      return updatedData;
    });
  };

  const fetchWeather = async (city, setData) => {
    try {
      console.log(`Fetching weather for ${city}`);
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
      );

      const { lat, lon } = weatherResponse.data.coord;
      const airQualityResponse = await axios.get(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
      );

      const airQuality = airQualityResponse.data.list[0].main.aqi;

      console.log('Weather Data:', weatherResponse.data);
      console.log('Air Quality Data:', airQuality);

      setData((prevData) => ({
        ...prevData,
        [city]: { ...weatherResponse.data, airQuality }
      }));
      if (setData === setSearchResult) {
        setSearchResult({ ...weatherResponse.data, airQuality });
      }
      setError(null);
      setSuggestions([]);
    } catch (err) {
      console.log(err);
      setData((prevData) => ({
        ...prevData,
        [city]: { notAvailable: true }
      }));
      if (setData === setSearchResult) {
        setSearchResult({ notAvailable: true });
      }
      const fuse = new Fuse(cities, {
        includeScore: true,
        threshold: 0.3,
      });
      const results = fuse.search(city);
      setSuggestions(results.map(result => result.item));
      setError(`City not found: ${city}`);
    }
  };

  const refreshWeatherData = (savedLocations) => {
    savedLocations.forEach(city => {
      fetchWeather(city, setWeatherData);
    });
  };

  const handleInputChange = (value) => {
    const fuse = new Fuse(cities, {
      includeScore: true,
      threshold: 0.3,
    });
    const results = fuse.search(value);
    setSuggestions(results.map(result => result.item));
  };

  const handleSearch = (city) => {
    console.log(`Searching for ${city}`);
    fetchWeather(city, setSearchResult);
  };

  return (
    <Frame>
      <LocationForm
        onSearch={handleSearch}
        onAdd={addLocation}
        suggestions={suggestions}
        onInputChange={handleInputChange}
      />
      {error && <p className="error-message">{error}</p>}
      <div className="weather-container">
        {searchResult && (
          <div className="weather-item search-results">
            <h2>{searchResult.name ? searchResult.name : 'City not available'}</h2>
            {searchResult.notAvailable ? (
              <p>
                City not available
                {suggestions.length > 0 && (
                  <div>
                    <p>Did you mean:</p>
                    <ul>
                      {suggestions.map((suggestion) => (
                        <li key={suggestion}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </p>
            ) : (
              searchResult.main && searchResult.weather && (
                <>
                  <div className="weather-info">
                    <p>
                      <FontAwesomeIcon icon={faTemperatureHigh} /> Temperature: {Math.round(searchResult.main.temp - 273.15)}°C
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faTint} /> Humidity: {searchResult.main.humidity}%
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faSmog} /> Air Quality Index: {searchResult.airQuality}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faWind} /> {searchResult.weather[0].description}
                    </p>
                  </div>
                  <button onClick={() => addLocation(searchResult.name)}>Add</button>
                  <WeatherForecast city={searchResult.name} /> {/* Add WeatherForecast Component */}
                </>
              )
            )}
          </div>
        )}
        {locations.map((city) => (
          <div key={city} className="weather-item">
            <div className="weather-header">
              <h2>{city}</h2>
              <button onClick={() => deleteLocation(city)} className="delete-btn">Delete</button>
            </div>
            {weatherData[city] ? (
              weatherData[city].notAvailable ? (
                <p>
                  City not available
                  {suggestions.length > 0 && (
                    <div>
                      <p>Did you mean:</p>
                      <ul>
                        {suggestions.map((suggestion) => (
                          <li key={suggestion}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </p>
              ) : (
                <>
                  <div className="weather-info">
                    <p>
                      <FontAwesomeIcon icon={faTemperatureHigh} /> Temperature: {Math.round(weatherData[city].main.temp - 273.15)}°C
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faTint} /> Humidity: {weatherData[city].main.humidity}%
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faSmog} /> Air Quality Index: {weatherData[city].airQuality}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faWind} /> {weatherData[city].weather[0].description}
                    </p>
                  </div>
                  <WeatherForecast city={city} /> {/* Add WeatherForecast Component */}
                </>
              )
            ) : (
              <p>Loading...</p>
            )}
          </div>
        ))}
      </div>
    </Frame>
  );
};

export default Weather;
