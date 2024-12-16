import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface EditProfileImageModalProps {
  onClose: () => void;
  imageUrl: string | null | undefined;
  onSetProfileInfo: (imageData: string, type: string) => void;
}

const EditProfileImageModal: React.FC<EditProfileImageModalProps> = ({
  onClose,
  imageUrl,
  onSetProfileInfo,
}) => {
  const { t } = useTranslation();
  const [upImg, setUpImg] = useState<string | ArrayBuffer | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);

  // Generate the cropped preview
  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * pixelRatio;
    canvas.height = completedCrop.height * pixelRatio;

    if (ctx) {
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height,
      );
    }
  }, [completedCrop]);

  // Handle file selection
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setUpImg(reader.result));
      reader.readAsDataURL(file);
    }
  };

  // Set the image reference and initialize default crop
  const onLoad = useCallback((img: HTMLImageElement) => {
    imgRef.current = img;
    setCrop({
      unit: 'px',
      width: 200,
      height: 200,
      x: 0,
      y: 0,
    });
  }, []);

  // Save the cropped image
  const saveImage = () => {
    if (previewCanvasRef.current) {
      const base64 = previewCanvasRef.current.toDataURL('image/webp');
      onSetProfileInfo(base64, 'img');
      onClose();
    }
  };

  return (
    <div className="profile-info__img-edit-modal">
      <label htmlFor="contained-button-file">
        <input
          accept="image/*"
          onChange={onSelectFile}
          id="contained-button-file"
          type="file"
          style={{ display: 'none' }}
        />
        <Button variant="contained" component="span">
          {t('PROFILE.EDITPROFILE.IMG.EDITMODAL.UPLOAD')}
        </Button>
      </label>

      <div className="image-cropper-wrapper">
        {upImg && (
          <ReactCrop
            circularCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
          >
            <img
              src={upImg as string}
              onLoad={(e) => onLoad(e.currentTarget)}
              alt="To crop"
            />
          </ReactCrop>
        )}
      </div>

      <div className="profile-info__img-edit-modal-placeholder">
        {completedCrop ? (
          <canvas
            ref={previewCanvasRef}
            style={{
              width: '200px',
              height: '200px',
            }}
          />
        ) : (
          imageUrl && <img src={imageUrl} alt="profile" />
        )}
      </div>

      <p className="title">{t('PROFILE.EDITPROFILE.IMG.EDITMODAL.TITLE')}</p>

      <div className="profile-info__img-edit-modal-actions">
        <Button color="error" variant="outlined" onClick={onClose}>
          {t('MODALS.ACTIONS.CANCEL')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!completedCrop}
          onClick={saveImage}
        >
          {t('MODALS.ACTIONS.SAVE')}
        </Button>
      </div>
    </div>
  );
};

export default EditProfileImageModal;
