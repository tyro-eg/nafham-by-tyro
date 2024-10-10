// import React, { useEffect, useState } from 'react'
// import { useTranslation } from 'react-i18next'
// import { Button } from '@material-ui/core'
// import { Check, Edit } from '@material-ui/icons'
// import { useParams } from 'react-router-dom'
// import PropTypes from 'prop-types'
// import { connect } from 'react-redux'
// import { createStructuredSelector } from 'reselect'

// import {
//   selectCurrentUser,
//   selectInstructor,
// } from '../../../redux/user/user.selectors'

// import ProfileCalendar from './profile-calendar-container/profile-calendar-container.component'
// import ProfileMissingInfoBanner from './profile-missing-info-banner/profile-missing-info-banner.component'
// import ProfilePackage from './profile-package/profile-package.component'
// import ProfileReviewsList from './profile-reviews-list/profile-reviews-list.component'
// import ProfileInfo from './profile-info/profile-info.component'
// import AppCard from '../../../components/card/app-card.component'
// import ProfileFields from './profile-fields/profile-fields.component'
// import {
//   getInstructorByIdStart,
//   updateInstructorStart,
// } from '../../../redux/user/user.actions'
// import { getYoutubeId } from './edit-profile.utils'
// import Carousel from '../../../components/carousel/carousel'

// import Instructors from './instructors.data'

// import './index.scss'
// const EditProfile = ({
//   currentUser,
//   instructor,
//   getInstructorStartProp,
//   updateInstructorStartProp,
// }) => {
//   const { t } = useTranslation()
//   // const history = useHistory()
//   const { id } = useParams()
//   const [showEditMode, setShowEditMode] = useState(false)
//   const [editMode, setEditMode] = useState(false)
//   const [profileData, setProfileData] = useState({})
//   const [profileReviewsData, setProfileReviewsData] = useState([])
//   const [profileInfoData, setProfileInfoData] = useState({})
//   const [profilePackagesData, setProfilePackagesData] = useState([])
//   const [missingInformationFlag, setMissingInformationFlag] = useState(false)
//   const [updateSlots, doUpdateSlots] = useState(0)
//   const [profileUserInfo, setProfileUserInfo] = useState({})

//   useEffect(() => {
//     onBlockingMissingInformation(false)
//     getInstructorStartProp(id)
//     if (currentUser && currentUser.id)
//       setShowEditMode(Number(currentUser.id) === Number(id))
//   }, [])

//   useEffect(() => {
//     if (instructor) {
//       const prof = Instructors.find(
//         (instructorObj) => Number(instructorObj.id) === 2,
//       )
//       setProfileData(prof)
//       setProfileReviewsData(prof.tutor_reviews)
//       setProfileInfoData(initProfileInfoObj(prof))
//       // setProfilePackagesData(initProfilePackagesObj())
//       if (instructor.packages && instructor.packages.data) {
//         setProfilePackagesData(instructor.packages.data)
//       }
//       setProfileUserInfo(initProfileUserInfoObj(prof))
//     }
//   }, [instructor])

//   const initProfileInfoObj = (profile) => {
//     const profileInfoObj = {
//       full_name: instructor.full_name,
//       about: instructor.bio,
//       number_of_reviews: profile.number_of_reviews,
//       video: instructor.video_url,
//       profile_picture_medium: profile.profile_picture_medium,
//       average_rating: profile.average_rating,
//       online: profile.online,
//       rate: profile.rate_to_display,
//       number_of_students: profile.number_of_students,
//     }

//     return profileInfoObj
//   }

//   const initProfileUserInfoObj = (profile) => {
//     const profileUserInfoObj = {
//       bio: instructor.bio,
//       video_url: instructor.video_url,
//       profile_picture_medium: profile.profile_picture_medium,
//     }

//     return profileUserInfoObj
//   }

//   // const initProfilePackagesObj = (profilePackages) => {
//   //   let output = {}
//   //   if (instructor.packages && instructor.packages.data) {
//   //     const defaultPackage = profilePackages.find(
//   //       (el) => el.type === 'DefaultPackage',
//   //     )

