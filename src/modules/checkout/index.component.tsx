// import React, { useEffect, useState } from 'react'
// import { useTranslation } from 'react-i18next'
// import { connect } from 'react-redux'
// import { useLocation } from 'react-router-dom'
// import PropTypes from 'prop-types'
// import { createStructuredSelector } from 'reselect'
// import { Dialog } from '@material-ui/core'
// import { makeStyles } from '@material-ui/core/styles'

// import {
//   selectCurrentUser,
//   selectInstructor,
// } from '../../redux/user/user.selectors'
// import { getInstructorByIdStart } from '../../redux/user/user.actions'

// import AvailablePackages from './available-packages/available-packages.component'
// import CheckoutReceipt from './checkout-receipt/checkout-receipt.component'
// import CheckoutDiscount from './checkout-discount/checkout-discount.component'
// import PaymentMethod from './payment-method/payment-method.component'
// import CheckoutSuccessModal from '../../components/modals/checkout-success-modal/checkout-success-modal.component'
// import CheckoutDeclineModal from '../../components/modals/checkout-decline-modal/checkout-decline-modal.component'
// import RegisterModal from '../../components/modals/register-modal/register-modal.component'
// import LoginModal from '../../components/modals/login-modal/login-modal.component'
// import JoinCourseSuccessModal from '../../components/modals/join-course-success-modal/join-course-success-modal.component'

