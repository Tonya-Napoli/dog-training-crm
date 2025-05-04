import React, { useState } from 'react';
import axios from '../../axios'; 

const TrainerForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'trainer',
    specialties: [],
    certification: '',
    experience: '',
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    bio: '',
    isActive: true,
    hourlyRate: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const specialtyOptions = [
    { value: 'basicObedience', label: 'Basic Obedience' },
    { value: 'puppyTraining', label: 'Puppy Training' },
    { value: 'behaviorModification', label: 'Behavior Modification' },
    { value: 'aggressionManagement', label: 'Aggression Management' },
    { value: 'anxietyReduction', label: 'Anxiety Reduction' },
    { value: 'serviceAnimal', label: 'Service Animal Training' }
  ];

  const certificationOptions = [
    'Certified Professional Dog Trainer (CPDT-KA)',
    'Karen Pryor Academy (KPA-CTP)',
    'Association of Professional Dog Trainers (APDT)',
    'AKC Canine Good Citizen Evaluator',
    'Other'
  ];

  const experienceOptions = [
    '1-2 years',
    '3-5 years',
    '5-10 years',
    '10+ years'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('availability.')) {
      const day = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        availability: {
          ...prevData.availability,
          [day]: checked
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

  const handleSpecialtyChange = (e) => {
    const value = e.target.value;
    
    setFormData(prevData => {
      // Check if the specialty is already selected
      if (prevData.specialties.includes(value)) {
        // If selected, remove it
        return {
          ...prevData,
          specialties: prevData.specialties.filter(specialty => specialty !== value)
        };
      } else {
        // If not selected, add it
        return {
          ...prevData,
          specialties: [...prevData.specialties, value]
        };
      }
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // Use optional chaining for safe property access
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

    if (!formData.specialties || formData.specialties.length === 0) {
      tempErrors.specialties = "Please select at least one specialty";
      isValid = false;
    }

    if (!formData.certification) {
      tempErrors.certification = "Certification is required";
      isValid = false;
    }

    if (!formData.experience) {
      tempErrors.experience = "Experience is required";
      isValid = false;
    }

    const anyDaySelected = formData.availability && Object.values(formData.availability).some(day => day);
    if (!anyDaySelected) {
      tempErrors.availability = "Please select at least one day of availability";
      isValid = false;
    }

    if (!formData.bio?.trim()) {
      tempErrors.bio = "Bio is required";
      isValid = false;
    } else if (formData.bio.length < 50) {
      tempErrors.bio = "Bio should be at least 50 characters";
      isValid = false;
    }

    if (!formData.hourlyRate) {
      tempErrors.hourlyRate = "Hourly rate is required";
      isValid = false;
    } else if (isNaN(formData.hourlyRate) || Number(formData.hourlyRate) <= 0) {
      tempErrors.hourlyRate = "Hourly rate must be a positive number";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Create FormData object for file upload
        const formDataToSend = new FormData();
        
        // Add all form fields to FormData
        Object.keys(formData).forEach(key => {
          if (key === 'availability' || key === 'specialties') {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        });
        
        // Add profile image if selected
        if (profileImage) {
          formDataToSend.append('profileImage', profileImage);
        }
        
        // Make API request
        const response = await axios.post('/trainers/register', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log("Registration successful:", response.data);
        setSubmitSuccess(true);
        
        // Reset form after successful submission
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'trainer',
          specialties: [],
          certification: '',
          experience: '',
          availability: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
          },
          bio: '',
          isActive: true,
          hourlyRate: ''
        });
        setProfileImage(null);
      } catch (error) {
        console.error("Error:", error.response?.data || error);
        setErrors({ 
          submit: error.response?.data?.message || 'Something went wrong. Please try again.' 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Dog Trainer Registration</h2>
      
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
          Trainer account created successfully!
        </div>
      )}
      
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
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
        
        <div className="mb-4">
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profileImage">
            Profile Image
          </label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <p className="text-gray-500 text-xs mt-1">Upload a professional photo (Max 5MB)</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Training Specialties*
          </label>
          <div className="grid grid-cols-2 gap-2">
            {specialtyOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  name="specialties"
                  value={option.value}
                  checked={formData.specialties.includes(option.value)}
                  onChange={handleSpecialtyChange}
                  className="mr-2"
                />
                <span className="text-gray-700 text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.specialties && <p className="text-red-500 text-xs mt-1">{errors.specialties}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="certification">
            Certification*
          </label>
          <select
            id="certification"
            name="certification"
            value={formData.certification}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${errors.certification ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select Certification</option>
            {certificationOptions.map((cert) => (
              <option key={cert} value={cert}>{cert}</option>
            ))}
          </select>
          {errors.certification && <p className="text-red-500 text-xs mt-1">{errors.certification}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience">
            Experience*
          </label>
          <select
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${errors.experience ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select Experience Level</option>
            {experienceOptions.map((exp) => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
          {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Availability*
          </label>
          <div className="grid grid-cols-7 gap-2">
            {Object.keys(formData.availability).map((day) => (
              <label key={day} className="flex flex-col items-center">
                <span className="text-gray-700 text-sm capitalize mb-1">{day.slice(0, 3)}</span>
                <input
                  type="checkbox"
                  name={`availability.${day}`}
                  checked={formData.availability[day]}
                  onChange={handleChange}
                />
              </label>
            ))}
          </div>
          {errors.availability && <p className="text-red-500 text-xs mt-1">{errors.availability}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
            Bio/Experience Description*
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className={`w-full px-3 py-2 border rounded-lg ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Tell us about your training philosophy, background, and expertise..."
          ></textarea>
          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hourlyRate">
            Hourly Rate ($)*
          </label>
          <input
            type="number"
            id="hourlyRate"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-lg ${errors.hourlyRate ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.hourlyRate && <p className="text-red-500 text-xs mt-1">{errors.hourlyRate}</p>}
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-gray-700 text-sm">Account Active</span>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Trainer Account'}
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

export default TrainerForm;