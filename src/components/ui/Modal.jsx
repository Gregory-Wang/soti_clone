import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { useLanguage } from '@/hooks/useLanguage.js';

// Universal modal component
// Form config
// Button config
// Result prompt config
// Other config
const Modal = forwardRef(({ 
  title, 
  children, 
  onClose,
  // Form config
  formConfig = null,
  // Button config
  buttons = [],
  // Result prompt config
  resultConfig = null,
  // Other config
  className = ""
}, ref) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldUnmount, setShouldUnmount] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({
    close: handleClose,
    showResult: (config) => {
      setResultConfig(config);
      setShowResult(true);
    }
  }));

  useEffect(() => {
    // Trigger animation when component mounts
    setIsVisible(true);
    setShouldUnmount(false);
    
    // Initialize form data
    if (formConfig) {
      const initialData = {};
      formConfig.fields.forEach(field => {
        initialData[field.name] = field.defaultValue || '';
      });
      setFormData(initialData);
    }
  }, [formConfig]);

  const handleClose = () => {
    if (isClosing) return; // Prevent repeated clicks
    
    setIsClosing(true);
    setIsVisible(false);
    
    // Wait for close animation to finish before unmounting component
    setTimeout(() => {
      setShouldUnmount(true);
      onClose();
    }, 300);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const handleButtonClick = async (button) => {
    if (button.type === 'cancel') {
      handleClose();
      return;
    }

    if (button.type === 'submit') {
      // Validate form
      const newErrors = {};
      let isValid = true;

      if (formConfig && formConfig.validation) {
        formConfig.fields.forEach(field => {
          const value = formData[field.name];
          if (field.required && (!value || value.trim() === '')) {
            newErrors[field.name] = field.errorMessage || t('fieldRequired');
            isValid = false;
          }
        });
      }

      if (!isValid) {
        setErrors(newErrors);
        return;
      }

      // Execute button logic
      if (button.onClick) {
        try {
          const result = await button.onClick(formData);
          
          // Show success result
          if (resultConfig && resultConfig.success) {
            setShowResult(true);
            setTimeout(() => {
              setShowResult(false);
              handleClose();
            }, resultConfig.duration || 2000);
          } else {
            // If there is no success prompt configured, close immediately
            handleClose();
          }
        } catch (error) {
          console.error('Modal operation failed:', error);
          
          // Show error result - use specific error message
          if (resultConfig && resultConfig.error) {
            const errorConfig = {
              ...resultConfig.error,
              message: error.message || resultConfig.error.message
            };
            setResultConfig(errorConfig);
            setShowResult(true);
            setTimeout(() => {
              setShowResult(false);
            }, resultConfig.duration || 3000); // Error message display time is slightly longer
          }
        }
      }
    }
  };

  const renderForm = () => {
    if (!formConfig) return children;

    return (
      <section className="space-y-4">
        {formConfig.fields.map((field, index) => (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="w-24 text-right">{field.label}</label>
              <div className="flex-1 relative">
                <input
                  ref={index === 0 ? field.ref : null}
                  type={field.type || 'text'}
                  className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 ${
                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                />
                {errors[field.name] && (
                  <span className="text-red-500 text-sm absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none animate-pulse">
                    {errors[field.name]}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  };

  const renderButtons = () => {
    if (buttons.length === 0) return null;

    return (
      <footer className="flex justify-end gap-2 mt-4">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(button)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-150 ${
              button.type === 'cancel' 
                ? 'bg-gray-500 text-white hover:bg-gray-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {button.text}
          </button>
        ))}
      </footer>
    );
  };

  const renderResult = () => {
    if (!showResult || !resultConfig) return null;

    const config = showResult === true ? resultConfig.success : resultConfig.error;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg animate-zoom-in">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            config.type === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <i className={`fas ${config.icon} ${
              config.type === 'success' ? 'text-green-500' : 'text-red-500'
            } text-2xl`}></i>
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${
            config.type === 'success' ? 'text-green-600' : 'text-red-600'
          } animate-fade-in`}>
            {config.title}
          </h3>
          <p className="text-sm text-gray-500 animate-fade-in">
            {config.message}
          </p>
        </div>
      </div>
    );
  };

  // If should unmount, do not render
  if (shouldUnmount) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black transition-all duration-300 ease-in-out flex items-center justify-center z-50 ${
        isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
      }`} 
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl transition-all duration-300 ease-out transform ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        } ${className}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 transition-colors duration-150 w-8 h-8 p-1 rounded-full hover:bg-gray-100" 
            onClick={handleClose}
            disabled={isClosing}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className={`transition-all duration-300 ease-in-out ${showResult ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {renderForm()}
          {renderButtons()}
        </div>
        
        {renderResult()}
      </div>
    </div> 
  )
})

export default Modal