import React, {useState} from 'react';

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

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setCity(query);

        if (query.length > 2) {
            try {
                const fetchedSuggestions = await onFetchSuggestions(query);
                setSuggestions(fetchedSuggestions);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault(); // Prevent default form submission
        if (city.trim()) {
            onSearch(city);
            setCity(''); // Clear the input field after search
        } else {
            alert('Please enter a city name.');
        }
    };

    const handleUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newUnit = event.target.value;
        setUnit(newUnit);
        onUnitChange(newUnit); // Call the prop function to update in App
    };

    const handleSuggestionsClick = (suggestion: string) => {
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
                    {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} onClick={() => handleSuggestionsClick(suggestion)}>
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
                    Farenheit (°F)
                </label>
            </div>
        </form>
    );
};

export default SearchBar;