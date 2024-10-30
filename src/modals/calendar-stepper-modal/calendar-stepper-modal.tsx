import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from '@mui/material';
import { CheckCircle, Warning } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

import StepperCalendar from './stepper-calendar/stepper-calendar.component';
import RegisterModal from '../register-modal/register-modal.component';
import LoginModal from '../login-modal/login-modal.component';

import './calendar-stepper-modal.styles.scss';
import { rtlClass } from '../../assets/utils/utils';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import TrialSessionSuccessModal from '../trial-session-success-modal/trial-session-success-modal.component';
import TrialBookingSuccessModal from '../trial-booking-success-modal/trial-booking-success-modal.component';
import { Instructor } from '../../assets/types';

interface CalendarStepperModalProps {
  handleClose: () => void;
  instructor: Instructor;
  fromTrailModal?: boolean;
}

const CalendarStepperModal: React.FC<CalendarStepperModalProps> = ({
  handleClose,
  instructor,
  fromTrailModal = false,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  // const bookingTrailStatus = useAppSelector(selectBookingTrialStatus);
  const currentUser = useSelector(selectCurrentUser);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedField, setSelectedField] = useState<number | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<any>();
  const [openTrialBookingModal, setOpenTrialBookingModal] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [userBooked, setUserBooked] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openTrialSuccessModal, setOpenTrialSuccessModal] = useState(false);

  let timeout: NodeJS.Timeout;

  // useEffect(() => {
  //   if (bookingTrailStatus.success) setOpenTrialBookingModal(true);
  //   if (bookingTrailStatus.failure) {
  //     enqueueSnackbar(bookingTrailStatus.failure, { variant: 'error' });
  //   }
  // }, [bookingTrailStatus]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSelectField = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedField(+event.target.value);
  const handleSelectedSlot = (slot: any) => setSelectedSlot(slot);

  const getSelectedFieldTitle = (value: number | undefined) => {
    const fieldObj = instructor?.fields?.find((el) => el.id === value);
    return fieldObj ? `(${fieldObj.name.trim()})` : '';
  };

  const bookNow = () => {
    if (!selectedField || !selectedSlot) return;
    if (currentUser?.id) {
      const trialObj = {
        start_date: selectedSlot.startStr,
        end_date: selectedSlot.endStr,
        tutor_id: instructor.id,
        student_id: currentUser.id,
        field_id: +selectedField,
        time_slots: [selectedSlot.id],
      };
      // dispatch(bookingTrailStart(trialObj));
    } else {
      setOpenRegisterModal(true);
    }
  };

  const closeModalWithTimeout = (
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setter(true);
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setter(false);
    }, 5000);
  };

  return (
    <>
      <div
        className={`calendar-stepper ${openTrialBookingModal ? 'hide' : ''}`}
      >
        <h1>{t('CALENDAR.WIZARD.BOOKING_FREE_TRIAL_SESSION')}</h1>
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          className={rtlClass()}
          sx={{ marginBottom: 2 }}
        >
          <Step key={t('CALENDAR.WIZARD.CHOOSE_FIELD')}>
            <StepLabel icon={<CheckCircle />}>
              <Button
                sx={{ textTransform: 'none' }}
                onClick={() => setActiveStep(0)}
                variant="text"
              >
                {t('CALENDAR.WIZARD.CHOOSE_FIELD')}
                <span className="u-color-primary">
                  {getSelectedFieldTitle(selectedField)}
                </span>
              </Button>
            </StepLabel>
            <StepContent>
              <div className="fields__wrapper">
                {instructor?.fields?.map((field) => (
                  <label
                    key={field.id}
                    className="radio"
                    htmlFor={`${field.id}`}
                  >
                    <input
                      type="radio"
                      name="radioParent"
                      id={field.id.toString()}
                      value={field.id}
                      checked={field.id === selectedField}
                      onChange={handleSelectField}
                      onClick={handleNext}
                    />
                    <span>{field.name}</span>
                  </label>
                ))}
              </div>
            </StepContent>
          </Step>

          <Step key={t('CALENDAR.WIZARD.SCHEDULE_SESSION')}>
            <StepLabel icon={<CheckCircle />}>
              {t('CALENDAR.WIZARD.SCHEDULE_SESSION')}
            </StepLabel>
            <StepContent>
              {alreadyBooked && (
                <div className="calendar__warning">
                  <div className="calendar__warning--title">
                    <div className="mark">
                      <Warning />
                    </div>
                    <div className="title">
                      <h4>{t('CALENDAR.WIZARD.MESSAGES.WARNING.TITLE')}!</h4>
                    </div>
                  </div>
                  <p>
                    {userBooked
                      ? t('CALENDAR.WIZARD.MESSAGES.WARNING.BODY2')
                      : t('CALENDAR.WIZARD.MESSAGES.WARNING.BODY1')}
                  </p>
                </div>
              )}
              <StepperCalendar
                instructor={instructor}
                onSelectSlot={handleSelectedSlot}
                showAlreadyBooked={() =>
                  closeModalWithTimeout(setAlreadyBooked)
                }
                hideAlreadyBooked={() => setAlreadyBooked(false)}
              />
              <div className="calendar-actions__container">
                {!fromTrailModal && (
                  <Button
                    onClick={handleBack}
                    variant="contained"
                    color="secondary"
                  >
                    {t('CALENDAR.WIZARD.ACTIONS.BACK')}
                  </Button>
                )}
                <Button
                  onClick={bookNow}
                  variant="contained"
                  color="primary"
                  disabled={!selectedSlot}
                >
                  {t('CALENDAR.WIZARD.ACTIONS.SCHEDULE')}
                </Button>
              </div>
            </StepContent>
          </Step>
        </Stepper>
      </div>

      <Dialog
        open={openRegisterModal}
        onClose={() => setOpenRegisterModal(false)}
        fullWidth
        aria-labelledby="student-dialog"
      >
        <RegisterModal
          onClose={() => setOpenRegisterModal(false)}
          openLoginModal={() => setOpenLoginModal(true)}
          // openTrialSuccessModal={triggerTrialSuccessModal}
          modalData={{ fromCheckout: false }}
        />
      </Dialog>

      <Dialog
        open={openLoginModal}
        onClose={() => setOpenLoginModal(false)}
        fullWidth
        aria-labelledby="student-dialog"
      >
        <LoginModal
          onClose={() => setOpenLoginModal(false)}
          openRegisterModal={() => setOpenRegisterModal(true)}
          // openTrialSuccessModal={triggerTrialSuccessModal}
          modalData={{ fromCheckout: false }}
        />
      </Dialog>

      <Dialog
        open={openTrialSuccessModal}
        onClose={() => setOpenTrialSuccessModal(false)}
      >
        <TrialSessionSuccessModal
          onClose={() => setOpenTrialSuccessModal(false)}
        />
      </Dialog>

      <Dialog
        open={openTrialBookingModal}
        onClose={() => setOpenTrialBookingModal(false)}
      >
        <TrialBookingSuccessModal
          handleClose={() => setOpenTrialBookingModal(false)}
        />
      </Dialog>
    </>
  );
};

export default CalendarStepperModal;