//   //     const freeTrialPackage = profilePackages.find(
//   //       (el) => el.type === 'TrialPackage',
//   //     )

//   //     profilePackages.forEach((el, i) => {
//   //       if (el.type === 'TrialPackage') {
//   //         profilePackages.splice(i, 1)
//   //       }
//   //     })

//   //     profilePackages.sort((a, b) => a.minutes - b.minutes)

//   //     const defaultPackageRate = defaultPackage.rate

//   //     const newProfilePackages = JSON.parse(JSON.stringify(profilePackages))
//   //     newProfilePackages.forEach((el) => {
//   //       const packageObj = el
//   //       if (
//   //         packageObj.type !== 'DefaultPackage' &&
//   //         packageObj.type !== 'TrialPackage'
//   //       ) {
//   //         const savings =
//   //           100 - Math.round((packageObj.rate / defaultPackageRate) * 100)
//   //         packageObj.savings = savings
//   //         return packageObj
//   //       }
//   //       return undefined
//   //     })

//   //     output = {
//   //       freeTrialPackage,
//   //       newProfilePackages,
//   //     }
//   //   }
//   //   return output
//   // }

//   const toggleEditMode = () => {
//     setEditMode((prevState) => !prevState)
//   }
//   const updateProfile = () => {
//     doUpdateSlots((prev) => prev + 1)
//     const { slots, ...info } = profileUserInfo
//     updateInstructorStartProp({ tutor: info })
//   }
//   const onBlockingMissingInformation = (flag) => setMissingInformationFlag(flag)
//   // const navigateToCheckout = () => {
//   //   history.push(`/checkout?id=${id}&course=false`)
//   // }
//   const openFreeTrialModal = () => {}
//   const freeTrailCardFlag = () =>
//     !showEditMode &&
//     profileData &&
//     profileData.free_trial &&
//     profileData.free_trial.enabled &&
//     !profileData.free_trial.claimed &&
//     profilePackagesData &&
//     profilePackagesData.freeTrialPackage &&
//     profilePackagesData.freeTrialPackage.rate === 0

//   // const profilePackageTrailFlag = () =>
//   //   profileData &&
//   //   profileData.free_trial &&
//   //   profileData.free_trial.enabled &&
//   //   !profileData.free_trial.claimed &&
//   //   profilePackagesData &&
//   //   profilePackagesData.freeTrialPackage &&
//   //   profilePackagesData.freeTrialPackage.rate !== 0

//   const getProfileInfo = (updatedData) => {
//     if (updatedData) {
//       if (updatedData.about && updatedData.about !== profileData.about) {
//         setProfileUserInfo((prevState) => ({
//           ...prevState,
//           bio: updatedData.about,
//         }))
//       }
//       if (updatedData.video && updatedData.video !== profileData.video) {
//         setProfileUserInfo((prevState) => ({
//           ...prevState,
//           video_url: getYoutubeId(updatedData.video),
//         }))
//       }
//       if (
//         updatedData.img &&
//         updatedData.img !== profileData.profile_picture_medium
//       ) {
//         setProfileUserInfo((prevState) => ({
//           ...prevState,
//           profile_picture_medium: updatedData.img,
//         }))
//       }
//       if (updatedData.slots) {
//         setProfileUserInfo((prevState) => ({
//           ...prevState,
//           slots:
//             updatedData.slots && updatedData.slots.length > 0
//               ? updatedData.slots
//               : [],
//         }))
//       }
//     }
//   }

