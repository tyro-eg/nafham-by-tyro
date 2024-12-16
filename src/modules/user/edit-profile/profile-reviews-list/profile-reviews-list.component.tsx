import React from 'react';

import './profile-reviews-list.styles.scss';
import Carousel from '../../../../component/carousel/carousel';
import ReviewCard from '../../../../component/review-card/review-card.component';

export interface ReviewData {
  student: string;
  created_at: string;
  rating: number;
  text: string;
  id: string;
}

interface ProfileReviewsListProps {
  profileReviews?: ReviewData[];
}

const ProfileReviewsList: React.FC<ProfileReviewsListProps> = ({
  profileReviews = [],
}) => (
  <section className="profile-reviews">
    <Carousel>
      {profileReviews.map((review) => (
        <ReviewCard key={review.id} data={review} />
      ))}
    </Carousel>
  </section>
);

export default ProfileReviewsList;
