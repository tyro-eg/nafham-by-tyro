type TutorReview = {
  id: number;
  student: string;
  rating: number;
  text: string;
  created_at: string;
};

type FreeTrial = {
  enabled: boolean;
  claimed: boolean;
};

type TutorPackage = {
  id: number;
  type: string;
  minutes: number;
  time_in_hours: number;
  rate: number;
  offline_rate: number;
  tutor_user_id: number;
  deleted_at?: string;
};

type Schedule = {
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