// import './index.styles.scss'
// const useStyles = makeStyles(() => ({
//   paperFullWidth: {
//     width: '100%',
//   },
//   paper: {
//     borderTop: '10px solid #3ac5f1',
//     margin: 0,
//   },
// }))
// const Checkout = ({ currentUser, getInstructorStartProp, instructor }) => {
//   const classes = useStyles()
//   const { t, i18n } = useTranslation()
//   const { search } = useLocation()
//   const isCourse = new URLSearchParams(search).get('course') === 'true'
//   const instructorId = new URLSearchParams(search).get('id')
//   const [tutorFields, setTutorFields] = useState([])
//   const [tutorPackages, setTutorPackages] = useState([])
//   const [checkoutReceiptData, setCheckoutReceiptData] = useState()
//   const [iframeUrl, setIframeUrl] = useState()
//   const [paymentMethodObj, setPaymentMethodObj] = useState()
//   const [selectedField, setSelectedField] = useState()
//   const [selectedPackage, setSelectedPackage] = useState()
//   const [privateSessionAmount, setPrivateSessionAmount] = useState()
//   const [promoCode, setPromoCode] = useState()
//   const [isFree, setIsFree] = useState(false)
//   const [openSuccessModal, setOpenSuccessModal] = useState(false)
//   const [openDeclineModal, setOpenDeclineModal] = useState(false)
//   const [openRegisterModal, setOpenRegisterModal] = useState(false)
//   const [openLoginModal, setOpenLoginModal] = useState(false)
//   const [openJoinSuccessModal, setOpenJoinSuccessModal] = useState(false)
//   const profile = {
//     id: 78320,
//     full_name: 'KIT  FEENEY ',
//     available: true,
//     online: false,
//     about:
//       "I'm a native English speaker from the US with two years experience teaching the English language. I've taught English to native and nonnative speakers in the US, Colombia, France, and Egypt and have taught both children and adults. I'm also a graduate of the American University of Paris where I studied English and French Linguistics as my minor. I'm here to help you improve your abilities in English conversation (speaking and listening) and literacy through focus on pronunciation, sentence structure, vocabulary, and grammar. ",
//     rate_to_display: 250.0,
//     number_of_reviews: 39,
//     average_rating: 5,
//     number_of_sessions: 315,
//     number_of_students: 27,
//     video: '3J9S-7hyfJw',
//     profile_picture_medium:
//       'https://s3-eu-west-1.amazonaws.com/tyro-app/tyro-app/users/imgs/78320/medium/data?1612967382',
//     bio: '',
//     instructor_fields: ['Conversation English', 'English ', 'Phonetics'],
//     fields: {
//       data: [
//         {
//           id: '34',
//           type: 'subjects',
//           name: 'English',
//           stage_id: 34,
//           normalized_name: 'English | Primary | Egyptian National Curriculum ',
//           price: 100,
//         },
//         {
//           id: '35',
//           type: 'subjects',
//           name: 'Math',
//           stage_id: 35,
//           normalized_name: 'Math | Primary | Saudi National Curriculum ',
//           price: 200,
//         },
//         {
//           id: '37',
//           type: 'subjects',
//           name: 'Science',
//           stage_id: 34,
//           normalized_name: 'Science | Primary | Egyptian National Curriculum ',
//           price: 300,
//         },
//         {
//           id: '1',
//           type: 'subjects',
//           name: 'Arabic',
//           stage_id: 1,
//           normalized_name: 'Arabic | High | Qatari National Curriculum ',
//           price: 400,
//         },
//         {
//           id: '38',
//           type: 'subjects',
//           name: 'English',
//           stage_id: 1,
//           normalized_name: 'English | High | Qatari National Curriculum ',
//           price: 500,
//         },
//       ],
//     },
//     tutor_fields_mapped: [
//       { id: 250, field: 'Conversation English' },
//       { id: 201, field: 'English' },
//       { id: 254, field: 'Phonetics' },
//     ],
//     tutor_reviews: [
//       {
//         id: 2678,
//         student: 'Khaledd Salahh',
//         rating: 5,
//         text: '',
//         created_at: '2021-08-09T20:02:33.000+02:00',
//       },
//       {
//         id: 2677,
//         student: 'Khaledd Salahh',
//         rating: 5,
//         text: '',
//         created_at: '2021-08-09T20:02:17.000+02:00',
//       },
//       {
//         id: 2676,
//         student: 'Khaledd Salahh',
//         rating: 5,
//         text: '',
//         created_at: '2021-08-09T20:02:17.000+02:00',
//       },
//       {
//         id: 2675,
//         student: 'Khaledd Salahh',
//         rating: 5,
//         text: '',
//         created_at: '2021-08-09T20:02:16.000+02:00',
//       },
//       {
//         id: 2674,
//         student: 'Khaledd Salahh',
//         rating: 5,
//         text: '',
//         created_at: '2021-08-09T19:17:20.000+02:00',
//       },
//     ],
//     free_trial: { enabled: true, claimed: false },
//     tutor_packages: [
//       {
//         id: 1512,
//         type: 'DefaultPackage',
//         minutes: 60,
//         time_in_hours: 1.0,
//         rate: 250.0,
//         offline_rate: 0.0,
//         tutor_user_id: 78320,
//         deleted_at: null,
//       },
//       {
//         id: 1513,
//         type: 'TrialPackage',
//         minutes: 30,
//         time_in_hours: 0.5,
//         rate: 0.0,
//         offline_rate: 0.0,
//         tutor_user_id: 78320,
//         deleted_at: null,
//       },
//       {
//         id: 1514,
//         type: 'NormalPackage',
//         minutes: 300,
//         time_in_hours: 5.0,
//         rate: 240.0,
//         offline_rate: 0.0,
//         tutor_user_id: 78320,
//         deleted_at: null,
//       },
//       {
//         id: 1515,
//         type: 'NormalPackage',
//         minutes: 600,
//         time_in_hours: 10.0,
//         rate: 230.0,
//         offline_rate: 0.0,
//         tutor_user_id: 78320,
//         deleted_at: null,
//       },
//       {
//         id: 1553,
//         type: 'NormalPackage',
//         minutes: 720,
//         time_in_hours: 12.0,
//         rate: 230.0,
//         offline_rate: 0.0,
//         tutor_user_id: 78320,
//         deleted_at: null,
//       },
//       {
//         id: 1558,
//         type: 'NormalPackage',
//         minutes: 1200,
//         time_in_hours: 20.0,
//         rate: 220.0,
//         offline_rate: 0.0,
//         tutor_user_id: 78320,
//         deleted_at: null,
//       },
//       {
//         id: 1565,
//         type: 'NormalPackage',
//         minutes: 1800,
//         time_in_hours: 30.0,
//         rate: 270.0,
//         offline_rate: 0.0,
//         tutor_user_id: 78320,
//         deleted_at: null,
//       },
//     ],
//   }
//   const course = {
//     id: 176,
//     name: 'General English Course (March)',
//     course_img:
//       'https://s3-eu-west-1.amazonaws.com/tyro-app/tyro-app/courses/imgs/176/original/1_jynaXA2u6CTEP0N5ZD6rXw.png?1616065555',
//     course_cover_img:
//       'https://s3-eu-west-1.amazonaws.com/tyro-app/tyro-app/courses/cover_imgs/176/original/overhead-people-studying.jpeg?1616065555',
//     course_video: '',
//     price: 1500,
//     content:
//       '\u003cp\u003e\u003cspan style="color: rgb(65, 65, 65); font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;"\u003e7 PM to 9 PM\u003c/span\u003e \u003c/p\u003e\u003cp data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;"\u003ePowered by \u003ca href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor"\u003eFroala Editor\u003c/a\u003e\u003c/p\u003e',
//     old_price: 3750,
//     description: '\u003cp dir="ltr" ',
//     language_level: 'A2',
//     course_type: 'group_course',
//     start_time: '2021-03-14T19:00:00.000+02:00',
//     end_time: '2021-03-14T21:00:00.000+02:00',
//     session_duration: 2,
//     course_duration: 36,
//     active: true,
//     number_of_students: 0,
//     tutor_id: 78233,
//     tutor_name: 'Abdullah Ramadan',
//     tutor_fields: ['Conversation English', 'English ', 'IELTS '],
//     tutor_reviews: 76,
//     tutor_average_rating: 5,
//     tutor_bio:
//       'Hello, my name is Mr. Abdullah Ramadan. \r\nI have been teaching English for more than 5 years for different levels, starting from the basics till the IELTS \u0026 TOEFL preparation .',
//     tutor_img:
//       'https://s3-eu-west-1.amazonaws.com/tyro-app/tyro-app/users/imgs/78233/thumb/data?1613562818',
//     tutor_rate: 160.0,
//     user_purchased_course: false,
//     time_slots: [],
//     course_reviews: [],
//   }
//   useEffect(() => {
//     getInstructorStartProp(instructorId)
//   }, [])

