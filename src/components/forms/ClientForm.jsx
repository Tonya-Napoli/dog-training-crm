import React, { useState } from 'react';

const ClientForm = () => {
  const [formData, setFormData] = useState({
    // Client Information
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    // Dog Information
    dogName: '',
    dogBreed: '',
    dogAge: '',
    // Training Goals
    trainingGoals: [],
    role: 'client' // Add role to ensure proper registration
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const trainingGoalOptions = [
    { value: 'basicObedience', label: 'Basic Obedience (Sit, Stay, Come)' },
    { value: 'leashManners', label: 'Leash Manners' },
    { value: 'houseTraining', label: 'House Training' },
    { value: 'socialization', label: 'Socialization with Dogs/People' },
    { value: 'behaviorModification', label: 'Behavior Modification' },
    { value: 'tricks', label: 'Trick Training' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressField]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prevData => ({
        ...prevData,
        [name]: checked
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleGoalChange = (e) => {
    const value = e.target.value;
    
    setFormData(prevData => {
      if (prevData.trainingGoals.includes(value)) {
        // Remove goal if already selected
        return {
          ...prevData,
          trainingGoals: prevData.trainingGoals.filter(goal => goal !== value)
        };
      } else {
        // Add goal if not already selected
        return {
          ...prevData,
          trainingGoals: [...prevData.trainingGoals, value]
        };
      }
    });
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // Validate client information with optional chaining
    if (!formData.firstName?.trim()) {
      tempErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName?.trim()) {
      tempErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email?.trim()) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!formData.phone?.trim()) {
      tempErrors.phone = "Phone number is required";
      isValid = false;
    }

    // Validate address safely
    if (!formData.address?.street?.trim()) {
      tempErrors["address.street"] = "Street address is required";
      isValid = false;
    }

    if (!formData.address?.city?.trim()) {
      tempErrors["address.city"] = "City is required";
      isValid = false;
    }

    if (!formData.address?.state?.trim()) {
      tempErrors["address.state"] = "State is required";
      isValid = false;
    }

    if (!formData.address?.zipCode?.trim()) {
      tempErrors["address.zipCode"] = "Zip code is required";
      isValid = false;
    }

    // Validate dog information
    if (!formData.dogName?.trim()) {
      tempErrors.dogName = "Dog name is required";
      isValid = false;
    }

    if (!formData.dogBreed?.trim()) {
      tempErrors.dogBreed = "Breed is required";
      isValid = false;
    }

    if (!formData.dogAge?.trim()) {
      tempErrors.dogAge = "Age is required";
      isValid = false;
    }

    // Validate training goals
    if (!formData.trainingGoals || formData.trainingGoals.length === 0) {
      tempErrors.trainingGoals = "Please select at least one training goal";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setStatus("Submitting...");
      
      try {
        // Follow the pattern from GetStarted.jsx
        const response = await fetch("http://localhost:4000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setSubmitSuccess(true);
          setStatus("Registration successful!");
          
          // Reset form after successful submission
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            address: {
              street: '',
              city: '',
              state: '',
              zipCode: ''
            },
            dogName: '',
            dogBreed: '',
            dogAge: '',
            trainingGoals: [],
            role: 'client'
          });
        } else {
          const result = await response.json();
          setStatus(`Error: ${result.message || 'Registration failed'}`);
          setErrors({ submit: result.message || 'Registration failed. Please try again.' });
        }
      } catch (error) {
        console.error("Error:", error);
        setStatus("Failed to submit. Please try again.");
        setErrors({ submit: 'Something went wrong. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const [status, setStatus] = useState("");

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Client Registration</h2>
      
      {/* Toggle Debug Button */}
      <div className="text-right mb-4">
        <button 
          type="button"
          onClick={() => setDebugMode(!debugMode)}
          className="text-xs text-gray-500 underline"
        >
          {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
      </div>
      
      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Registration successful!
        </div>
      )}
      
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      {status && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
          {status}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Client Information</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                First Name*
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                Last Name*
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                Phone*
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password*
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm Password*
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Address*
            </label>
            <div className="mb-2">
              <input
                type="text"
                name="address.street"
                placeholder="Street Address"
                value={formData.address.street}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors['address.street'] ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors['address.street'] && <p className="text-red-500 text-xs mt-1">{errors['address.street']}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  name="address.city"
                  placeholder="City"
                  value={formData.address.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors['address.city'] ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors['address.city'] && <p className="text-red-500 text-xs mt-1">{errors['address.city']}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="address.state"
                  placeholder="State"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors['address.state'] ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors['address.state'] && <p className="text-red-500 text-xs mt-1">{errors['address.state']}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="address.zipCode"
                  placeholder="Zip Code"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${errors['address.zipCode'] ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors['address.zipCode'] && <p className="text-red-500 text-xs mt-1">{errors['address.zipCode']}</p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Dog Information Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Dog Information</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dogName">
                Dog Name*
              </label>
              <input
                type="text"
                id="dogName"
                name="dogName"
                value={formData.dogName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.dogName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.dogName && <p className="text-red-500 text-xs mt-1">{errors.dogName}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dogBreed">
                Breed*
              </label>
              <input
                type="text"
                id="dogBreed"
                name="dogBreed"
                value={formData.dogBreed}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.dogBreed ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.dogBreed && <p className="text-red-500 text-xs mt-1">{errors.dogBreed}</p>}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dogAge">
              Age*
            </label>
            <input
              type="text"
              id="dogAge"
              name="dogAge"
              value={formData.dogAge}
              onChange={handleChange}
              placeholder="e.g. 2 years"
              className={`w-full px-3 py-2 border rounded-lg ${errors.dogAge ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.dogAge && <p className="text-red-500 text-xs mt-1">{errors.dogAge}</p>}
          </div>
        </div>
        
        {/* Training Goals Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Training Goals</h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Training Goals*
            </label>
            <div className="grid grid-cols-2 gap-2">
              {trainingGoalOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    name="trainingGoals"
                    value={option.value}
                    checked={formData.trainingGoals.includes(option.value)}
                    onChange={handleGoalChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.trainingGoals && <p className="text-red-500 text-xs mt-1">{errors.trainingGoals}</p>}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Register'}
          </button>
        </div>
      </form>
      
      {/* Debug information display */}
      {debugMode && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Current Form Data (Debug):</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ClientForm;