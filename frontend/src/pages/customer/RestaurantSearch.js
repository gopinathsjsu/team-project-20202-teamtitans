import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const RestaurantSearch = () => {
  const [searchParams, setSearchParams] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date as default
    time: '19:00', // 7:00 PM as default
    party_size: 2,
    location: '',
    cuisine: ''
  });
  
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch available cuisines on component mount
  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const response = await api.utils.getCuisines();
        setCuisines(response.data);
      } catch (err) {
        console.error('Error fetching cuisines:', err);
      }
    };
    
    fetchCuisines();
  }, []);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.restaurants.getList(searchParams);
      setRestaurants(response.data);
    } catch (err) {
      console.error('Error searching restaurants:', err);
      setError('Failed to fetch restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency display
  const formatCost = (costRating) => {
    return '$'.repeat(costRating);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find a Table</h1>
      
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={searchParams.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={searchParams.time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="party_size" className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
            <select
              id="party_size"
              name="party_size"
              value={searchParams.party_size}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={searchParams.location}
              onChange={handleInputChange}
              placeholder="City, State or Zip"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
            <select
              id="cuisine"
              name="cuisine"
              value={searchParams.cuisine}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Any Cuisine</option>
              {cuisines.map(cuisine => (
                <option key={cuisine.id} value={cuisine.id}>{cuisine.name}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-3 lg:col-span-5 mt-4">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Find A Table'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Results Display */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">
          {restaurants.length > 0 
            ? `Available Restaurants (${restaurants.length})` 
            : 'Search for available restaurants'}
        </h2>
        
        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(restaurant => (
              <div key={restaurant.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {restaurant.primary_photo ? (
                  <img 
                    src={restaurant.primary_photo.image_url} 
                    alt={restaurant.name} 
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
                
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2">{restaurant.name}</h3>
                  
                  <div className="flex items-center mb-2">
                    <div className="text-yellow-500 mr-2">
                      {'★'.repeat(Math.round(restaurant.average_rating))}
                      {'☆'.repeat(5 - Math.round(restaurant.average_rating))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({restaurant.average_rating.toFixed(1)})
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {restaurant.cuisine.map(cuisine => (
                      <span 
                        key={cuisine.id} 
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                      >
                        {cuisine.name}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">
                      {formatCost(restaurant.cost_rating)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {restaurant.bookings_today} booked today
                    </span>
                  </div>
                  
                  <Link 
                    to={`/customer/restaurant/${restaurant.id}`}
                    className="block w-full bg-red-600 hover:bg-red-700 text-white text-center font-bold py-2 px-4 rounded-md transition duration-300"
                  >
                    View Available Times
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-gray-500">
              No restaurants found. Try adjusting your search parameters.
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default RestaurantSearch;