//   useEffect(() => {
//     if (instructor) {
//       if (isCourse) {
//         initCheckoutReceiptData()
//         initIframeUrl()
//       } else {
//         initCheckoutReceiptData()
//         initTutorPackages()
//         setTutorFields(profile && profile.fields ? profile.fields.data : [])
//       }
//     }
//   }, [instructor])

//   useEffect(() => {
//     initIframeUrl()
//   }, [selectedField, selectedPackage])

//   useEffect(() => {
//     setPaymentMethodObj({ auth: !!currentUser, iframeUrl })
//   }, [iframeUrl])

//   useEffect(() => {
//     const token =
//       'ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SndiV3RmYVhBaU9pSTFNaTR4T0M0eE9EUXVPVFFpTENKMWMyVnlYMmxrSWpvME9EQXNJbUpwYkd4cGJtZGZaR0YwWVNJNmV5Sm1hWEp6ZEY5dVlXMWxJam9pVkhseWIxUjFkRzl5SWl3aWJHRnpkRjl1WVcxbElqb2lWR1Z6ZEdsdVp5SXNJbk4wY21WbGRDSTZJblJsYzNRZ2MzUnlaV1YwSWl3aVluVnBiR1JwYm1jaU9pSXdNU0lzSW1ac2IyOXlJam9pTURFaUxDSmhjR0Z5ZEcxbGJuUWlPaUl3TVNJc0ltTnBkSGtpT2lKMFpYTjBJR05wZEhraUxDSnpkR0YwWlNJNklrNUJJaXdpWTI5MWJuUnllU0k2SWtWbmVYQjBJaXdpWlcxaGFXd2lPaUowWlhOMGFXNW5kSGx5YjBCbmJXRnBiQzVqYjIwaUxDSndhRzl1WlY5dWRXMWlaWElpT2lJck1ERXdNVGM1T0Rjd016TWlMQ0p3YjNOMFlXeGZZMjlrWlNJNklrNUJJaXdpWlhoMGNtRmZaR1Z6WTNKcGNIUnBiMjRpT2lKT1FTSjlMQ0poYlc5MWJuUmZZMlZ1ZEhNaU9qRTJNREF3TENKdmNtUmxjbDlwWkNJNk1UWXhOREV6T1RFc0lteHZZMnRmYjNKa1pYSmZkMmhsYmw5d1lXbGtJanBtWVd4elpTd2lhVzUwWldkeVlYUnBiMjVmYVdRaU9qVTJNQ3dpWTNWeWNtVnVZM2tpT2lKRlIxQWlMQ0psZUhBaU9qRTJNams1TlRZeE5qbDkueEV4RFBhZldKQUgwdkJDZ3lWZ244d0Z0Vl9wdXktZVJYV2pFRVR2N215aTZiZVRyWUlIRE9nZkxNemZ2cDJBTDhQcjFuTUVVaEpja1g0a1RPTVhYcXc='
//     setIframeUrl(prepareIframeUrl(token))
//   }, [i18n.language])

