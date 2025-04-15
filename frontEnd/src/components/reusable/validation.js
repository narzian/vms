export const validate = (name, value, context = {}) => {
  switch (name) {
    case 'vendor_name':
      if (!value) return 'Vendor Name is required';
      return '';
    case 'vendor_tier':
      if (!value) return 'Vendor Tier is required';
      return '';
    case 'engaged_department':
      if (!value) return 'Engaged Department is required';
      return '';
    case 'tin':
      const tinRegex = /^(?:\d{3}-\d{2}-\d{4}|\d{2}-\d{7})$/;
      if (!value) return 'TIN is required';
      if (!tinRegex.test(value)) return 'TIN is not valid';
      return '';
    case 'pan':
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!value) return 'PAN is required';
      if (!panRegex.test(value)) return 'PAN is not valid';
      return '';
    case 'gstin':
      const gstinRegex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
      if (!value) return 'GSTIN is required';
      if (!gstinRegex.test(value)) return 'GSTIN is not valid';
      return '';
    case 'primary_contact_name':
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!value) return 'Contact Name is required';
      if (!nameRegex.test(value)) return 'Contact Name should contain only alphabets';
      return '';
    case 'primary_contact_phone':
      const phoneRegex = /^[6-9][0-9]{9}$/;
      if (!value) return 'Contact Phone is required';
      if (!phoneRegex.test(value)) return 'Contact Phone should be 10 digits and start with 9, 8, 7, or 6';
      return '';
    case 'primary_contact_email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) return 'Contact Email is required';
      if (!emailRegex.test(value)) return 'Contact Email is not valid';
      return '';
    case 'vendor_status':
      if (!value) return 'Vendor Status is required';
      return '';
    case "engagedVendor":
      if (!value) return "Engaged Vendor is required";
      return "";
    case "engagementType":
      if (!value) return "Engagement Type is required";
      return "";
    case "engagementName":
      if (!value) return "Engagement Name is required";
      return "";
    case "startDate":
      if (!value) return "Start Date is required";
      return "";
    case "endDate":
      if (!value) return "End Date is required";
      if (new Date(value) < new Date()) return "End Date cannot be in the past";
      return "";
    case "engagementStatus":
      if (!value) return "Engagement Status is required";
      return "";
    case "managerName":
      if (!value) return "Manager Name is required";
      if (!/^[A-Za-z\s]+$/.test(value))
        return "Manager Name should contain only alphabets";
      return "";
    case "managerPhone":
      if (!value) return "Manager Phone is required";
      if (!/^[6-9][0-9]{9}$/.test(value))
        return "Manager Phone should be 10 digits and start with 6-9";
      return "";
    case "managerEmail":
      if (!value) return "Manager Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Manager Email is not valid";
      return "";
    case 'address_line_1':
      if (!value) return 'Address Line 1 is required';
      return '';
    case 'zip_code':
      const zipcodeRegex = /^[0-9]{6}$/;
      if (!value) return 'Zipcode is required';
      if (!zipcodeRegex.test(value)) return 'Zipcode must be a 6-digit number';
      return '';
    case 'comments':
      if (value.length > 200) return 'Comments cannot exceed 200 characters';
      return '';

    case "expense_description":
      if (!value) return "Expense Description is required";
      if (value.length > 500) return "Expense Description cannot exceed 500 characters";
      return "";

    case "expense_category":
      if (!value) return "Expense Category is required";
      return "";

    case "expense_reference_type":
      if (!value) return "Reference Type is required";
      return "";

    case "expense_reference_number":
      if (!value) return "Reference Number is required";
      return "";

    case "expense_start_date":
      if (!value) return "Start Date is required";
      return "";

    case "expense_end_date":
      if (!value) return "End Date is required";
      if (new Date(value) < new Date(context.expense_start_date)) {
        return "End Date cannot be earlier than Start Date";
      }
      return "";

    case "expense_amount":
      if (!value) return "Expense Amount is required";
      if (isNaN(value) || parseFloat(value) <= 0) return "Expense Amount must be a positive number";
      return "";

    case "converted_amount":
      if (context.currency !== "INR" && (!value || parseFloat(value) <= 0)) {
        return "Converted Amount (INR) is required for non-INR currencies";
      }
      return "";

    case "original_currency":
      if (context.currency !== "INR" && !value) return "Currency type is required";
      return "";


    case "user_name":
      if (!value) return "Username is required.";
      return "";

    case "email":
      const emailRegex1 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) return "Email is required.";
      if (!emailRegex1.test(value)) return "Email is not valid.";
      return "";

    case "password":
      const passwordValidation = {
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        hasMinLength: value.length >= 6,
      };

      if (!passwordValidation.hasUppercase) {
        return "Password must include an uppercase letter.";
      }
      if (!passwordValidation.hasLowercase) {
        return "Password must include a lowercase letter.";
      }
      if (!passwordValidation.hasNumber) {
        return "Password must include a number.";
      }
      if (!passwordValidation.hasSpecialChar) {
        return "Password must include a special character.";
      }
      if (!passwordValidation.hasMinLength) {
        return "Password must be at least 6 characters long.";
      }
      return "";

    case "user_role":
      if (!value) return "User role is required.";
      return "";

    default:
      return "";
  }
};