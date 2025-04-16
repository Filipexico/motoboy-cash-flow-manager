
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
  lgpdConsent: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
}

export interface LoginFormValues {
  email: string;
  password: string;
}
