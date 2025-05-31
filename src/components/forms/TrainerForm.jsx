import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TrainerForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    hourlyRate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Form options
  const specialtyOptions = [
    { value: 'basicObedience', label: 'Basic Obedience Training' },
    { value: 'puppyTraining', label: 'Puppy Training & Socialization' },
    { value: 'behaviorModification', label: 'Behavior Modification' },
    { value: 'aggressionManagement', label: 'Aggression Management' },
    { value: 'anxietyReduction', label: 'Anxiety & Fear Reduction' },
    { value: 'serviceAnimal', label: 'Service Animal Training' },
    { value: 'agilityTraining', label: 'Agility Training' },
    { value: 'competitionPrep', label: 'Competition Preparation' }
  ];

  const certificationOptions = [
    'Certified Professional Dog Trainer (CPDT-KA)',
    'Karen Pryor Academy (KPA-CTP)', 
    'Association of Professional Dog Trainers (APDT)',
    'AKC Canine Good Citizen Evaluator',
    'International Association of Canine Professionals (IACP)',
    'National Association of Dog Obedience Instructors (NADOI)',
    'Fear Free Certified Professional',
    'Other Professional Certification'
  ];

  const experienceOptions = [
    '1-2 years',
    '3-5 years', 
    '5-10 years',
    '10+ years'
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ];

  // Handle form field changes
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
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle specialty selection (multiple checkboxes)
  const handleSpecialtyChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    
    setFormData(prevData => {
      let newSpecialties;
      if (checked) {
        // Add specialty if checked
        newSpecialties = [...prevData.specialties, value];
      } else {
        // Remove specialty if unchecked
        newSpecialties = prevData.specialties.filter(specialty => specialty !== value);
      }
      
      return {
        ...prevData,
        specialties: newSpecialties
      };
    });

    // Clear specialty error when user makes selection
    if (errors.specialties) {
      setErrors(prev => ({
        ...prev,
        specialties: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // Personal information validation
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
      tempErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters long";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      tempErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Professional information validation
    if (!formData.specialties || formData.specialties.length === 0) {
      tempErrors.specialties = "Please select at least one training specialty";
      isValid = false;
    }

    if (!formData.certification) {
      tempErrors.certification = "Certification selection is required";
      isValid = false;
    }

    if (!formData.experience) {
      tempErrors.experience = "Experience level is required";
      isValid = false;
    }

    // Availability validation
    const hasAvailability = Object.values(formData.availability).some(day => day === true);
    if (!hasAvailability) {
      tempErrors.availability = "Please select at least one day of availability";
      isValid = false;
    }

    // Bio validation
    if (!formData.bio?.trim()) {
      tempErrors.bio = "Professional bio is required";
      isValid = false;
    } else if (formData.bio.trim().length < 50) {
      tempErrors.bio = "Bio must be at least 50 characters long";
      isValid = false;
    } else if (formData.bio.trim().length > 1000) {
      tempErrors.bio = "Bio must be less than 1000 characters";
      isValid = false;
    }

    // Hourly rate validation
    if (!formData.hourlyRate) {
      tempErrors.hourlyRate = "Hourly rate is required";
      isValid = false;
    } else if (isNaN(formData.hourlyRate) || Number(formData.hourlyRate) <= 0) {
      tempErrors.hourlyRate = "Please enter a valid hourly rate";
      isValid = false;
    } else if (Number(formData.hourlyRate) > 500) {
      tempErrors.hourlyRate = "Hourly rate seems unusually high. Please verify.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log("Submitting trainer registration:", formData);
      
      // Prepare data for submission (exclude confirmPassword)
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        specialties: formData.specialties,
        certification: formData.certification,
        experience: formData.experience,
        availability: formData.availability,
        bio: formData.bio.trim(),
        hourlyRate: Number(formData.hourlyRate)
      };

      const response = await fetch('http://localhost:4000/api/auth/register-trainer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Trainer registration successful:', data);
        setSubmitSuccess(true);
        
        // Store the token and log in the user
        if (data.token) {
          localStorage.setItem('token', data.token);
          
          // Update auth context
          await login(data.user.email, formData.password);
          
          // Show success message briefly, then redirect
          setTimeout(() => {
            navigate('/trainer-dashboard');
          }, 2000);
        }
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
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
          hourlyRate: ''
        });
      } else {
        // Handle error response
        console.error('Registration failed:', data);
        setErrors({ 
          submit: data.message || 'Registration failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ 
        submit: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Join Our Trainer Network</h2>
        <p className="text-gray-600">Create your professional trainer profile</p>
      </div>
      
      {/* Debug Toggle - Development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-right mb-4">
          <button 
            type="button"
            onClick={() => setDebugMode(!debugMode)}
            className="text-xs text-gray-500 underline hover:text-gray-700"
          >
            {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
        </div>
      )}
      
      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <div className="flex items-center">
            <span className="text-xl mr-2">✅</span>
            <div>
              <p className="font-semibold">Registration Successful!</p>
              <p className="text-sm">Welcome to Puppy Pros Training! Redirecting to your dashboard...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Global Error Message */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center">
            <span className="text-xl mr-2">❌</span>
            <div>
              <p className="font-semibold">Registration Failed</p>
              <p className="text-sm">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <section className="border-b border-gray-200 pb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hourlyRate">
                Hourly Rate ($) *
              </label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                min="0"
                step="5"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.hourlyRate ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="75"
              />
              {errors.hourlyRate && <p className="text-red-500 text-xs mt-1">{errors.hourlyRate}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter a secure password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <p className="text-gray-500 text-xs mt-1">Must contain uppercase, lowercase, and number</p>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        </section>

        {/* Professional Information Section */}
        <section className="border-b border-gray-200 pb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
            Professional Qualifications
          </h3>
          
          <div className="space-y-6">
            {/* Training Specialties */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-3">
                Training Specialties * <span className="text-gray-500 font-normal">(Select all that apply)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specialtyOptions.map((option) => (
                  <label key={option.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="specialties"
                      value={option.value}
                      checked={formData.specialties.includes(option.value)}
                      onChange={handleSpecialtyChange}
                      className="mr-3 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700 text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.specialties && <p className="text-red-500 text-xs mt-2">{errors.specialties}</p>}
            </div>
            
            {/* Certification */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="certification">
                Primary Certification *
              </label>
              <select
                id="certification"
                name="certification"
                value={formData.certification}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.certification ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select your primary certification</option>
                {certificationOptions.map((cert) => (
                  <option key={cert} value={cert}>{cert}</option>
                ))}
              </select>
              {errors.certification && <p className="text-red-500 text-xs mt-1">{errors.certification}</p>}
            </div>
            
            {/* Experience Level */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience">
                Years of Experience *
              </label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.experience ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select your experience level</option>
                {experienceOptions.map((exp) => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>
          </div>
        </section>

        {/* Availability Section */}
        <section className="border-b border-gray-200 pb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">3</span>
            Availability
          </h3>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-3">
              Days Available for Training * <span className="text-gray-500 font-normal">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
              {daysOfWeek.map((day) => (
                <label key={day.key} className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <span className="text-gray-700 text-sm font-medium mb-2">{day.label}</span>
                  <input
                    type="checkbox"
                    name={`availability.${day.key}`}
                    checked={formData.availability[day.key]}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>
              ))}
            </div>
            {errors.availability && <p className="text-red-500 text-xs mt-2">{errors.availability}</p>}
          </div>
        </section>

        {/* Bio Section */}
        <section className="pb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">4</span>
            Professional Bio
          </h3>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
              Tell us about yourself and your training philosophy *
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="6"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bio ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your training experience, philosophy, and what makes you passionate about dog training. This will be visible to potential clients. (Minimum 50 characters)"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.bio && <p className="text-red-500 text-xs">{errors.bio}</p>}
              <p className="text-gray-500 text-xs ml-auto">
                {formData.bio.length}/1000 characters
              </p>
            </div>
          </div>
        </section>
        
        {/* Submit Button */}
        <div className="text-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full md:w-auto px-8 py-4 bg-blue-500 text-white font-bold text-lg rounded-lg transition duration-300 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Your Account...
              </span>
            ) : (
              'Create Trainer Account'
            )}
          </button>
          
          <p className="text-gray-600 text-sm mt-4">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-500 hover:text-blue-600 font-semibold"
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>
      
      {/* Debug Information */}
      {debugMode && process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
          <pre className="text-xs overflow-auto max-h-96 bg-white p-3 rounded border">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TrainerForm;