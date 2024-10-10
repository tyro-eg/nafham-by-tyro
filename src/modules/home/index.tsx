// import React, { useState } from 'react'
// import { Dialog, IconButton } from '@material-ui/core'
// import { makeStyles } from '@material-ui/core/styles'
// import { Close } from '@material-ui/icons'

// import HomeIntro from './home-intro/home-intro.component'
// import HomeFields from './home-fields/home-fields.component'
// import HomeInstructors from './home-instructors/home-instructors.component'
// import HomeFeatures from './home-features/home-features.component'
// import HomeCourses from './home-courses/home-courses.component'
// import HomeHowItWork from './home-book/home-how-it-work.component'
// import HomeTestimonial from './home-testimonial/home-testimonial.component'
// import FreeTrailModal from '../../components/modals/free-trail-modal/free-trail-modal.component'

// import { rtlClass } from '../../assets/utils/utils'

// import './index.scss'
// const useStyles = makeStyles(() => ({
//   paperFullWidth: {
//     width: '100%',
//   },
//   paper: {
//     margin: 0,
//     borderRadius: '16px',
//   },
// }))
// const Home = () => {
//   const classes = useStyles()
//   const [openFreeTrailModal, setOpenFreeTrailModal] = useState(false)
//   const triggerOpenFreeTrailModal = () => {
//     setOpenFreeTrailModal(true)
//   }
//   const handleCloseFreeTrailModal = () => {
//     setOpenFreeTrailModal(false)
//   }
//   return (
//     <div className={`home ${rtlClass()}`}>
//       <HomeIntro openFreeTrail={triggerOpenFreeTrailModal} />
//       <HomeFields />
//       <HomeFeatures openFreeTrail={triggerOpenFreeTrailModal} />
//       <HomeInstructors />
//       <HomeCourses />
//       <HomeHowItWork />
//       <HomeTestimonial />
//       {openFreeTrailModal && (
//         <Dialog
//           maxWidth="md"
//           fullWidth
//           onClose={handleCloseFreeTrailModal}
//           aria-labelledby="free-trail-dialog"
//           open={openFreeTrailModal}
//           classes={classes}
//         >
//           <IconButton
//             className="modal-close-btn"
//             onClick={handleCloseFreeTrailModal}
//             aria-label="close"
//           >
//             <Close />
//           </IconButton>
//           <FreeTrailModal />
//         </Dialog>
//       )}
//     </div>
//   )
// }

// export default Home

const Home = () => {
  return <div>home</div>;
};

export default Home;