//   const initCheckoutReceiptData = () => {
//     if (isCourse && course) {
//       setCheckoutReceiptData({
//         courseName: course.name,
//         amount: course.price,
//         fields: course.tutor_fields,
//         subTotal: course.price,
//         discount: 0,
//         total: course.price,
//       })
//     } else {
//       setCheckoutReceiptData({
//         tutorName: instructor ? instructor.full_name : '',
//         tutorImg: profile ? profile.profile_picture_medium : '',
//         fields: profile && profile.fields ? profile.fields.data : [],
//       })
//     }
//   }

//   const initIframeUrl = (code = null) => {
//     if (currentUser) {
//       if (isCourse) {
//         const fundsPayload = prepareFundsPayload(null, code)
//         console.log({ fundsPayload1: fundsPayload })
//         const token = 'ZXlKaGJHY2lPaUp'
//         setIframeUrl(prepareIframeUrl(token))
//       } else {
//         const fundsPayload = prepareFundsPayload(
//           {
//             selectedField,
//             selectedPackage,
//           },
//           code,
//         )
//         console.log({ fundsPayload2: fundsPayload })

//         const token =
//           'ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SndiV3RmYVhBaU9pSTFNaTR4T0M0eE9EUXVPVFFpTENKMWMyVnlYMmxrSWpvME9EQXNJbUpwYkd4cGJtZGZaR0YwWVNJNmV5Sm1hWEp6ZEY5dVlXMWxJam9pVkhseWIxUjFkRzl5SWl3aWJHRnpkRjl1WVcxbElqb2lWR1Z6ZEdsdVp5SXNJbk4wY21WbGRDSTZJblJsYzNRZ2MzUnlaV1YwSWl3aVluVnBiR1JwYm1jaU9pSXdNU0lzSW1ac2IyOXlJam9pTURFaUxDSmhjR0Z5ZEcxbGJuUWlPaUl3TVNJc0ltTnBkSGtpT2lKMFpYTjBJR05wZEhraUxDSnpkR0YwWlNJNklrNUJJaXdpWTI5MWJuUnllU0k2SWtWbmVYQjBJaXdpWlcxaGFXd2lPaUowWlhOMGFXNW5kSGx5YjBCbmJXRnBiQzVqYjIwaUxDSndhRzl1WlY5dWRXMWlaWElpT2lJck1ERXdNVGM1T0Rjd016TWlMQ0p3YjNOMFlXeGZZMjlrWlNJNklrNUJJaXdpWlhoMGNtRmZaR1Z6WTNKcGNIUnBiMjRpT2lKT1FTSjlMQ0poYlc5MWJuUmZZMlZ1ZEhNaU9qRTJNREF3TENKdmNtUmxjbDlwWkNJNk1UWXhOREV6T1RFc0lteHZZMnRmYjNKa1pYSmZkMmhsYmw5d1lXbGtJanBtWVd4elpTd2lhVzUwWldkeVlYUnBiMjVmYVdRaU9qVTJNQ3dpWTNWeWNtVnVZM2tpT2lKRlIxQWlMQ0psZUhBaU9qRTJNams1TlRZeE5qbDkueEV4RFBhZldKQUgwdkJDZ3lWZ244d0Z0Vl9wdXktZVJYV2pFRVR2N215aTZiZVRyWUlIRE9nZkxNemZ2cDJBTDhQcjFuTUVVaEpja1g0a1RPTVhYcXc='

