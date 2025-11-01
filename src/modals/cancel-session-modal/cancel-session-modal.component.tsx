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
        <Warning
          fontSize="inherit"
          className="cancelCalendarModal__head-icon"
        />
        <h4 className="u-color-title u-font-size-18">
          {type === 'cancel'
            ? t('MYSESSIONS.MAIN.CANCELMODAL.TITLE')
            : t('MYSESSIONS.MAIN.ENDMODAL.TITLE')}
        </h4>
      </div>
      <div className="cancelCalendarModal__body">
        <p className="u-color-body u-font-size-14">
          {type === 'cancel'
            ? t('MYSESSIONS.MAIN.CANCELMODAL.DESCRIPTION')
            : t('MYSESSIONS.MAIN.ENDMODAL.DESCRIPTION')}
        </p>
      </div>
      <div className="cancelCalendarModal__actions-container">
        <Button
          className="cancelCalendarModal__actions-container-action"
          variant="contained"
          color="secondary"
          onClick={handleClose}
        >
          {t('MYSESSIONS.MAIN.CANCELMODAL.NO')}
        </Button>
        <Button
          className="cancelCalendarModal__actions-container-action"
          variant="contained"
          color="primary"
          onClick={cancelThisSession}
        >
          {t('MYSESSIONS.MAIN.CANCELMODAL.YES')}
        </Button>
      </div>
    </div>
  );
};

export default CancelSessionModal;
