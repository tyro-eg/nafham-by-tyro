import { FC, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { OndemandVideo } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import './edit-profile-video.styles.scss';

interface EditProfileVideoModalProps {
  onClose: () => void;
  dataUrl: string | null | undefined;
  onSetProfileInfo: (videoUrl: string, type: string) => void;
}

const EditProfileVideoModal: FC<EditProfileVideoModalProps> = ({
  onClose,
  dataUrl,
  onSetProfileInfo,
}) => {
  const { t } = useTranslation();
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    if (dataUrl) {
      setVideoUrl(dataUrl);
    }
  }, [dataUrl]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVideoUrl(event.target.value);
  };

  const onSave = () => {
    onSetProfileInfo(videoUrl, 'video_url');
    onClose();
  };

  return (
    <div className="edit-video-modal">
      <div className="edit-video-modal__header">
        <div className="edit-video-modal__icon">
          <OndemandVideo />
        </div>
        <p className="edit-video-modal__title">
          {t('PROFILE.EDITPROFILE.VIDEO.EDITMODAL.TITLE')}
        </p>
      </div>
      <textarea
        className="edit-video-modal__input"
        name="profile about"
        rows={2}
        cols={40}
        dir="ltr"
        placeholder="https://www.youtube.com/watch?v="
        onChange={handleChange}
        value={videoUrl}
      />
      <div className="edit-video-modal__actions">
        <Button variant="outlined" onClick={onClose}>
          {t('MODALS.ACTIONS.CANCEL')}
        </Button>
        <Button variant="contained" color="primary" onClick={onSave}>
          {t('MODALS.ACTIONS.OK')}
        </Button>
      </div>
    </div>
  );
};

export default EditProfileVideoModal;