//   const onToggleEditFromCalender = () => {
//     setEditMode(true)
//   }
//   return (
//     <>
//       {!!instructor && (
//         <section className="profile">
//           <ProfileInfo
//             data={profileInfoData}
//             editMode={editMode}
//             getProfileInfo={getProfileInfo}
//           />
//           <div className="profile__container container">
//             <div className="profile__fieldsTrail">
//               <div
//                 className={`profile__fieldsTrail-fields ${
//                   freeTrailCardFlag() ? 'withTrial' : ''
//                 }`}
//               >
//                 <ProfileFields
//                   fields={
//                     !!instructor.fields && !!instructor.fields.data
//                       ? instructor.fields.data
//                       : []
//                   }
//                 />
//               </div>
//               {freeTrailCardFlag() && (
//                 <div className="profile__fieldsTrail-trial">
//                   <AppCard
//                     title={t('CARDS.FREE_TRIAL.TITLE')}
//                     label={t('CARDS.FREE_TRIAL.LABEL')}
//                     type="primary"
//                     onClickButton={openFreeTrialModal}
//                   >
//                     <p>{t('CARDS.FREE_TRIAL.BODY')}.</p>
//                   </AppCard>
//                 </div>
//               )}
//             </div>
//             <div className="profile__available-packages">
//               <h4 className="profile__available-packages__title">
//                 {t('PROFILE.PACKAGES.TITLE')}
//               </h4>
//               <div className="profile__available-packages__packages">
//                 <Carousel>
//                   {profilePackagesData.map((newPackage) => (
//                     <ProfilePackage
//                       key={newPackage.id}
//                       packageData={newPackage}
//                       instructorId={instructor.id}
//                     />
//                   ))}
//                 </Carousel>
//               </div>
//             </div>

//             <div className="profile__calendar">
//               <h4 className="profile__calendar__title">
//                 {t('PROFILE.INSTRUCTOR_AVAILABILITY')}
//               </h4>
//               <div className="profile__calendar__slots">
//                 <ProfileCalendar
//                   showEditMode={showEditMode}
//                   editModeFlag={editMode}
//                   toggleEditMode={onToggleEditFromCalender}
//                   getProfileInfo={getProfileInfo}
//                   updateSlots={updateSlots}
//                   instructorId={id}
//                 />
//               </div>
//             </div>
//             <div className="profile__reviews">
//               <h4 className="profile__reviews__title">
//                 {t('COURSES.COURSE_REVIEWS.REVIEWS')}
//               </h4>
//               <div className="profile__reviews__container">
//                 {profileReviewsData && profileReviewsData.length > 0 && (
//                   <ProfileReviewsList profileReviews={profileReviewsData} />
//                 )}
//               </div>
//             </div>
//             {showEditMode && (
//               <ProfileMissingInfoBanner
//                 data={profileUserInfo}
//                 blockingMissingInfo={onBlockingMissingInformation}
//               />
//             )}

//             {showEditMode && editMode && (
//               <Button
//                 disabled={missingInformationFlag}
//                 onClick={() => {
//                   toggleEditMode()
//                   updateProfile()
//                 }}
//                 startIcon={<Check />}
//                 className="profile__edit"
//                 variant="contained"
//                 color="primary"
//               >
//                 {t('PROFILE.EDITPROFILE.EDITACTION.SAVE&UPDATE')}
//               </Button>
//             )}

//             {showEditMode && !editMode && (
//               <Button
//                 onClick={toggleEditMode}
//                 startIcon={<Edit />}
//                 className="profile__edit"
//                 variant="contained"
//                 color="primary"
//               >
//                 {t('PROFILE.EDITPROFILE.EDITACTION.EDITYOURPROFILE')}
//               </Button>
//             )}
//           </div>
//         </section>
//       )}
//     </>
//   )
// }

// EditProfile.propTypes = {
//   currentUser: PropTypes.object,
//   getInstructorStartProp: PropTypes.func,
//   updateInstructorStartProp: PropTypes.func,
//   instructor: PropTypes.object,
// }

// const mapStateToProps = createStructuredSelector({
//   currentUser: selectCurrentUser,
//   instructor: selectInstructor,
// })

// const mapDispatchToProps = (dispatch) => ({
//   getInstructorStartProp: (instructorId) =>
//     dispatch(getInstructorByIdStart(instructorId)),
//   updateInstructorStartProp: (info) => dispatch(updateInstructorStart(info)),
// })

// export default connect(mapStateToProps, mapDispatchToProps)(EditProfile)

const EditProfile = () => {
  return <div>Edit Profile</div>;
};

export default EditProfile;
