import { useState } from "react";

const useForm = (initialState, validate) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Update form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    // Validate field and update errors
    if (validate) {
      const errorMessage = validate(name, value); // Validate only the current field
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: errorMessage, // Update or clear the error for the specific field
      }));
    }
  };

  const handleDateChange = (date, name) => {
    // Update form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: date,
    }));

    // Validate field and update errors
    if (validate) {
      const errorMessage = validate(name, date); // Validate only the current field
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: errorMessage, // Update or clear the error for the specific field
      }));
    }
  };

  return {
    formData,
    errors,
    handleChange,
    handleDateChange,
    setFormData,
    setErrors,
  };
};

export default useForm;