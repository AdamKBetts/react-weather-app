import React, {useState, useEffect } from 'react';

interface SearchBarProps {
    onSearch: (city: string) => void;
    onUseLocation: () => void;
    onUnitChange: (unit: string) => void;
    onFetchSuggestions: (query: string) => Promise<string[]>;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onUseLocation, onUnitChange, onFetchSuggestions }) => {
    const [city, setCity] = useState('');
    const [unit, setUnit] = useState('metric'); // Default to Celsius
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (city.length > 2) {
            const debounceTimer = setTimeout(async () => {
                try {
                    const fetchedSuggestions = await onFetchSuggestions(city);
                    setSuggestions(fetchedSuggestions);
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                    setSuggestions([]);
                }
            }, 500);

            return () => clearTimeout(debounceTimer);
        } else {
            setSuggestions([]);
        }
    }, [city, onFetchSuggestions]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setCity(query);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault(); // Prevent default form submission
        if (city.trim()) {
            onSearch(city);
            setCity(''); // Clear the input field after search
            setSuggestions([]);
        } else {
            alert('Please enter a city name.');
        }
    };

    const handleUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newUnit = event.target.value;
        setUnit(newUnit);
        onUnitChange(newUnit); // Call the prop function to update in App
    };

    const handleSuggestionClick = (suggestion: string) => {
        setCity(suggestion);
        setSuggestions([]);
        onSearch(suggestion);
    }

    return (
        <form onSubmit={handleSubmit} className="search-bar">
            <div className="search-input-container">
                <input
                    type="text"
                    placeholder="Enter city name"
                    value={city}
                    onChange={handleChange}
                    onBlur={() => setTimeout(() => setSuggestions([]), 100)}
                />
                    {suggestions.length > 0 && document.activeElement === document.querySelector('.search-input-container input') && (
                        <ul className="suggestions-list">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}
            </div>

            <button type="submit" id="search-button">Search</button>
            <button type="button" onClick={onUseLocation}>Use Current Location</button>

            <div className="unit-selector">
                <label>
                    <input
                        type="radio"
                        value="metric"
                        checked={unit === 'metric'}
                        onChange={handleUnitChange}
                    />
                    Celsius (°C)
                </label>
                <label>
                    <input
                        type="radio"
                        value="imperial"
                        checked={unit === 'imperial'}
                        onChange={handleUnitChange}
                    />
                    Fahrenheit (°F)
                </label>
            </div>
        </form>
    );
};

export default SearchBar;