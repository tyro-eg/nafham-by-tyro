import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface EditProfileVideoModalProps {
  onClose: () => void;
  dataUrl: string | null | undefined;
  onSetProfileInfo: (videoUrl: string, type: string) => void;
}

const EditProfileVideoModal: React.FC<EditProfileVideoModalProps> = ({
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
    onSetProfileInfo(videoUrl, 'video');
    onClose();
  };

  return (
    <div className="profile-info__video-edit-modal">
      <p className="profile-info__video-edit-modal-title">
        {t('PROFILE.EDITPROFILE.VIDEO.EDITMODAL.TITLE')}
      </p>
      <textarea
        className="cellInput profile-p"
        name="profile about"
        rows={1}
        cols={40}
        onChange={handleChange}
        value={videoUrl}
      />
      <div className="profile-info__edit-mode-modal-container">
        <Button variant="contained" color="primary" onClick={onSave}>
          {t('MODALS.ACTIONS.OK')}
        </Button>
        <Button variant="outlined" color="error" onClick={onClose}>
          {t('MODALS.ACTIONS.CANCEL')}
        </Button>
      </div>
    </div>
  );
};

export default EditProfileVideoModal;