//         setIframeUrl(prepareIframeUrl(token))
//       }
//     } else {
//       setPaymentMethodObj({ auth: false, iframeUrl })
//     }
//   }

//   const prepareFundsPayload = (privateSessionData = null, code = null) => {
//     const paymentMethod = 'accept_payment'

//     const fundsPayload = {
//       email: currentUser.email,
//       payment_method: paymentMethod,
//       promo_code: '',
//     }

//     if (!privateSessionData) {
//       fundsPayload.amount = course.price.toString()
//       fundsPayload.course_id = course.id
//     } else {
//       fundsPayload.amount = privateSessionData.selectedPackage
//         ? (
//             privateSessionData.selectedPackage.rate *
//             privateSessionData.selectedPackage.time_in_hours
//           ).toString()
//         : '0'
//       fundsPayload.package_id = privateSessionData.selectedPackage
//         ? privateSessionData.selectedPackage.id
//         : null
//       fundsPayload.category_id = privateSessionData.selectedField
//         ? privateSessionData.selectedField.id
//         : null
//     }

//     if (code) {
//       fundsPayload.promo_code = code.code

//       const amountNum = parseInt(fundsPayload.amount, 10)
//       if (amountNum < code.valueNum) {
//         fundsPayload.amount = (0).toString()
//       } else {
//         fundsPayload.amount = (amountNum - code.valueNum).toString()
//       }
//     }

//     return fundsPayload
//   }

//   const prepareIframeUrl = (token = null) => {
//     let iframeToken = null
//     if (token) {
//       iframeToken = token
//     }

//     let iframeId
//     if (i18n.language === 'en') {
//       iframeId = process.env.REACT_APP_ACCEPT_PAYMENTS_IFRAME_ID_EN
//     } else {
//       iframeId = process.env.REACT_APP_ACCEPT_PAYMENTS_IFRAME_ID_AR
//     }

//     const iframePreparedUrl = `https://accept.paymobsolutions.com/api/acceptance/iframes/${iframeId}?payment_token=${iframeToken}`

//     return iframePreparedUrl
//   }

//   const initTutorPackages = () => {
//     // const defaultPackage = profile
//     //   ? profile.tutor_packages.find((el) => el.type === 'DefaultPackage')
//     //   : []

//     // const profilePackages = profile
//     //   ? profile.tutor_packages
//     //       .filter((el) => el.type !== 'TrialPackage')
//     //       .sort((a, b) => a.minutes - b.minutes)
//     //   : []

//     // const defaultPackageRate = defaultPackage ? defaultPackage.rate : 0

//     // const newProfilePackages = [...profilePackages]
//     // newProfilePackages.forEach((el) => {
//     //   if (el.type !== 'DefaultPackage' && el.type !== 'TrialPackage') {
//     //     const packageEl = el
//     //     const savings =
//     //       100 - Math.round(el ? el.rate : (0 / defaultPackageRate) * 100)
//     //     packageEl.savings = savings
//     //     return packageEl
//     //   }
//     //   return el
//     // })

//     setTutorPackages(
//       instructor && instructor.packages ? instructor.packages.data : [],
//     )
//   }
//   const updatePrivateSessionAmount = (data) => {
//     const total = data.package ? data.package.hours * data.field.price : 0

//     setSelectedField(data.field)
//     setSelectedPackage(data.package)

//     setCheckoutReceiptData((prevReceiptData) => ({
//       ...prevReceiptData,
//       subTotal: total,
//       discount: 0.0,
//       tutorField: data.field ? data.field.name : '',
//       total,
//     }))

