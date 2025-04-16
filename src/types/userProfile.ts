export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  address: {
    street: string;  // Ensure this is a required string
    city: string;    // Ensure this is a required string
    state: string;   // Ensure this is a required string
    zipcode: string; // Ensure this is a required string
    country: string; // Ensure this is a required string
  };
}

export interface LoginFormValues {
  email: string;
  password: string;
}
