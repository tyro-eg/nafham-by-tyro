import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import SessionsScheduleCard from './sessions-schedule-card/sessions-schedule-card.component';
import Carousel from '../../../component/carousel/carousel';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import type { Package } from '../../../assets/types';
import defaultProfileImage from '../../../assets/images/videoSession/people/profile.png';

import './sessions-schedule.styles.scss';

interface UserPackageData {
  user_id: number;
  user_image: string;
  user_name: string;
  user_rating: number;
  user_reviews: number;
  total_hours: number;
  packages: Package[];
}

interface SessionsScheduleProps {
  packages: Package[];
}

const SessionsSchedule: FC<SessionsScheduleProps> = ({ packages }) => {
  const { t } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser);

  /**
   * Group packages by the other user (tutor if current user is student, or student if current user is tutor)
   * and calculate total remaining hours
   * Transforms Package[] into UserPackageData[] for display
   */
  const userPackages = useMemo(() => {
    if (!currentUser || packages.length === 0) return [];

    const grouped: Record<number, UserPackageData> = {};

    packages.forEach((pkg) => {
      // Determine which user to display based on current user
      // If current user is the tutor, show student; otherwise show tutor
      const isCurrentUserTutor = currentUser.id === pkg.tutor.id;
      const displayUser = isCurrentUserTutor ? pkg.student : pkg.tutor;
      const userId = displayUser.id;

      if (!grouped[userId]) {
        grouped[userId] = {
          user_id: displayUser.id,
          user_image: displayUser.avatar || defaultProfileImage,
          user_name: `${displayUser.first_name} ${displayUser.last_name}`,
          user_rating:
            'average_rating' in displayUser
              ? displayUser.average_rating || 0
              : 0,
          user_reviews:
            'number_of_reviews' in displayUser
              ? displayUser.number_of_reviews || 0
              : 0,
          total_hours: 0,
          packages: [],
        };
      }

      grouped[userId].packages.push(pkg);
      grouped[userId].total_hours += pkg.remaining_hours;
    });

    return Object.values(grouped);
  }, [packages, currentUser]);

  return (
    <section className="sessions-schedule">
      <h2 className="sessions-schedule__title">
        {t('MYSESSIONS.SCHEDULE.TITLE')}
      </h2>
      <div className="sessions-schedule__container">
        <Carousel small>
          {userPackages.map((userPackage) => (
            <div key={userPackage.user_id} className="unscheduled-card">
              <SessionsScheduleCard data={userPackage} />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default SessionsSchedule;
