import React, {useState} from 'react';

interface SearchBarProps {
    onSearch: (city: string) => void;
    onUseLocation: () => void;
    onUnitChange: (unit: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onUseLocation, onUnitChange }) => {
    const [city, setCity] = useState('');
    const [unit, setUnit] = useState('metric'); // Default to Celsius

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCity(event.target.value);
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

    return (
        <form onSubmit={handleSubmit} className="search-bar">
            <input
                type="text"
                placeholder="Enter city name"
                value={city}
                onChange={handleChange}
                id="city-input"
            />
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