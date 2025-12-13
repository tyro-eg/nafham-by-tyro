/**
 * API Error structure from backend
 * Used consistently across all hooks for error handling
 */
export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

/**
 * Authentication API response headers
 * Extracted from Axios response headers during sign in/sign up
 */
export interface AuthHeaders {
  'access-token'?: string;
  'refresh-token'?: string;
  'expire-at'?: string;
  [key: string]: string | number | boolean | string[] | null | undefined;
}

export type TutorReview = {
  id: number;
  student: string;
  rating: number;
  text: string;
  created_at: string;
};

export type FreeTrial = {
  enabled: boolean;
  claimed: boolean;
};

export type TutorPackage = {
  id: number;
  type: string;
  minutes: number;
  time_in_hours: number;
  rate: number;
  offline_rate: number;
  tutor_user_id: number;
  deleted_at?: string;
};

export type GradeSubject = {
  id: number;
  full_course_name: string;
  created_at: string;
  updated_at: string;
};

export type PackageStudent = {
  id: number;
  country_code: string;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  nationality: string;
  phone_number: string;
  type: 'Student';
  updated_at: string;
  avatar?: string;
};

export type PackageTutor = {
  id: number;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  type: 'Tutor';
  updated_at: string;
  avatar?: string;
  average_rating?: number;
  number_of_reviews?: number;
};

export type Package = {
  id: number;
  amount_paid: number;
  created_at: string;
  grade_subject: GradeSubject;
  initial_hours: number;
  original_hours: number;
  package_type: 'private_session' | 'trial_session' | 'group_course';
  payment_method: string;
  remaining_hours: number;
  slug: string;
  source: string;
  student: PackageStudent;
  tutor: PackageTutor;
  tutor_rate: number;
  updated_at: string;
};

export type Schedule = {
  id: number;
  from: string;
  to: string;
  status: string;
  tutor_id: number;
  session_id: number | null;
  deleted: boolean;
  created_at: string;
  updated_at: string;
};

export type Field = {
  id: number;
  full_course_name: string;
  created_at: string;
  updated_at: string;
};

export type Instructor = {
  id: number;
  available?: boolean;
  online?: boolean;
  rate_to_display?: number;
  number_of_reviews?: number;
  average_rating?: number;
  number_of_sessions?: number;
  number_of_students?: number;
  instructor_fields?: string[];
  tutor_fields?: (string | number)[][];
  tutor_reviews?: TutorReview[];
  free_trial?: FreeTrial;
  tutor_packages?: TutorPackage[];
  time_slots?: Schedule[];
  grade_subjects?: Field[];
  type: 'Tutor' | 'Student';
  bio?: string;
  avatar?: string;
  video_url?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  recommended: boolean;
  updated_at: string;
  created_at: string;
};

export type InstructorProfile = {
  id: number;
  avatar: string;
  bio: string;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  recommended: boolean;
  type: 'Tutor' | 'Student';
  updated_at: string;
  video_url: string;
};

export type CurrentUser = {
  id: number;
  avatar: string;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  type: 'Tutor' | 'Student';
  updated_at: string;
  email_confirmed: boolean;
};

export type SessionType = {
  id: number;
  created_at: string;
  end_time: string;
  grade_subject: {
    id: number;
    created_at: string;
    full_course_name: string;
    updated_at: string;
  };
  session_type: 'regular' | 'trial' | 'group';
  start_time: string;
  status: 'open' | 'scheduled' | 'completed' | 'missed' | 'canceled';
  student: {
    id: number;
    created_at: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    type: 'Student' | 'Tutor';
    updated_at: string;
    image: string;
  };
  tutor: {
    id: number;
    created_at: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    type: 'Tutor' | 'Student';
    updated_at: string;
    image: string;
    rating: number;
    reviews: number;
  };
  updated_at: string;
  session_link: string;
};
