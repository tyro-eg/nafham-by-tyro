import React, { useEffect, useState } from 'react';
import { Button, IconButton, Dialog, Rating } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';

import { getYoutubeId } from '../edit-profile.utils';
import { rtlClass } from '../../../../assets/utils/utils';
import thumbnailPlaceholder from '../../../../assets/images/video-edit-placeholder_16@2x.png';
import { ReactComponent as ProfileImgPlaceholder } from '../../../../assets/images/img-placeholder_23@2x.svg';

import './profile-info.styles.scss';
import ReadMore from '../../../../component/read-more/read-more.component';
import EditProfileVideoModal from '../../../../modals/edit-profile-video/edit-profile-video.modal';
import EditProfileImageModal from '../../../../modals/edit-profile-image/edit-profile-image.modal';

interface ProfileInfoProps {
  data: {
    video?: string;
    about?: string;
    profile_picture_medium?: string;
    full_name: string;
    online?: boolean;
    average_rating: number;
    rate: number;
    number_of_reviews: number;
    number_of_students: number;
    number_of_sessions: number;
  };
  editMode: boolean;
  getProfileInfo: (updatedData: Record<string, unknown>) => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  data,
  editMode,
  getProfileInfo,
}) => {
  const { t } = useTranslation();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [youtubeThumbnail, setYoutubeThumbnail] =
    useState<string>(thumbnailPlaceholder);
  const [about, setAbout] = useState<string>('');
  const [openImageViewModal, setOpenImageViewModal] = useState(false);
  const [openVideoEditModal, setOpenVideoEditModal] = useState(false);
  const [openImageEditModal, setOpenImageEditModal] = useState(false);
  const [croppedImg, setCroppedImg] = useState<string | undefined>();
  const [profileUpdateData, setProfileUpdateData] = useState<
    Record<string, unknown>
  >({});

  useEffect(() => {
    if (data) {
      if (data.video) {
        const videoId = data.video;
        setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
        setYoutubeThumbnail(
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        );
      }
      if (data.about) {
        setAbout(data.about);
      }
    }
  }, [data]);

  useEffect(() => {
    if (Object.keys(profileUpdateData).length > 0) {
      getProfileInfo(profileUpdateData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUpdateData]);

  const setProfileInfo = (updatedData: string, type: string) => {
    setProfileUpdateData((prevState) => ({
      ...prevState,
      [type]: updatedData,
    }));
    if (type === 'video') {
      const videoId = getYoutubeId(updatedData);
      setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
      setYoutubeThumbnail(
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      );
    }
    if (type === 'img') {
      setCroppedImg(updatedData);
    }
  };

  return (
    <section className={`profile-info ${rtlClass()}`}>
      {data && (
        <>
          <div className="profile-info__container container">
            <div className="profile-info__instructor">
              <div className="profile-info__instructor-card">
                <div
                  className={`profile-info__instructor-img ${
                    data.online ? 'online' : ''
                  } ${editMode ? 'editMode' : ''}`}
                >
                  {!editMode && data.profile_picture_medium && (
                    <Button
                      className="profile-img-btn"
                      onClick={() => setOpenImageViewModal(true)}
                    >
                      <img
                        className="clickable-img"
                        src={croppedImg || data.profile_picture_medium}
                        alt="Profile"
                      />
                    </Button>
                  )}
                  {editMode && (
                    <>
                      {data.profile_picture_medium ? (
                        <>
                          <img
                            src={croppedImg || data.profile_picture_medium}
                            alt="Profile"
                          />
                          <IconButton
                            className="edit-icon"
                            onClick={() => setOpenImageEditModal(true)}
                          >
                            <EditIcon />
                          </IconButton>
                        </>
                      ) : (
                        <Button
                          style={{ padding: 0 }}
                          onClick={() => setOpenImageEditModal(true)}
                        >
                          <ProfileImgPlaceholder className="editMode placeholder" />
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <div className="profile-info__instructor-info">
                  <div className="profile-info__instructor-name">
                    {data.full_name || '-'}
                  </div>
                  <div className="profile-info__instructor-stars">
                    <Rating
                      name="profile-info-review"
                      value={
                        data.average_rating
                          ? Number(data.average_rating?.toPrecision(2))
                          : 0
                      }
                      precision={0.1}
                      readOnly
                    />
                    <span className="review-numbers">
                      {data.average_rating
                        ? Number(data.average_rating?.toPrecision(2))
                        : 0}{' '}
                      (5.0)
                    </span>
                  </div>
                </div>
              </div>
              <div className="profile-info__about">
                {editMode ? (
                  <textarea
                    className="cellInput profile-p"
                    rows={5}
                    cols={40}
                    onChange={(e) => setAbout(e.target.value)}
                    onBlur={(e) => setProfileInfo(e.target.value, 'about')}
                    value={about}
                    placeholder={t('PROFILE.ABOUT_INSTRUCTOR')}
                  />
                ) : (
                  <ReadMore text={about || ''} maxLength={394} />
                )}
              </div>
            </div>
            {/* Video Section */}
            <div className="profile-info__video-banner">
              {videoUrl && !editMode && (
                <iframe
                  title="Profile Video"
                  src={videoUrl}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              )}
              {editMode && (
                <div
                  style={{ backgroundImage: `url(${youtubeThumbnail})` }}
                  className="profile-info__video-banner--editMode"
                >
                  <div className="text-wrapper">
                    {!videoUrl && (
                      <h4>{t('PROFILE.EDITPROFILE.VIDEO.EDITTEXT.TITLE')}</h4>
                    )}
                    <p className={videoUrl ? 'editMode' : ''}>
                      {t('PROFILE.EDITPROFILE.VIDEO.EDITTEXT.BODY')}
                    </p>
                    <Button
                      className="u-full-width"
                      variant="contained"
                      onClick={() => setOpenVideoEditModal(true)}
                    >
                      {t('PROFILE.EDITPROFILE.VIDEO.EDITTEXT.BUTTON')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Statistics Section */}
          <div className="profile-info__statistics">
            {[
              // {
              //   label: t('PROFILE.EDITPROFILE.STATISTICS.RATE'),
              //   value: `${data.rate} ${t('GENEREL.EGP_PER_HOUR')}`,
              // },
              {
                label: t('PROFILE.EDITPROFILE.STATISTICS.REVIEWS'),
                value: data.number_of_reviews || 0,
              },
              {
                label: t('PROFILE.EDITPROFILE.STATISTICS.ACTIVE_HOURS'),
                value: `${data.number_of_sessions || 0} ${t('GENEREL.HOURS')}`,
              },
              {
                label: t('PROFILE.EDITPROFILE.STATISTICS.NUMBER_OF_STUDENTS'),
                value: data.number_of_students || 0,
              },
            ].map((stat, idx) => (
              <div key={idx} className="profile-info__statistics-card">
                <p className="profile-info__statistics-card__name">
                  {stat.label}
                </p>
                <p className="profile-info__statistics-card__value">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Modals */}
      <Dialog
        maxWidth="sm"
        fullWidth
        open={openVideoEditModal}
        onClose={() => setOpenVideoEditModal(false)}
      >
        <EditProfileVideoModal
          onClose={() => setOpenVideoEditModal(false)}
          dataUrl={videoUrl}
          onSetProfileInfo={setProfileInfo}
        />
      </Dialog>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={openImageEditModal}
        onClose={() => setOpenImageEditModal(false)}
      >
        <EditProfileImageModal
          onClose={() => setOpenImageEditModal(false)}
          imageUrl={croppedImg || data.profile_picture_medium}
          onSetProfileInfo={setProfileInfo}
        />
      </Dialog>
      <Dialog
        maxWidth="sm"
        fullWidth
        open={openImageViewModal}
        onClose={() => setOpenImageViewModal(false)}
      >
        <div className="profile-info__img-viewer-modal">
          <img src={croppedImg || data.profile_picture_medium} alt="Profile" />
        </div>
      </Dialog>
    </section>
  );
};

export default ProfileInfo;
