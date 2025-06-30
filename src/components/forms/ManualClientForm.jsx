import React, { useState } from 'react';
import axios from '../../axios';

const ManualClientForm = ({ generateTempPassword, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
    sendWelcomeEmail: true,
    generatePassword: true,
    customPassword: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Generate password when checkbox is checked
    if (name === 'generatePassword' && checked) {
      const newPassword = generateTempPassword();
      setGeneratedPassword(newPassword);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.generatePassword && !formData.customPassword) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        password: formData.generatePassword ? generatedPassword : formData.customPassword,
        role: 'client',
        registeredBy: 'admin'
      };

      const response = await axios.post('/auth/admin-register-client', submitData);
      
      if (response.data.success) {
        alert(`Client registered successfully! ${
          formData.generatePassword 
            ? `\n\nTemporary Password: ${generatedPassword}\n\nPlease share this password securely with the client.`
            : ''
        }`);
        onSuccess();
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to register client' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {errors.submit}
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name*</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Last Name*</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-gray-100 p-4 rounded-md">
        <h4 className="font-medium mb-2">Account Access</h4>
        
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            name="generatePassword"
            checked={formData.generatePassword}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-sm">Generate temporary password</span>
        </label>

        {formData.generatePassword && generatedPassword && (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Temporary Password:</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-blue-600 text-sm hover:underline"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <code className="block mt-1 font-mono text-sm">
              {showPassword ? generatedPassword : '••••••••••••'}
            </code>
          </div>
        )}

        {!formData.generatePassword && (
          <div>
            <label className="block text-sm font-medium mb-1">Custom Password</label>
            <input
              type="password"
              name="customPassword"
              value={formData.customPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter password"
            />
          </div>
        )}

        <label className="flex items-center mt-2">
          <input
            type="checkbox"
            name="sendWelcomeEmail"
            checked={formData.sendWelcomeEmail}
            onChange={handleChange}
            className="mr-2"
          />
          <span className="text-sm">Send welcome email with login instructions</span>
        </label>
      </div>

      {/* Dog Information (Optional) */}
      <div>
        <h4 className="font-medium mb-2">Dog Information (Optional)</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dog Name</label>
            <input
              type="text"
              name="dogName"
              value={formData.dogName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Breed</label>
            <input
              type="text"
              name="dogBreed"
              value={formData.dogBreed}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="text"
              name="dogAge"
              value={formData.dogAge}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">Admin Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Registration method, special circumstances, etc."
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Registering...' : 'Register Client'}
        </button>
      </div>
    </form>
  );
};

export default ManualClientForm;