//     setPrivateSessionAmount({
//       rate: data.field ? data.field.price : 0,
//       time_in_hours: data.package ? data.package.hours : 0,
//       amount: total,
//       field: data.field ? data.field.name : '',
//     })

//     initIframeUrl()
//   }
//   const checkPromoCode = (code) => {
//     const codeObj = {
//       id: 87,
//       campaign_name: 'free238',
//       start_date: '2021-08-23T14:32:00.000+02:00',
//       end_date: '2021-08-26T14:32:00.000+02:00',
//       value: '250',
//       created_at: '2021-08-23T14:32:48.000+02:00',
//       updated_at: '2021-08-23T14:32:48.000+02:00',
//       code: 'free238',
//       valueNum: parseInt('250', 10),
//     }
//     if (code === '123') {
//       setPromoCode(codeObj)
//       initIframeUrl(promoCode)

//       if (codeObj) {
//         let amountNum
//         if (isCourse) {
//           amountNum = checkoutReceiptData ? checkoutReceiptData.total : 0
//         } else {
//           amountNum = privateSessionAmount
//             ? privateSessionAmount.rate * privateSessionAmount.time_in_hours
//             : 0
//         }
//         if (amountNum <= codeObj.valueNum) {
//           setIsFree(true)
//         } else {
//           setIsFree(false)
//         }
//       }
//     } else if (code === '456') {
//       setPromoCode({ errors: 'Code has been already used' })
//       setIsFree(false)
//       initIframeUrl()
//     } else {
//       setPromoCode({ errors: 'The code is wrong' })
//       setIsFree(false)
//       initIframeUrl()
//     }
//   }

//   const handleCloseSuccessModal = (event, reason) => {
//     if (reason === 'backdropClick') {
//       return
//     }
//     setOpenSuccessModal(false)
//   }

//   const handleCloseDeclineModal = (event, reason) => {
//     if (reason === 'backdropClick') {
//       return
//     }
//     setOpenDeclineModal(false)
//   }

//   const triggerFreePurchase = () => {
//     setOpenSuccessModal(true)
//     // const promoCodeCode = promoCode ? promoCode.code : null
//     // if (isCourse) {
//     //   console.log('successfuly purchased course')
//     // } else {
//     //   console.log('successfuly purchased private session')
//     // }
//   }

//   const triggerOpenRegisterModal = () => {
//     setOpenRegisterModal(true)
//   }

//   const handleCloseRegisterModal = () => {
//     setOpenRegisterModal(false)
//   }

//   const triggerOpenLoginModal = () => {
//     setOpenLoginModal(true)
//   }

//   const handleCloseLoginModal = () => {
//     setOpenLoginModal(false)
//   }

//   const triggerJoinSuccessModal = () => {
//     setOpenJoinSuccessModal(true)
//   }

//   const handleCloseJoinSuccessModal = () => {
//     setOpenJoinSuccessModal(false)
//   }

