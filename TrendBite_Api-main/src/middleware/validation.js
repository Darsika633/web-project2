// Validation middleware for user registration
export const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = [];

  // First name validation
  if (!firstName || firstName.trim().length === 0) {
    errors.push('First name is required');
  } else if (firstName.trim().length > 50) {
    errors.push('First name cannot exceed 50 characters');
  }

  // Last name validation
  if (!lastName || lastName.trim().length === 0) {
    errors.push('Last name is required');
  } else if (lastName.trim().length > 50) {
    errors.push('Last name cannot exceed 50 characters');
  }

  // Email validation
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  // Password validation
  if (!password || password.length === 0) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for user login
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  }

  // Password validation
  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for profile update
export const validateProfileUpdate = (req, res, next) => {
  const { firstName, lastName, phone, dateOfBirth, gender } = req.body;
  const errors = [];

  // First name validation (optional but if provided, must be valid)
  if (firstName !== undefined) {
    if (firstName.trim().length === 0) {
      errors.push('First name cannot be empty');
    } else if (firstName.trim().length > 50) {
      errors.push('First name cannot exceed 50 characters');
    }
  }

  // Last name validation (optional but if provided, must be valid)
  if (lastName !== undefined) {
    if (lastName.trim().length === 0) {
      errors.push('Last name cannot be empty');
    } else if (lastName.trim().length > 50) {
      errors.push('Last name cannot exceed 50 characters');
    }
  }

  // Phone validation (optional but if provided, must be valid)
  if (phone !== undefined && phone.trim().length > 0) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone)) {
      errors.push('Please enter a valid phone number');
    }
  }

  // Date of birth validation (optional but if provided, must be valid)
  if (dateOfBirth !== undefined && dateOfBirth.trim().length > 0) {
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) {
      errors.push('Please enter a valid date of birth');
    } else {
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      if (age < 13 || age > 120) {
        errors.push('Age must be between 13 and 120 years');
      }
    }
  }

  // Gender validation (optional but if provided, must be valid)
  if (gender !== undefined) {
    const validGenders = ['male', 'female', 'other', 'prefer-not-to-say'];
    if (!validGenders.includes(gender)) {
      errors.push('Gender must be one of: male, female, other, prefer-not-to-say');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Validation middleware for address update
export const validateAddressUpdate = (req, res, next) => {
  const { address } = req.body;
  const errors = [];

  if (address) {
    const { street, city, state, zipCode, country } = address;

    // Street validation (optional but if provided, must be valid)
    if (street !== undefined && street.trim().length > 100) {
      errors.push('Street address cannot exceed 100 characters');
    }

    // City validation (optional but if provided, must be valid)
    if (city !== undefined && city.trim().length > 50) {
      errors.push('City cannot exceed 50 characters');
    }

    // State validation (optional but if provided, must be valid)
    if (state !== undefined && state.trim().length > 50) {
      errors.push('State cannot exceed 50 characters');
    }

    // Zip code validation (optional but if provided, must be valid)
    if (zipCode !== undefined && zipCode.trim().length > 20) {
      errors.push('Zip code cannot exceed 20 characters');
    }

    // Country validation (optional but if provided, must be valid)
    if (country !== undefined && country.trim().length > 50) {
      errors.push('Country cannot exceed 50 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};
