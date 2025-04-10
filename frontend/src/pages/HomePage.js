import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    date: '',
    time: '19:00',
    partySize: 2
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Format query parameters
    const queryParams = new URLSearchParams();
    if (searchParams.location) queryParams.append('location', searchParams.location);
    if (searchParams.date) queryParams.append('date', searchParams.date);
    if (searchParams.time) queryParams.append('time', searchParams.time);
    if (searchParams.partySize) queryParams.append('party_size', searchParams.partySize);
    
    // Navigate to the search page with query parameters
    navigate(`/customer/search?${queryParams.toString()}`);
  };

  // Set today's date as the min date for the date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-red-600 to-red-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Find your table for any occasion
              </h1>
              <p className="mt-6 text-xl text-red-50 max-w-3xl">
                Book your table in minutes at thousands of restaurants nationwide. 
                Whether it's a special celebration or casual dining, we've got you covered.
              </p>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a reservation</h2>
                  <form onSubmit={handleSearch}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={searchParams.location}
                          onChange={handleInputChange}
                          placeholder="City, State or Zip Code"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          min={today}
                          value={searchParams.date}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                            Time
                          </label>
                          <select
                            id="time"
                            name="time"
                            value={searchParams.time}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          >
                            <option value="11:00">11:00 AM</option>
                            <option value="12:00">12:00 PM</option>
                            <option value="13:00">1:00 PM</option>
                            <option value="14:00">2:00 PM</option>
                            <option value="15:00">3:00 PM</option>
                            <option value="16:00">4:00 PM</option>
                            <option value="17:00">5:00 PM</option>
                            <option value="18:00">6:00 PM</option>
                            <option value="19:00">7:00 PM</option>
                            <option value="20:00">8:00 PM</option>
                            <option value="21:00">9:00 PM</option>
                            <option value="22:00">10:00 PM</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="partySize" className="block text-sm font-medium text-gray-700">
                            Party Size
                          </label>
                          <select
                            id="partySize"
                            name="partySize"
                            value={searchParams.partySize}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                              <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                            ))}
                            <option value="13">13+ people</option>
                          </select>
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Find a table
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Discover Top Restaurants
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Explore our selected restaurants with exceptional cuisine and service.
            </p>
          </div>
          
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* This would typically be populated from an API with real restaurant data */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                <div className="flex-shrink-0">
                  <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="h-6 w-3/4 bg-gray-200 animate-pulse mb-2"></div>
                    <div className="h-4 w-full bg-gray-100 animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-100 animate-pulse mt-2"></div>
                    <div className="h-4 w-2/3 bg-gray-100 animate-pulse mt-2"></div>
                  </div>
                  <div className="mt-6">
                    <div className="h-8 w-1/3 bg-red-100 animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => navigate('/customer/search')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              View all restaurants
            </button>
          </div>
        </div>
      </div>
      
      {/* How it works section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How BookTable works
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Simple steps to book your perfect dining experience.
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 text-2xl font-bold">
                1
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">
                Search for restaurants
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Enter your location, date, time, and party size to find available restaurants.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 text-2xl font-bold">
                2
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">
                Choose a restaurant
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Browse through restaurant options and select your preferred dining spot.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 text-2xl font-bold">
                3
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">
                Confirm your reservation
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Enter your details and receive instant confirmation of your reservation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;