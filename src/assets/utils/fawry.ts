// /* eslint-disable func-names */
// /* eslint-disable no-empty */
// /* eslint-disable no-restricted-globals */
// /* eslint-disable no-unused-vars */
// /* eslint-disable no-param-reassign */
// /* eslint-disable prefer-rest-params */
// /* eslint-disable prefer-destructuring */
// const serverAddress = 'https://www.atfawry.com'
// const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'
// const eventer = window[eventMethod]
// const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'
// let productsJSON = '{}'
// let redirectURL
// let localMerchantRefNum
// let signature

// // Listen to message from child window
// eventer(
//   messageEvent,
//   function (e) {
//     const key = e.message ? 'message' : 'data'
//     const data = e[key]
//     if (data === 'deleteFrame') deleteFrame()
//     else if (data === 'getData') sendMessage()
//     else if (data && data.func && data.func === 'paymentDoneCallbackFunction')
//       paymentDoneCallbackFunction(data)
//     else if (data && data.func && data.func === 'requestCanceldCallBack')
//       requestParentCanceldCallBack(data.merchantRefNum)
//     // run function//
//   },
//   false,
// )

// export function loadFawryPluginPopup(
//   merchant,
//   lang,
//   merchantRefNum,
//   jsonObj,
//   userName,
//   mobile,
//   email,
//   mode,
//   customerId,
//   orderDesc,
//   orderExpiry,
//   redirectToURL,
//   requestSignature,
//   invoiceCode,
// ) {
//   if (arguments.length === 13) {
//     redirectURL = arguments[11]
//     signature = arguments[12]
//   }
//   if (arguments.length === 12) {
//     if (
//       arguments[11].indexOf('http') === 0 ||
//       arguments[11].indexOf('www') === 0
//     )
//       redirectURL = arguments[11]
//     else signature = arguments[11]
//   }

//   localMerchantRefNum = merchantRefNum
//   userName = undefinedOrNullToEmpty(userName)
//   mobile = undefinedOrNullToEmpty(mobile)
//   email = undefinedOrNullToEmpty(email)
//   orderDesc = undefinedOrNullToEmpty(orderDesc)
//   orderExpiry = undefinedOrNullToEmpty(orderExpiry)
//   customerId = undefinedOrNullToEmpty(customerId)
//   invoiceCode = undefinedOrNullToEmpty(invoiceCode)
//   productsJSON = jsonObj
//   const div = document.createElement('div')
//   div.innerHTML = `<iframe id="fawryPluginFrame" src="${serverAddress}/ECommercePlugin/plugin.jsp?lang=${lang}&merchant=${merchant}&merchantRefNum=${merchantRefNum}&userName=${userName}&mobile=${mobile}&email=${email}&customerId=${customerId}&orderDesc=${orderDesc}&orderExpiry=${orderExpiry}&signature=${signature}&invoiceCode=${invoiceCode}" style="background-color:rgb(245,245,245);position: fixed; width: 100%;height: 100%;top: 0%;left: 0%;z-index: 999999;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#b2000000, endColorstr=#b2000000);-ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#b2000000, endColorstr=#b2000000)";" allowtransparency="false"  />`
//   document.body.appendChild(div.childNodes[0])
// }

// function loadFawryPluginPopupMultiMerchants(
//   merchant,
//   lang,
//   merchantRefNum,
//   jsonObj,
//   orderExpiry,
//   serverURL,
//   orderCreationDate,
//   promoCode,
//   promoCodeDiscount,
//   userName,
//   mobile,
//   email,
//   mode,
//   customerId,
//   orderDesc,
// ) {
//   userName = undefinedOrNullToEmpty(userName)
//   mobile = undefinedOrNullToEmpty(mobile)
//   email = undefinedOrNullToEmpty(email)
//   orderDesc = undefinedOrNullToEmpty(orderDesc)
//   orderExpiry = undefinedOrNullToEmpty(orderExpiry)
//   promoCodeDiscount = undefinedOrNullToEmpty(promoCodeDiscount)
//   promoCode = undefinedOrNullToEmpty(promoCode)
//   // customer identifier at the merchant side
//   customerId = undefinedOrNullToEmpty(customerId)
//   productsJSON = jsonObj
//   const div = document.createElement('div')
//   div.innerHTML = `<iframe id="fawryPluginFrame" src="${serverURL}/ECommercePlugin/plugin.jsp?lang=${lang}&merchant=${merchant}&merchantRefNum=${merchantRefNum}&userName=${userName}&mobile=${mobile}&email=${email}&customerId=${customerId}&orderDesc=${orderDesc}&orderExpiry=${orderExpiry}&orderCreationDate=${orderCreationDate}&promoCode=${promoCode}&promoCodeDiscount=${promoCodeDiscount}" style="background-color:rgb(245,245,245);position: fixed; width: 100%;height: 100%;top: 0%;left: 0%;z-index: 999999;filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#b2000000, endColorstr=#b2000000);-ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#b2000000, endColorstr=#b2000000)";" allowtransparency="false"  />`
//   document.body.appendChild(div.childNodes[0])
// }

// function undefinedOrNullToEmpty(value) {
//   if (typeof value === 'number') return value
//   // eslint-disable-next-line no-else-return
//   else if (
//     typeof value === 'undefined' ||
//     value === null ||
//     value.toUpperCase() === 'null'.toUpperCase()
//   ) {
//     return ''
//   }
//   return value
// }

// function loadFawryPluginSingleItem(
//   merchant,
//   locale,
//   merchantRefNum,
//   amount,
//   description,
//   productSKU,
// ) {
//   const products = []
//   const product = {}
//   product.itemId = 1
//   product.productSKU = productSKU
//   product.description = description
//   product.price = amount
//   product.quantity = 1
//   products.push(product)
//   const jsonObj = JSON.stringify(products)
//   loadFawryPluginPopup(
//     merchant,
//     locale,
//     merchantRefNum,
//     jsonObj,
//     null,
//     null,
//     null,
//     null,
//     null,
//   )
// }

// function deleteFrame() {
//   const frame = document.getElementById('fawryPluginFrame')
//   if (frame) {
//     frame.remove()
//   }
// }

// function sendMessage() {
//   const iframe = document.getElementById('fawryPluginFrame')
//   iframe.contentWindow.postMessage(productsJSON, '*')
// }

// function requestParentCanceldCallBack(data) {
//   try {
//     if (redirectURL != null && redirectURL !== 'null') {
//       redirectURL = `${redirectURL}?merchantRefNum=${localMerchantRefNum}&failedOrCanceled=true`
//       window.location.href = redirectURL
//     } else parent.requestCanceldCallBack(data)
//   } catch (e) {}
// }
// function paymentDoneCallbackFunction(data) {
//   if (redirectURL != null && redirectURL !== 'null') {
//     redirectURL = `${redirectURL}?merchantRefNum=${localMerchantRefNum}&fawryRefNo=${data.billUploadBillAccNum}`
//     window.location.href = redirectURL
//   } else
//     parent.fawryCallbackFunction(
//       data.paid,
//       data.billUploadBillAccNum,
//       data.paymentAuthId,
//       data.merchantRefNum,
//       data.messageSignature,
//     )
// }

export {};
