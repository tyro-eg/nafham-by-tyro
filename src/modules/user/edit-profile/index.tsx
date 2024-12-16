import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { Check, Edit } from '@mui/icons-material';
import { useParams } from 'react-router-dom';

import {
  selectCurrentUser,
  selectInstructor,
} from '../../../redux/user/user.selectors';

import ProfileCalendar from './profile-calendar-container/profile-calendar-container.component';
import ProfileMissingInfoBanner from './profile-missing-info-banner/profile-missing-info-banner.component';
import ProfileReviewsList from './profile-reviews-list/profile-reviews-list.component';
import ProfileInfo from './profile-info/profile-info.component';
import ProfileFields from './profile-fields/profile-fields.component';
import { getYoutubeId } from './edit-profile.utils';

import './index.scss';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import {
  getInstructorById,
  updateUserInfo,
} from '../../../redux/user/user.actions';
import AppCard from '../../../component/card/app-card.component';

const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  const currentUser = useAppSelector(selectCurrentUser);
  const instructor = useAppSelector(selectInstructor);

  const [showEditMode, setShowEditMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [profileReviewsData, setProfileReviewsData] = useState<any[]>([]);
  const [profileInfoData, setProfileInfoData] = useState<any>({});
  const [profilePackagesData, setProfilePackagesData] = useState<any>([]);
  const [missingInformationFlag, setMissingInformationFlag] = useState(false);
  const [updateSlots, doUpdateSlots] = useState(0);
  const [profileUserInfo, setProfileUserInfo] = useState<any>({});

  useEffect(() => {
    onBlockingMissingInformation(false);
    dispatch(getInstructorById({ id: +id! }));
    if (currentUser && currentUser.id) {
      setShowEditMode(Number(currentUser.id) === Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser]);

  useEffect(() => {
    if (instructor) {
      setProfileData(instructor);
      setProfileReviewsData(instructor?.tutor_reviews!);
      setProfileInfoData(initProfileInfoObj(instructor));
      // setProfilePackagesData(initProfilePackagesObj())
      if (instructor.tutor_packages) {
        setProfilePackagesData(instructor.tutor_packages);
      }
      setProfileUserInfo(initProfileUserInfoObj(instructor));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructor]);

  const initProfileInfoObj = (profile: any) => ({
    full_name: instructor?.full_name,
    about: instructor?.about,
    number_of_reviews: profile?.number_of_reviews,
    video: instructor?.video,
    profile_picture_medium: profile?.profile_picture_medium,
    average_rating: profile?.average_rating,
    online: !!profile?.online,
    rate: profile?.rate_to_display,
    number_of_students: profile?.number_of_students,
  });

  const initProfileUserInfoObj = (profile: any) => ({
    bio: instructor?.bio,
    video_url: instructor?.video,
    profile_picture_medium: profile?.profile_picture_medium,
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

  const updateProfile = () => {
    doUpdateSlots((prev) => prev + 1);
    const { slots, ...info } = profileUserInfo;
    dispatch(updateUserInfo({ id: +id!, type: '', userData: info }));
  };

  const onBlockingMissingInformation = (flag: boolean) =>
    setMissingInformationFlag(flag);

  const openFreeTrialModal = () => {};

  const freeTrailCardFlag = () =>
    !showEditMode &&
    profileData?.free_trial?.enabled &&
    !profileData?.free_trial?.claimed &&
    profilePackagesData?.filter((el: any) => el.type === 'TrialPackage')
      .length > 0;

  const getProfileInfo = (updatedData: any) => {
    if (updatedData) {
      setProfileUserInfo((prevState: any) => ({
        ...prevState,
        ...updatedData,
        bio:
          updatedData.about !== profileData.about
            ? updatedData.about
            : prevState.bio,
        video_url:
          updatedData.video !== profileData.video
            ? getYoutubeId(updatedData.video)
            : prevState.video_url,
        profile_picture_medium:
          updatedData.img !== profileData.profile_picture_medium
            ? updatedData.img
            : prevState.profile_picture_medium,
        slots:
          updatedData.slots?.length > 0
            ? updatedData.slots
            : prevState.slots || [],
      }));
    }
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

  const onToggleEditFromCalender = () => setEditMode(true);

  return (
    <>
      {!!instructor && (
        <section className="profile">
          {renderProfileInfo()}
          <div className="profile__container container">
            <div className="profile__fieldsTrail">
              <div
                className={`profile__fieldsTrail-fields ${
                  freeTrailCardFlag() ? 'withTrial' : ''
                }`}
              >
                <ProfileFields fields={instructor.instructor_fields || []} />
              </div>
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
              <h4 className="profile__calendar__title">
                {t('PROFILE.INSTRUCTOR_AVAILABILITY')}
              </h4>
              <div className="profile__calendar__slots">
                {renderProfileCalender()}
              </div>
            </div>
            {profileReviewsData?.length > 0 && (
              <div className="profile__reviews">
                <h4 className="profile__reviews__title">
                  {t('COURSES.COURSE_REVIEWS.REVIEWS')}
                </h4>
                <div className="profile__reviews__container">
                  <ProfileReviewsList profileReviews={profileReviewsData} />
                </div>
              </div>
            )}
            {showEditMode && (
              <ProfileMissingInfoBanner
                data={profileUserInfo}
                blockingMissingInfo={onBlockingMissingInformation}
              />
            )}
            {showEditMode && (
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
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default EditProfile;
