// Validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
  // At least 6 characters
  if (password.length < 6) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  return { valid: true };
}

// Validate username
function validateUsername(username) {
  // At least 3 characters, alphanumeric and underscore
  if (username.length < 3) {
    return { valid: false, message: 'Tên người dùng phải có ít nhất 3 ký tự' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới' };
  }
  return { valid: true };
}

// Validate registration data
function validateRegistration(data) {
  const { username, email, password, confirmPassword } = data;
  const errors = [];

  // Validate username
  if (!username) {
    errors.push('Tên người dùng là bắt buộc');
  } else {
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      errors.push(usernameValidation.message);
    }
  }

  // Validate email
  if (!email) {
    errors.push('Email là bắt buộc');
  } else if (!validateEmail(email)) {
    errors.push('Email không hợp lệ');
  }

  // Validate password
  if (!password) {
    errors.push('Mật khẩu là bắt buộc');
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      errors.push(passwordValidation.message);
    }
  }

  // Validate confirm password
  if (!confirmPassword) {
    errors.push('Xác nhận mật khẩu là bắt buộc');
  } else if (password !== confirmPassword) {
    errors.push('Mật khẩu xác nhận không khớp');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validate login data
function validateLogin(data) {
  const { email, password } = data;
  const errors = [];

  if (!email) {
    errors.push('Email là bắt buộc');
  } else if (!validateEmail(email)) {
    errors.push('Email không hợp lệ');
  }

  if (!password) {
    errors.push('Mật khẩu là bắt buộc');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateRegistration,
  validateLogin
};
