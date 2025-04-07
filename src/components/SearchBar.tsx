import React, {useState} from 'react';

interface SearchBarProps {
    onSearch: (city: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [city, setCity] = useState('');

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
        </form>
    );
};

export default SearchBar;