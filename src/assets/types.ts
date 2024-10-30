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

type Field = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  price: number;
  in_person_price: number;
  parent_id: number;
  visible: number;
};

export type Instructor = {
  id: number;
  full_name: string;
  available: boolean;
  online?: boolean;
  about: string;
  rate_to_display: number;
  number_of_reviews: number;
  average_rating?: number;
  number_of_sessions: number;
  number_of_students: number;
  video: string;
  profile_picture_medium: string;
  bio?: string;
  instructor_fields: string[];
  tutor_fields: (string | number)[][];
  tutor_reviews: TutorReview[];
  free_trial: FreeTrial;
  tutor_packages: TutorPackage[];
  time_slots?: Schedule[];
  fields?: Field[];
};
