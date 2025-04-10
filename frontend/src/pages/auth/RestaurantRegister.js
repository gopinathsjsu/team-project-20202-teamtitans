import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/api';

const RestaurantRegister = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    role: 'restaurant_manager',
  });
  
  const [restaurantFormData, setRestaurantFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    website: '',
    cuisine: [],
    cost_rating: 2,
  });
  
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cuisines, setCuisines] = useState([]);
  
  // Fetch cuisines when component mounts
  React.useEffect(() => {
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
  
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRestaurantFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'cuisine') {
      // Handle multi-select for cuisine
      const cuisineId = parseInt(value);
      if (checked) {
        setRestaurantFormData(prev => ({
          ...prev,
          cuisine: [...prev.cuisine, cuisineId]
        }));
      } else {
        setRestaurantFormData(prev => ({
          ...prev,
          cuisine: prev.cuisine.filter(id => id !== cuisineId)
        }));
      }
    } else {
      setRestaurantFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const validateUserForm = () => {
    setFormError('');
    const { username, email, password, password2 } = userFormData;
    
    if (!username || !email || !password || !password2) {
      setFormError('Please fill in all required fields');
      return false;
    }
    
    if (password !== password2) {
      setFormError('Passwords do not match');
      return false;
    }
    
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return false;
    }
    
    return true;
  };
  
  const validateRestaurantForm = () => {
    setFormError('');
    const { name, description, address, city, state, zip_code, phone, email } = restaurantFormData;
    
    if (!name || !description || !address || !city || !state || !zip_code || !phone || !email) {
      setFormError('Please fill in all required fields');
      return false;
    }
    
    if (restaurantFormData.cuisine.length === 0) {
      setFormError('Please select at least one cuisine type');
      return false;
    }
    
    return true;
  };
  
  const nextStep = () => {
    if (step === 1 && validateUserForm()) {
      setStep(2);
    }
  };
  
  const prevStep = () => {
    setStep(1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      nextStep();
      return;
    }
    
    if (!validateRestaurantForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Step 1: Register the user as a restaurant manager
      const registerResult = await register({
        ...userFormData,
        role: 'restaurant_manager'
      });
      
      if (!registerResult) {
        throw new Error('User registration failed');
      }
      
      // Step 2: Create the restaurant
      const formattedCuisine = restaurantFormData.cuisine.map(id => {
        return { id };
      });
      
      await api.restaurants.create({
        ...restaurantFormData,
        cuisine: formattedCuisine
      });
      
      // Redirect to restaurant dashboard
      navigate('/restaurant/dashboard');
    } catch (err) {
      // Handle errors
      if (err.response && err.response.data) {
        const serverErrors = err.response.data;
        let errorMsg = '';
        
        // Handle Django REST framework error format
        for (const key in serverErrors) {
          if (Array.isArray(serverErrors[key])) {
            errorMsg += `${key}: ${serverErrors[key].join(', ')} `;
          } else if (typeof serverErrors[key] === 'string') {
            errorMsg += `${key}: ${serverErrors[key]} `;
          }
        }
        
        setFormError(errorMsg || 'Registration failed. Please try again.');
      } else {
        setFormError(error || 'Registration failed. Please try again.');
      }
      
      console.error('Restaurant registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register your restaurant
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
              {formError}
            </div>
          )}
          
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-between">
                <span
                  className={`px-2 bg-white text-sm font-medium ${
                    step === 1 ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  Step 1: Account Information
                </span>
                <span
                  className={`px-2 bg-white text-sm font-medium ${
                    step === 2 ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  Step 2: Restaurant Details
                </span>
              </div>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 ? (
              // Step 1: User Account Information
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={userFormData.username}
                      onChange={handleUserFormChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={userFormData.email}
                      onChange={handleUserFormChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <div className="mt-1">
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        autoComplete="given-name"
                        value={userFormData.first_name}
                        onChange={handleUserFormChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>
      
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <div className="mt-1">
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        autoComplete="family-name"
                        value={userFormData.last_name}
                        onChange={handleUserFormChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={userFormData.password}
                      onChange={handleUserFormChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                </div>
                
                <div>
                  <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                    Confirm Password<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="password2"
                      name="password2"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={userFormData.password2}
                      onChange={handleUserFormChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                </div>
              </>
            ) : (
              // Step 2: Restaurant Information
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Restaurant Name<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={restaurantFormData.name}
                      onChange={handleRestaurantFormChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      required
                      value={restaurantFormData.description}
                      onChange={handleRestaurantFormChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={restaurantFormData.address}
                      onChange={handleRestaurantFormChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City<span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={restaurantFormData.city}
                        onChange={handleRestaurantFormChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State<span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="state"
                        name="state"
                        type="text"
                        required
                        value={restaurantFormData.state}
                        onChange={handleRestaurantFormChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                      ZIP Code<span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="zip_code"
                        name="zip_code"
                        type="text"
                        required
                        value={restaurantFormData.zip_code}
                        onChange={handleRestaurantFormChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone<span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={restaurantFormData.phone}
                        onChange={handleRestaurantFormChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="restaurantEmail" className="block text-sm font-medium text-gray-700">
                      Restaurant Email<span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="restaurantEmail"
                        name="email"
                        type="email"
                        required
                        value={restaurantFormData.email}
                        onChange={handleRestaurantFormChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <div className="mt-1">
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={restaurantFormData.website}
                      onChange={handleRestaurantFormChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cuisine<span className="text-red-500">*</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Select all that apply
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {cuisines.map((cuisine) => (
                      <div key={cuisine.id} className="flex items-center">
                        <input
                          id={`cuisine-${cuisine.id}`}
                          name="cuisine"
                          type="checkbox"
                          value={cuisine.id}
                          checked={restaurantFormData.cuisine.includes(cuisine.id)}
                          onChange={handleRestaurantFormChange}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`cuisine-${cuisine.id}`} className="ml-2 block text-sm text-gray-900">
                          {cuisine.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="cost_rating" className="block text-sm font-medium text-gray-700">
                    Price Range
                  </label>
                  <div className="mt-1">
                    <select
                      id="cost_rating"
                      name="cost_rating"
                      value={restaurantFormData.cost_rating}
                      onChange={handleRestaurantFormChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    >
                      <option value={1}>$ (Inexpensive)</option>
                      <option value={2}>$$ (Moderate)</option>
                      <option value={3}>$$$ (Expensive)</option>
                      <option value={4}>$$$$ (Very Expensive)</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            
            <div className={step === 2 ? "flex justify-between" : ""}>
              {step === 2 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Back
                </button>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className={`${step === 2 ? '' : 'w-full'} flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                }`}
              >
                {isLoading
                  ? 'Processing...'
                  : step === 1
                  ? 'Continue'
                  : 'Register Restaurant'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantRegister;