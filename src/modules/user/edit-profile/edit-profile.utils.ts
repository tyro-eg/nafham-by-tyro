import { UserInfoType } from '.';

/* eslint-disable no-useless-escape */
export const calculateMissingProfileInformation = (
  profileData: UserInfoType,
) => {
  const output = [];

  if (
    !profileData?.slots ||
    (profileData?.slots && profileData.slots.length === 0)
  ) {
    output.push({
      text: 'PROFILE.EDITPROFILE.MISSING_INFORMATION.AVAILABILITY',
      bold: true,
    });
  }
  if (
    profileData?.avatar == null ||
    (profileData?.avatar instanceof String &&
      profileData?.avatar?.trim() === '') ||
    (profileData?.avatar instanceof String &&
      profileData?.avatar?.includes('dummy-img'))
  ) {
    output.push({
      text: 'PROFILE.EDITPROFILE.MISSING_INFORMATION.PICTURE',
      bold: false,
    });
  }
  if (profileData?.bio == null || profileData?.bio?.trim() === '') {
    output.push({
      text: 'PROFILE.EDITPROFILE.MISSING_INFORMATION.ABOUT',
      bold: false,
    });
  }
  if (
    profileData?.video_url == null ||
    profileData?.video_url?.trim() === '' ||
    profileData?.video_url?.includes('error')
  ) {
    output.push({
      text: 'PROFILE.EDITPROFILE.MISSING_INFORMATION.VIDEO',
      bold: false,
    });
  }

  return output;
};

export const getYoutubeId = (url: string) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = (url || '').match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }
  return 'error';
};

export const TARGET_STUDENTS_MAX = 200;

/**
 * Progress toward a tutor's target number of students: the percent reached
 * (may pass 100) and the bar width (capped at 100). Null without a target.
 */
export const targetProgress = (
  current: number,
  target?: number | null,
): { percent: number; width: number; reached: boolean } | null => {
  if (!target || target <= 0) return null;
  const percent = Math.round((Math.max(current, 0) / target) * 100);
  return { percent, width: Math.min(percent, 100), reached: percent >= 100 };
};

/** A target as typed: '' clears it, otherwise a whole number from 1 to 200 */
export const parseTargetStudents = (value: string): number | '' | null => {
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (!/^\d+$/.test(trimmed)) return null;
  const target = Number(trimmed);
  return target >= 1 && target <= TARGET_STUDENTS_MAX ? target : null;
};
