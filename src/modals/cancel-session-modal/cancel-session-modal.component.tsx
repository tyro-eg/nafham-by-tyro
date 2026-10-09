import { FC } from 'react';
import { Button } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import './cancel-session-modal.styles.scss';
import { useCancelSession, useEndSession } from '../../hooks/useSessions';

interface CancelSessionModalProps {
  type: 'cancel' | 'end';
  sessionId: number;
  handleClose: () => void;
}

const CancelSessionModal: FC<CancelSessionModalProps> = ({
  type,
  sessionId,
  handleClose,
}) => {
  const { t } = useTranslation();
  const cancelSessionMutation = useCancelSession();
  const endSessionMutation = useEndSession();

  const cancelThisSession = async () => {
    try {
      if (type === 'cancel') {
        await cancelSessionMutation.mutateAsync(sessionId);
      } else {
        await endSessionMutation.mutateAsync(sessionId);
      }
      handleClose();
    } catch (error) {
      console.error('Session action error:', error);
      // Error is already handled by the hook via snackbar
    }
  };

  return (
    <div className="cancelCalendarModal">
      <div className="cancelCalendarModal__head">
        <div className="cancelCalendarModal__head-icon">
          <Warning fontSize="inherit" />
        </div>
        <div className="cancelCalendarModal__head-text">
          <h4 className="cancelCalendarModal__title">
            {type === 'cancel'
              ? t('MYSESSIONS.MAIN.CANCELMODAL.TITLE')
              : t('MYSESSIONS.MAIN.ENDMODAL.TITLE')}
          </h4>
          <p className="cancelCalendarModal__body">
            {type === 'cancel'
              ? t('MYSESSIONS.MAIN.CANCELMODAL.DESCRIPTION')
              : t('MYSESSIONS.MAIN.ENDMODAL.DESCRIPTION')}
          </p>
        </div>
      </div>
      <div className="cancelCalendarModal__actions-container">
        <Button
          className="cancelCalendarModal__actions-container-action"
          variant="outlined"
          onClick={handleClose}
        >
          {t('MYSESSIONS.MAIN.CANCELMODAL.NO')}
        </Button>
        <Button
          className="cancelCalendarModal__actions-container-action"
          variant="contained"
          color="error"
          onClick={cancelThisSession}
        >
          {t('MYSESSIONS.MAIN.CANCELMODAL.YES')}
        </Button>
      </div>
    </div>
  );
};

export default CancelSessionModal;
