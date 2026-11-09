import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from '@mui/material';
import {
  ChatBubbleOutlineRounded,
  Check,
  Edit,
  EventAvailableRounded,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import {
  useCanMessage,
  useStartConversation,
} from '../../../hooks/useStreamChat';
import {
  useInstructor,
  useUpdateTutorProfile,
} from '../../../hooks/useInstructors';
import { useSlots } from '../../../hooks/useCalendar';
import { Instructor } from '../../../assets/types';
import AppCard from '../../../component/card/app-card.component';
import ProfileCalendar from './profile-calendar-container/profile-calendar-container.component';
import ProfileMissingInfoBanner from './profile-missing-info-banner/profile-missing-info-banner.component';
import ProfileReviewsList from './profile-reviews-list/profile-reviews-list.component';
import ProfileInfo from './profile-info/profile-info.component';
import ProfileFields from './profile-fields/profile-fields.component';
import RequestSessionsModal from '../../../modals/request-sessions-modal/request-sessions-modal.component';
import type { SessionRequestKind } from '../../../hooks/useSessionRequests';
import { getYoutubeId } from './edit-profile.utils';

import './index.scss';

export type ProfileInfoType = {
  full_name?: string;
  bio?: string;
  number_of_reviews?: number;
  video_url?: string;
  avatar?: string;
  average_rating?: number;
  online?: boolean;
  rate?: number;
  number_of_students?: number;
  number_of_sessions?: number;
};

export type UserInfoType =
  | {
      bio?: string;
      video_url?: string;
      avatar?: File | string;
      slots: any[];
    }
  | undefined;

const EditProfile: FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const currentUser = useAppSelector(selectCurrentUser);
  const updateTutorProfileMutation = useUpdateTutorProfile();
  const chat = useStartConversation();

  const [showEditMode, setShowEditMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [profileReviewsData, setProfileReviewsData] = useState<any[]>([]);
  const [profileInfoData, setProfileInfoData] = useState<ProfileInfoType>({});
  const [profilePackagesData, setProfilePackagesData] = useState<any>([]);
  const [missingInformationFlag, setMissingInformationFlag] = useState(false);
  const [updateSlots, doUpdateSlots] = useState(0);
  const [profileUserInfo, setProfileUserInfo] = useState<UserInfoType>();

  // Memoize dates to prevent infinite re-fetches
  const dateRange = useMemo(() => {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    return { from, to };
  }, []); // Empty deps array means this only runs once on mount

  // Use TanStack Query hooks
  const { data: instructor } = useInstructor(id!, !!id);
  const canMessage = useCanMessage(instructor?.id);
  const { data: slots = [] } = useSlots(
    Number(id),
    dateRange.from,
    dateRange.to,
    !!id,
  );

  useEffect(() => {
    onBlockingMissingInformation(false);
    if (currentUser && currentUser.id) {
      setShowEditMode(Number(currentUser.id) === Number(id));
    }
  }, [id, currentUser]);

  useEffect(() => {
    if (instructor) {
      setProfileData({ ...instructor, slots: slots || [] });
      setProfileReviewsData(instructor?.tutor_reviews!);
      setProfileInfoData(initProfileInfoObj(instructor));
      if (instructor.tutor_packages) {
        setProfilePackagesData(instructor.tutor_packages);
      }
      setProfileUserInfo(initProfileUserInfoObj(instructor, slots || []));
    }
  }, [instructor, slots]);

  const initProfileInfoObj = (
    profile: Partial<Instructor>,
  ): ProfileInfoType => ({
    full_name: profile?.first_name + ' ' + profile?.last_name,
    bio: profile?.bio,
    number_of_reviews: profile?.number_of_reviews,
    video_url: profile?.video_url,
    avatar: profile?.avatar,
    average_rating: profile?.average_rating,
    online: !!profile?.online,
    rate: profile?.rate_to_display,
    number_of_students: profile?.number_of_students,
    number_of_sessions: profile?.number_of_sessions,
  });

  const initProfileUserInfoObj = (
    profile: Partial<Instructor>,
    slots: any[],
  ): UserInfoType => ({
    bio: profile?.bio,
    video_url: profile?.video_url,
    avatar: profile?.avatar,
    slots: slots,
  });

  // const initProfilePackagesObj = (profilePackages: any[]) => {
  //   let output = {};
  //   if (instructor.packages?.data) {
  //     const defaultPackage = profilePackages.find(
  //       (el) => el.type === 'DefaultPackage',
  //     );

  //     const freeTrialPackage = profilePackages.find(
  //       (el) => el.type === 'TrialPackage',
  //     );

  //     profilePackages.forEach((el, i) => {
  //       if (el.type === 'TrialPackage') {
  //         profilePackages.splice(i, 1);
  //       }
  //     });

  //     profilePackages.sort((a, b) => a.minutes - b.minutes);

  //     const defaultPackageRate = defaultPackage.rate;

  //     const newProfilePackages = JSON.parse(JSON.stringify(profilePackages));
  //     newProfilePackages.forEach((el) => {
  //       const packageObj = el;
  //       if (
  //         packageObj.type !== 'DefaultPackage' &&
  //         packageObj.type !== 'TrialPackage'
  //       ) {
  //         const savings =
  //           100 - Math.round((packageObj.rate / defaultPackageRate) * 100);
  //         packageObj.savings = savings;
  //         return packageObj;
  //       }
  //       return undefined;
  //     });

  //     output = {
  //       freeTrialPackage,
  //       newProfilePackages,
  //     };
  //   }
  //   return output;
  // };

  const toggleEditMode = () => setEditMode((prevState) => !prevState);

  const updateProfile = async () => {
    doUpdateSlots((prev) => prev + 1);
    const { slots, ...info } = profileUserInfo || {};
    await updateTutorProfileMutation.mutateAsync({
      id: +id!,
      userData: { tutor: info },
    });
  };

  const onBlockingMissingInformation = (flag: boolean) =>
    setMissingInformationFlag(flag);

  // Students cannot book sessions themselves; they send a request to support
  const [requestKind, setRequestKind] = useState<SessionRequestKind | null>(
    null,
  );
  const openRequestModal = (kind?: SessionRequestKind) =>
    setRequestKind(kind ?? 'schedule');
  const closeRequestModal = () => setRequestKind(null);
  const openFreeTrialModal = () => openRequestModal('trial');

  const freeTrailCardFlag = () =>
    !showEditMode &&
    profileData?.free_trial?.enabled &&
    !profileData?.free_trial?.claimed &&
    profilePackagesData?.filter((el: any) => el.type === 'TrialPackage')
      .length > 0;

  const getProfileInfo = (updatedData: Partial<UserInfoType>) => {
    if (!updatedData) return;

    setProfileUserInfo((prevState) => {
      const updateField = (
        field: keyof NonNullable<UserInfoType>,
        transform?: (value: any) => any,
      ) => {
        if (updatedData[field] !== undefined) {
          const newValue = updatedData[field];
          return transform ? transform(newValue) : newValue;
        }
        return prevState?.[field];
      };

      return {
        ...prevState,
        bio: updateField('bio'),
        video_url: updateField('video_url', getYoutubeId),
        avatar: updateField('avatar'),
        slots: updateField('slots', (slots) =>
          slots && slots.length > 0 ? slots : [],
        ),
      };
    });
  };

  const renderProfileInfo = useCallback(
    () => (
      <ProfileInfo
        data={profileInfoData}
        editMode={editMode}
        getProfileInfo={getProfileInfo}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profileInfoData, editMode],
  );

  const renderProfileCalender = useCallback(
    () => (
      <ProfileCalendar
        showEditMode={showEditMode}
        editModeFlag={editMode}
        toggleEditMode={onToggleEditFromCalender}
        getProfileInfo={getProfileInfo}
        updateSlots={updateSlots}
        instructorId={id!}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editMode, showEditMode, updateSlots, id],
  );

  const renderProfileMissingInfoBanner = useCallback(
    () => (
      <ProfileMissingInfoBanner
        data={profileUserInfo!}
        blockingMissingInfo={onBlockingMissingInformation}
      />
    ),
    [profileUserInfo],
  );

  const onToggleEditFromCalender = () => setEditMode(true);

  return (
    <>
      <section className="profile">
        {renderProfileInfo()}
        <div className="profile__container container">
          {showEditMode && renderProfileMissingInfoBanner()}
          {!showEditMode && currentUser?.type === 'Student' && !!instructor && (
            <div className="profile__visitor-actions">
              {canMessage && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ChatBubbleOutlineRounded />}
                  disabled={chat.isStarting}
                  className="profile__message"
                  onClick={() =>
                    chat.startConversation(
                      instructor.id,
                      instructor.grade_subjects?.[0]?.full_course_name,
                    )
                  }
                >
                  {t('MESSAGES.MESSAGE_BUTTON')}
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={<EventAvailableRounded />}
                className="profile__request"
                onClick={() => openRequestModal()}
              >
                {t('SESSION_REQUEST.BUTTON')}
              </Button>
            </div>
          )}
          {requestKind && !!instructor && (
            <Dialog
              maxWidth="sm"
              fullWidth
              open
              onClose={closeRequestModal}
              aria-labelledby="request-sessions-dialog"
            >
              <RequestSessionsModal
                instructor={instructor}
                defaultKind={requestKind}
                handleClose={closeRequestModal}
              />
            </Dialog>
          )}
          {showEditMode && (
            <div className="profile__owner-actions">
              <Button
                onClick={() => {
                  toggleEditMode();
                  if (editMode) updateProfile();
                }}
                startIcon={editMode ? <Check /> : <Edit />}
                variant="contained"
                color="primary"
                disabled={editMode && missingInformationFlag}
                className="profile__edit"
              >
                {editMode
                  ? t('PROFILE.EDITPROFILE.EDITACTION.SAVE&UPDATE')
                  : t('PROFILE.EDITPROFILE.EDITACTION.EDITYOURPROFILE')}
              </Button>
            </div>
          )}
          <div className="profile__fieldsTrail">
            {!!instructor?.grade_subjects?.length && (
              <div
                className={`profile__fieldsTrail-fields ${
                  freeTrailCardFlag() ? 'withTrial' : ''
                }`}
              >
                <ProfileFields fields={instructor.grade_subjects || []} />
              </div>
            )}
            {freeTrailCardFlag() && (
              <div className="profile__fieldsTrail-trial">
                <AppCard
                  title={t('CARDS.FREE_TRIAL.TITLE')}
                  label={t('CARDS.FREE_TRIAL.LABEL')}
                  type="primary"
                  onClickButton={openFreeTrialModal}
                >
                  <p>{t('CARDS.FREE_TRIAL.BODY')}.</p>
                </AppCard>
              </div>
            )}
          </div>
          {/* <div className="profile__available-packages">
              <h4 className="profile__available-packages__title">
                {t('PROFILE.PACKAGES.TITLE')}
              </h4>
              <div className="profile__available-packages__packages">
                <Carousel>
                  {profilePackagesData
                    .filter(
                      (newPackage: any) => newPackage.type !== 'TrialPackage',
                    )
                    .map((newPackage: any) => (
                      <ProfilePackage
                        key={newPackage.id}
                        packageData={newPackage}
                        instructorId={instructor.id}
                      />
                    ))}
                </Carousel>
              </div>
            </div> */}
          <div className="profile__calendar">
            <h2 className="profile__calendar__title">
              {t('PROFILE.INSTRUCTOR_AVAILABILITY')}
            </h2>
            <div className="profile__calendar__slots">
              {renderProfileCalender()}
            </div>
          </div>
          {profileReviewsData?.length > 0 && (
            <div className="profile__reviews">
              <h2 className="profile__reviews__title">
                {t('COURSES.COURSE_REVIEWS.REVIEWS')}
              </h2>
              <div className="profile__reviews__container">
                <ProfileReviewsList profileReviews={profileReviewsData} />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default EditProfile;
