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
    profileData?.avatar?.trim() === '' ||
    profileData?.avatar?.includes('dummy-img')
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