//   return (
//     <div className="checkout">
//       <div className="container checkout-container">
//         <header className="checkout__header">
//           <h1 className="title">{t('CHECKOUT.TITLE')}</h1>
//           {isCourse ? (
//             <h4 className="sub-title">{t('CHECKOUT.SUBTITLE.COURSE')}!</h4>
//           ) : (
//             <h4 className="sub-title">{t('CHECKOUT.SUBTITLE.PRIVATE')}!</h4>
//           )}
//         </header>
//         {tutorPackages && tutorFields && tutorFields.length > 0 && (
//           <AvailablePackages
//             tutorPackages={tutorPackages}
//             tutorFields={tutorFields}
//             updatePrivateSessionAmount={updatePrivateSessionAmount}
//           />
//         )}
//         <div className="checkout__payment-details">
//           <p className="title">{t('CHECKOUT.PAYMENT_DETAILS.TITLE')}</p>
//           <div className="checkout__payment-details__container">
//             <div className="block">
//               <CheckoutDiscount
//                 promoCodeOut={checkPromoCode}
//                 promoCode={promoCode}
//                 loginModelOut={triggerOpenRegisterModal}
//               />
//               {paymentMethodObj && (
//                 <PaymentMethod
//                   paymentMethodObj={paymentMethodObj}
//                   isFree={isFree}
//                   totalPrice={
//                     checkoutReceiptData && checkoutReceiptData.total
//                       ? checkoutReceiptData.total
//                       : 0
//                   }
//                   freePurchaseOut={triggerFreePurchase}
//                   loginModelOut={triggerOpenRegisterModal}
//                 />
//               )}
//             </div>
//             <div className="block">
//               {checkoutReceiptData && (
//                 <CheckoutReceipt
//                   receiptData={checkoutReceiptData}
//                   privateSessionAmount={privateSessionAmount}
//                   promoCode={
//                     promoCode && promoCode.valueNum ? promoCode.valueNum : 0
//                   }
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//         {openSuccessModal && (
//           <Dialog
//             maxWidth="sm"
//             fullWidth
//             onClose={handleCloseSuccessModal}
//             aria-labelledby="success-dialog"
//             open={openSuccessModal}
//             classes={classes}
//             disableEscapeKeyDown
//           >
//             <CheckoutSuccessModal
//               onClose={handleCloseSuccessModal}
//               isCourse={isCourse}
//               checkoutReceiptData={checkoutReceiptData}
//             />
//           </Dialog>
//         )}
//         {openDeclineModal && (
//           <Dialog
//             maxWidth="sm"
//             fullWidth
//             onClose={handleCloseDeclineModal}
//             aria-labelledby="decline-dialog"
//             open={openDeclineModal}
//             classes={classes}
//             disableEscapeKeyDown
//           >
//             <CheckoutDeclineModal onClose={handleCloseDeclineModal} />
//           </Dialog>
//         )}
//         {openRegisterModal && (
//           <Dialog
//             maxWidth="sm"
//             fullWidth
//             onClose={handleCloseRegisterModal}
//             aria-labelledby="student-dialog"
//             open={openRegisterModal}
//             classes={classes}
//           >
//             <RegisterModal
//               onClose={handleCloseRegisterModal}
//               openLoginModal={triggerOpenLoginModal}
//               openJoinCourseModal={triggerJoinSuccessModal}
//               modalData={
//                 isCourse
//                   ? { fromCheckout: true, courseItem: course }
//                   : { fromCheckout: true }
//               }
//             />
//           </Dialog>
//         )}
//         {openLoginModal && (
//           <Dialog
//             maxWidth="sm"
//             fullWidth
//             onClose={handleCloseLoginModal}
//             aria-labelledby="student-dialog"
//             open={openLoginModal}
//             classes={classes}
//           >
//             <LoginModal
//               onClose={handleCloseLoginModal}
//               openRegisterModal={triggerOpenRegisterModal}
//               openJoinCourseModal={triggerJoinSuccessModal}
//               modalData={
//                 isCourse
//                   ? { fromCheckout: true, courseItem: course }
//                   : { fromCheckout: true }
//               }
//             />
//           </Dialog>
//         )}
//         {openJoinSuccessModal && (
//           <Dialog
//             maxWidth="sm"
//             fullWidth
//             onClose={handleCloseJoinSuccessModal}
//             aria-labelledby="success-dialog"
//             open={openJoinSuccessModal}
//             classes={classes}
//           >
//             <JoinCourseSuccessModal
//               onClose={handleCloseJoinSuccessModal}
//               courseName={course && course.name ? course.name : undefined}
//             />
//           </Dialog>
//         )}
//       </div>
//     </div>
//   )
// }

// Checkout.propTypes = {
//   currentUser: PropTypes.object,
//   getInstructorStartProp: PropTypes.func,
//   instructor: PropTypes.object,
// }

// const mapStateToProps = createStructuredSelector({
//   currentUser: selectCurrentUser,
//   instructor: selectInstructor,
// })

// const mapDispatchToProps = (dispatch) => ({
//   getInstructorStartProp: (instructorId) =>
//     dispatch(getInstructorByIdStart(instructorId)),
// })

// export default connect(mapStateToProps, mapDispatchToProps)(Checkout)

const Checkout = () => {
  return <div>Checkout</div>;
};

export default Checkout;
