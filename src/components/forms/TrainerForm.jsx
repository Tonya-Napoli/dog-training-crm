import React, { useState } from 'react';

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
    hourlyRate: '',
    offersGroupClasses: false,
    canTravelToClient: false,
    acceptedDogSizes: [],
    acceptedDogTemperaments: [],
    trainingPhilosophy: '',
    serviceArea: '',
    insuranceInfo: '',
    dateJoined: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const specialtyOptions = [
    { value: 'basicObedience', label: 'Basic Obedience' },
    { value: 'puppyTraining', label: 'Puppy Training' },
    { value: 'behaviorModification', label: 'Behavior Modification' },
    { value: 'aggressionManagement', label: 'Aggression Management' },
    { value: 'anxietyReduction', label: 'Anxiety Reduction' },
    { value: 'agility', label: 'Agility Training' },
    { value: 'serviceAnimal', label: 'Service Animal Training' },
    { value: 'therapyDog', label: 'Therapy Dog Training' },
    { value: 'scent', label: 'Scent Work/Detection' },
    { value: 'trickTraining', label: 'Trick Training' }
  ];

  const certificationOptions = [
    'Certified Professional Dog Trainer (CPDT-KA)',
    'Catch Canine Trainers Academy (CCDT)',
    'Karen Pryor Academy (KPA-CTP)',
    'International Association of Animal Behavior Consultants (IAABC)',
    'Association of Professional Dog Trainers (APDT)',
    'Certification Council for Professional Dog Trainers (CCPDT)',
    'Animal Behavior College (ABC)',
    'Victoria Stilwell Academy (VSA)',
    'Other'
  ];

  const dogSizeOptions = [
    { value: 'small', label: 'Small (0-20 lbs)' },
    { value: 'medium', label: 'Medium (21-50 lbs)' },
    { value: 'large', label: 'Large (51-90 lbs)' },
    { value: 'extraLarge', label: 'Extra Large (91+ lbs)' }
  ];

  const dogTemperamentOptions = [
    { value: 'shy', label: 'Shy/Fearful' },
    { value: 'aggressive', label: 'Aggressive' },
    { value: 'anxious', label: 'Anxious' },
    { value: 'reactive', label: 'Reactive' },
    { value: 'highEnergy', label: 'High Energy' },
    { value: 'hyperactive', label: 'Hyperactive' }
  ];

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      tempErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      tempErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
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

    if (formData.specialties.length === 0) {
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

    const anyDaySelected = Object.values(formData.availability).some(day => day);
    if (!anyDaySelected) {
      tempErrors.availability = "Please select at least one day of availability";
      isValid = false;
    }

    if (!formData.bio.trim()) {
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

    if (formData.acceptedDogSizes.length === 0) {
      tempErrors.acceptedDogSizes = "Please select at least one dog size";
      isValid = false;
    }

    if (!formData.trainingPhilosophy.trim()) {
      tempErrors.trainingPhilosophy = "Training philosophy is required";
      isValid = false;
    }

    if (!formData.serviceArea.trim()) {
      tempErrors.serviceArea = "Service area is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

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

  const handleMultiSelectChange = (e, fieldName) => {
    const value = e.target.value;
    
    setFormData(prevData => {
      // Check if the value is already selected
      if (prevData[fieldName].includes(value)) {
        // If selected, remove it
        return {
          ...prevData,
          [fieldName]: prevData[fieldName].filter(item => item !== value)
        };
      } else {
        // If not selected, add it
        return {
          ...prevData,
          [fieldName]: [...prevData[fieldName], value]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/trainer/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
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
            hourlyRate: '',
            offersGroupClasses: false,
            canTravelToClient: false,
            acceptedDogSizes: [],
            acceptedDogTemperaments: [],
            trainingPhilosophy: '',
            serviceArea: '',
            insuranceInfo: '',
            dateJoined: new Date().toISOString().split('T')[0]
          });
        } else {
          const errorData = await response.json();
          setErrors({ submit: errorData.message || 'Failed to create trainer account' });
        }
      } catch (error) {
        setErrors({ submit: 'Something went wrong. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Dog Trainer Registration</h2>
      
      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Dog trainer account created successfully!
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
                  onChange={(e) => handleMultiSelectChange(e, 'specialties')}
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
            <option value="1-2 years">1-2 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5-10 years">5-10 years</option>
            <option value="10+ years">10+ years</option>
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
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="trainingPhilosophy">
            Training Philosophy*
          </label>
          <textarea
            id="trainingPhilosophy"
            name="trainingPhilosophy"
            value={formData.trainingPhilosophy}
            onChange={handleChange}
            rows="3"
            className={`w-full px-3 py-2 border rounded-lg ${errors.trainingPhilosophy ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Describe your approach to dog training..."
          ></textarea>
          {errors.trainingPhilosophy && <p className="text-red-500 text-xs mt-1">{errors.trainingPhilosophy}</p>}
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
            placeholder="Tell us about your training background, success stories, and experience..."
          ></textarea>
          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Accepted Dog Sizes*
          </label>
          <div className="flex flex-wrap gap-4">
            {dogSizeOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  name="acceptedDogSizes"
                  value={option.value}
                  checked={formData.acceptedDogSizes.includes(option.value)}
                  onChange={(e) => handleMultiSelectChange(e, 'acceptedDogSizes')}
                  className="mr-2"
                />
                <span className="text-gray-700 text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.acceptedDogSizes && <p className="text-red-500 text-xs mt-1">{errors.acceptedDogSizes}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Special Temperaments You Work With
          </label>
          <div className="grid grid-cols-2 gap-2">
            {dogTemperamentOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  name="acceptedDogTemperaments"
                  value={option.value}
                  checked={formData.acceptedDogTemperaments.includes(option.value)}
                  onChange={(e) => handleMultiSelectChange(e, 'acceptedDogTemperaments')}
                  className="mr-2"
                />
                <span className="text-gray-700 text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serviceArea">
            Service Area*
          </label>
          <input
            type="text"
            id="serviceArea"
            name="serviceArea"
            value={formData.serviceArea}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg ${errors.serviceArea ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Cities, counties, or radius you serve"
          />
          {errors.serviceArea && <p className="text-red-500 text-xs mt-1">{errors.serviceArea}</p>}
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
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="insuranceInfo">
            Insurance Information
          </label>
          <input
            type="text"
            id="insuranceInfo"
            name="insuranceInfo"
            value={formData.insuranceInfo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Provider name and policy number if applicable"
          />
        </div>
        
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="offersGroupClasses"
                checked={formData.offersGroupClasses}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm">Offers Group Classes</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="canTravelToClient"
                checked={formData.canTravelToClient}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm">Can Travel to Client</span>
            </label>
          </div>
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
            {isSubmitting ? 'Creating...' : 'Create Dog Trainer Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainerForm;