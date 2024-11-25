import React, { useState } from 'react';
import './LocationForm.css';

const LocationForm = ({ onSearch, onAdd, suggestions, onInputChange }) => {
  const [city, setCity] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    setShowSuggestions(value.length > 0);
    onInputChange(value);  // Fetch suggestions as user types
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim() === '') return;
    onSearch(city);
    setShowSuggestions(false);
  };

  const handleAdd = () => {
    if (city.trim() === '') return;
    onAdd(city);
    setCity('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  return (
    <div className="location-form-container">
      <form onSubmit={handleSubmit} className="location-form">
        <input 
          type="text" 
          value={city} 
          onChange={handleInputChange} 
          placeholder="Enter city name" 
        />
        <div className="buttons-container">
          <button type="submit">Search</button>
          <button type="button" onClick={handleAdd}>Add</button>
        </div>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationForm;
