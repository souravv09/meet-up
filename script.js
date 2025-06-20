const userSessionId = "session-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
let lastSupabaseRowId = null; // Global var to store last inserted row ID for plan a meet column
let popupAutoCloseTimeout = null;

// To Log User Activity
async function logUserActivity(eventName, details = "") {
  try {
    const indiaDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const { data, error } = await supabaseClient
      .from("user_activity_logs") // Make sure this table exists!
      .insert([
        {
          event_name: eventName,
          event_details: details,
          created_at_ist: indiaDate,
          user_session_id: userSessionId
        },
      ]);

    if (error) {
      console.error("❌ Activity Log (Supabase) error:", error);
    } else {
      console.log(`📋 Logging → ${eventName} - ${details}`);
    }
  } catch (err) {
    console.error("❌ Activity Log error:", err);
  }
}

// Logs typing value for the text area in a separate table
function logTypingActivity(fieldName, value) {
  const indiaDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  supabaseClient
    .from("typing_logs")
    .insert([
      {
        created_at_ist: indiaDate,
        field_name: fieldName,
        typed_value: value
      },
    ])
    .then(({ error }) => {
      if (error) {
        console.error("❌ Typing log error:", error);
      } else {
        console.log(`📋 Typing Log → ${fieldName}: ${value}`);
      }
    });
}

window.addEventListener("load", () => {
  logUserActivity("Page Load", "Refreshes the page");
});

window.addEventListener("popstate", () => {
  logUserActivity("Page Navigation", "Browser Back/Forward Navigation");
});

// Supabase config
const supabaseUrl = "https://wtkkhynqfkyatlpqyqiv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0a2toeW5xZmt5YXRscHF5cWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MDE0MTcsImV4cCI6MjA2NDk3NzQxN30.GaFIuu4HDc45WQkclET-w32qew1M0wQ7XxKBlWphQKg";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Save to Supabase
async function saveToSupabase(dataObject) {
  const indiaDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  dataObject.created_at_ist = indiaDate;

  const { data, error } = await supabaseClient
    .from("form_submissions")
    .insert([dataObject]);

  if (error) {
    console.error("❌ Supabase error:", error);
    showErrorAndReload();
  } else {
    console.log("✅ Supabase success:", data);
  }
}

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBKb2TcFAR4BPJtb2K934hixjXh0NHQdA8",
  authDomain: "meet-up-page-4d80d.firebaseapp.com",
  projectId: "meet-up-page-4d80d",
  storageBucket: "meet-up-page-4d80d.firebasestorage.app",
  messagingSenderId: "1054752022608",
  appId: "1:1054752022608:web:d66039cac2ffaa2c327155",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Show error + reload
function showErrorAndReload() {
  const popup = document.getElementById("popupOverlay");
  const popupContent = document.getElementById("popupContent");
  popupContent.innerHTML = "error! please fill again";
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
    // location.reload();
  }, 2000);
}

// Save to Firestore
function saveToFirestore(subject, dataObject) {
  dataObject.subject = subject;
  dataObject.timestamp = firebase.firestore.FieldValue.serverTimestamp();

  db.collection("meetup_submissions")
    .add(dataObject)
    .then(() => {
      console.log("✅ Firestore success");
    })
    .catch((error) => {
      console.error("❌ Firestore error:", error);
      showErrorAndReload();
    });
}

// Send Web3Forms
function sendWeb3Form(subject, message, wrapperElement, buttonHtml) {
  wrapperElement.innerHTML = `
        <div style="
            font-family: 'Kalam';
            font-size: 16px;
            color: #c0392b;
            margin-top: 8px;
        ">
            Sending...
        </div>
    `;

  return fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      access_key: "4873dfa8-0161-485c-9fa5-a58f5ca6777c",
      subject: subject,
      message: message
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        wrapperElement.innerHTML = `
                <div style="
                    font-family: 'Kalam';
                    font-size: 16px;
                    color: #c0392b;
                    margin-top: 8px;
                ">
                    Done!
                </div>
            `;
      } else {
        console.error("❌ Web3Forms failed:", data);
        wrapperElement.innerHTML = ""; // suppress user error
      }
      return data;
    })
    .catch((error) => {
      console.error("❌ Web3Forms error:", error);
      wrapperElement.innerHTML = ""; // suppress user error
    });
}

// Added animation for the screenshot message
function showScreenshotSavedMessage() {
  const msg = document.getElementById("screenshotSavedMessage");
  msg.style.display = "block";
  setTimeout(() => {
    msg.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    msg.style.opacity = "0.8";
  }, 1500);

  setTimeout(() => {
    msg.style.opacity = "0.5";
  }, 2500);

  setTimeout(() => {
    msg.style.opacity = "0.3";
  }, 4000);

  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => {
      msg.style.display = "none";
    }, 800);
  }, 5000);
}

// Added animation for the screenshot message
function showAndThisTooMessage(message = "and this too!!") {
  const msg = document.getElementById("andThisTooMessage");
  msg.textContent = message;
  msg.style.display = "block";
  setTimeout(() => {
    msg.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    msg.style.opacity = "0.8";
  }, 1500);

  setTimeout(() => {
    msg.style.opacity = "0.5";
  }, 2500);

  setTimeout(() => {
    msg.style.opacity = "0.3";
  }, 4000);

  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => {
      msg.style.display = "none";
    }, 800);
  }, 5000);
}

function handleFieldEnableFlow() {
  const date = document.getElementById("datePicker").value;
  const country = document.getElementById("countrySelect").value;
  const state = document.getElementById("stateSelect").value;
  const city = document.getElementById("cityInput").value.trim();
  const submitBtn = document.getElementById("submitBtn");

  if (date) {
    document.getElementById("kahanHeading").classList.remove("disabled");
    document.getElementById("countryInline").classList.remove("disabled");
  } else {
    document.getElementById("kahanHeading").classList.add("disabled");
    document.getElementById("countryInline").classList.add("disabled");
    document.getElementById("stateInline").classList.add("disabled");
    document.getElementById("cityInline").classList.add("disabled");
    document.getElementById("buttonWrapper").classList.remove("show");
    submitBtn.innerText = "save";
  }

  if (state) {
    document.getElementById("cityInline").classList.remove("disabled");
  } else {
    document.getElementById("cityInline").classList.add("disabled");
    document.getElementById("buttonWrapper").classList.remove("show");
    submitBtn.innerText = "save";
  }

  if (city && city.length > 0 && country === "India" && state && date) {
    const buttonWrapper = document.getElementById("buttonWrapper");
    if (!buttonWrapper.classList.contains("show")) {
      buttonWrapper.classList.add("show");
      submitBtn.classList.add("shake");
      setTimeout(() => {
        submitBtn.classList.remove("shake");
      }, 600);
    }
    submitBtn.innerText = "Let's Plan & Meet";
  } else {
    document.getElementById("buttonWrapper").classList.remove("show");
    submitBtn.innerText = "save";
  }
}

function handleDateChange() {
  handleFieldEnableFlow();
  const dateValue = document.getElementById("datePicker").value;
  const formattedDiv = document.getElementById("formattedDate");

  if (dateValue) {
    const dateObj = new Date(dateValue);
    const day = dateObj.getDate();
    const daySuffix = getDaySuffix(day);
    const formattedDate = `${dateObj.toLocaleString("default", { month: "long",})} ${day}${daySuffix}, ${dateObj.getFullYear()}`;
    formattedDiv.innerText = formattedDate;
    logUserActivity("Date Selection", `${formattedDate}`);
  } else {
    formattedDiv.innerText = "";
  }
}

function getDaySuffix(day) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// Store original India state options on page load:
const originalIndiaStatesHTML = document.getElementById("stateSelect").innerHTML;

function handleCountryChange() {
  const indiaDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const date = document.getElementById("formattedDate").innerText;
  const country = document.getElementById("countrySelect").value;

  const stateLabel = document.getElementById("stateLabel");
  const stateSelect = document.getElementById("stateSelect");
  const state = document.getElementById("stateSelect").value;

  if (country === "India") {
    document.getElementById("stateInline").classList.remove("disabled");
    stateLabel.innerText = "Choose a State:";
    stateSelect.innerHTML = originalIndiaStatesHTML;

    // Reset values
    document.getElementById("stateSelect").value = "";
    document.getElementById("cityInput").value = "";

    // Enable state field
    document.getElementById("stateInline").classList.remove("disabled");

    // Disable city field
    document.getElementById("cityInline").classList.add("disabled");

    // Hide button and reset text
    document.getElementById("buttonWrapper").classList.remove("show");
  } 
    else if (country === "Greece") {
    document.getElementById("stateInline").classList.remove("disabled");
    stateLabel.innerText = "Choose a Region:";

    // Replace options → Greece regions
    const greeceTemplate = document.getElementById("greeceRegionsTemplate").innerHTML;
    stateSelect.innerHTML = greeceTemplate;

    // Reset values
    document.getElementById("stateSelect").value = "";
    document.getElementById("cityInput").value = "";

    // Enable state field
    document.getElementById("stateInline").classList.remove("disabled");

    // Disable city field
    document.getElementById("cityInline").classList.add("disabled");

    // Hide button and reset text
    document.getElementById("buttonWrapper").classList.remove("show");
  } 
    else if (country === "Other") {
    const popupMessage =
      "lekin humare pas toh passport nahin hai, sorry madam... <br> but this option will be available soon :)";

    logUserActivity("Country Selected", "Other");
    logUserActivity("Other Popup", "Passport Issue Popup");

    showPopup(popupMessage, false, true, "Passport Issue Popup");
    const dataToSave = {
      question: "Doctor Sahiba! milna hai ?",
      option: "Haanji",
      date: date,
      country: country,
      popup_message: popupMessage,
      created_at_ist: indiaDate
    };

    saveToFirestore("Other Country Selection", dataToSave);
    saveToSupabase({
      question: "Doctor Sahiba! milna hai ?",
      option: "Haanji",
      date: date,
      country: country,
      popup_message: popupMessage,
      created_at_ist: indiaDate
    });
    // Prepare Mail message
    const fullMessage = `
      Submitted at : ${indiaDate}

      Q: Doctor Sahiba! milna hai ?
      A: Haanji

      Kab milna hai...
        Date Picked: ${date}

      Kahan milna hai...
        Country selected: ${country}
        Message: ${popupMessage}

    `;

    const dummyWrapper = document.getElementById("dummyWrapper");

    // Sending Mail
    sendWeb3Form("Other Country Selection", fullMessage, dummyWrapper, "");

    document.getElementById("countrySelect").value = "";
    document.getElementById("stateSelect").value = "";
    document.getElementById("cityInput").value = "";
    document.getElementById("stateInline").classList.add("disabled");
    document.getElementById("cityInline").classList.add("disabled");
    document.getElementById("buttonWrapper").classList.remove("show");
    document.getElementById("submitBtn").innerText = "save";
    return;
  } 
    else {
    document.getElementById("stateInline").classList.add("disabled");
    document.getElementById("cityInline").classList.add("disabled");
    document.getElementById("buttonWrapper").classList.remove("show");
    document.getElementById("submitBtn").innerText = "save";
  }
  logUserActivity("Country Selected", country);
  handleFieldEnableFlow();
}

document.getElementById("stateSelect").addEventListener("mousedown", function () {
    const country = document.getElementById("countrySelect").value;

    if (country === "Greece") {
      logUserActivity("Region Field", "Clicked on Region Field");
    } else if (country === "India") {
      logUserActivity("State Field", "Clicked on State Field");
    } else {
      logUserActivity("State/Region Field", "Clicked with no country selected");
    }
});

function handleStateChange() {
  const state = document.getElementById("stateSelect").value;
  const country = document.getElementById("countrySelect").value;
  // Log based on country selection
  if (country === "Greece") {
    logUserActivity("Region Selected", state);
  } else if (country === "India") {
    logUserActivity("State Selected", state);
  } else {
    logUserActivity("State/Region Selected", state);
  }

  if (state) {
    document.getElementById("cityInline").classList.remove("disabled");
    document.getElementById("cityInput").value = "";
  } else {
    document.getElementById("cityInline").classList.add("disabled");
    document.getElementById("buttonWrapper").classList.remove("show");
    document.getElementById("submitBtn").innerText = "save";
  }
  //Special case: if Greece → Santorini selected → trigger popup flow
  if (country === "Greece" && state === "Santorini") {
    logUserActivity("Greece Popup", "Santorini stages popup");
    showSpecialSantoriniPopupFlow();
  }

  handleFieldEnableFlow();
}

function showSpecialSantoriniPopupFlow() {
  const popup = document.getElementById("specialPopupOverlay");
  const popupContentInner = document.querySelector("#specialPopupContent .popup-inner-content");

  // First popup content:
  popupContentInner.innerHTML = `
        <div class="popup-text">
          madam ji, itni dur chalna hai ? humara waisa bonding hoga tab toh chalenge na.. <br>
          baatein karti nahi, baatein se jyada toh ignore karti ~ baatein karogi (tum, hume toh bas sunna aata) about your day, about you, or anything... <br>
          milna wagera hoga, bonding hoga <3 tumhare ghar pe permission v toh lena hoga, hume - fir plan karenge :*
        </div>
          <br>
        <button id="specialNextButton" class="translucent-button" onclick="handleSpecialSantoriniNext()">
        next</button>
    `;

  popup.classList.add("show");

  popup.onclick = function (event) {
    if (event.target === popup) {
      event.stopPropagation();
    }
  };
}

function handleSpecialSantoriniNext() {
  logUserActivity("Button Click", "Clicked Next on Santorini popup");
  logUserActivity("Greece Popup", "Santorini Next popup");

  const popup = document.getElementById("specialPopupOverlay");
  
  const nextButton = document.getElementById("specialNextButton");

  // Hide the button
  if (nextButton) nextButton.style.display = "none";

  // Triggering image download
  const imageUrl = "image9.jpeg";
  const timestamp = new Date().getTime();
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = `greece__${timestamp}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  logUserActivity("Screenshot Download", "Santorini Details Screenshot Downloaded");
  showAndThisTooMessage("saved the image, so you can follow these steps ;)");

  //PREPARE DATA TO SAVE
  const date = document.getElementById("formattedDate").innerText;
  const country = document.getElementById("countrySelect").value;
  const region = document.getElementById("stateSelect").value;

  const indiaDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const dataToSave = {
    question: "Doctor Sahiba! milna hai ?",
    option: "Haanji",
    date: date,
    country: country,
    region: region,
    santorini_popup_viewed: "YES",
    created_at_ist: indiaDate
  };

  //Save to Firestore
  saveToFirestore("Santorini Region Selection", dataToSave);

  //Save to Supabase
  saveToSupabase({
    question: "Doctor Sahiba! milna hai ?",
    option: "Haanji",
    date: date,
    country: country,
    region: region,
    santorini_popup_viewed: "YES",
    created_at_ist: indiaDate
  });

  //Prepare Mail message
  const fullMessage = `
    Submitted at : ${indiaDate}

    Q: Doctor Sahiba! milna hai ?
    A: Haanji

    Kab milna hai...
      Date Picked: ${date}

    Kahan milna hai...
      Country selected: ${country}
      Region selected: ${region}

    Santorini Popup Viewed: YES
  `;

  const dummyWrapper = document.getElementById("dummyWrapper");

  //Sending Mail
  sendWeb3Form("Santorini Region Selection", fullMessage, dummyWrapper, "");

  //Show second popup content AFTER sending
  const popupContentInner = document.querySelector("#specialPopupContent .popup-inner-content");

  popupContentInner.innerHTML = `
        <div class="popup-text">waise ye plans toh baad mein hote rahenge, avi milte hain na..</div>
    `;
  const popupContent = document.getElementById("specialPopupContent");
  popupContent.classList.add("popup-expanded");

  //Allow closing by clicking outside
  popup.onclick = function (event) {
    if (event.target === popup) {
      closeSpecialSantoriniPopup("Closed Manually");
    }
  };

  //Auto close after 10 sec
  popupAutoCloseTimeout = setTimeout(() => {
    closeSpecialSantoriniPopup("Auto Closes");
  }, 6000);
}

function closeSpecialSantoriniPopup(closeType = "Auto Closes") {
  logUserActivity("Popup Closed", "Santorini Popup " + closeType);

  //Cancel auto-closes time if it exists
  if (popupAutoCloseTimeout) {
    clearTimeout(popupAutoCloseTimeout);
    popupAutoCloseTimeout = null;
  }

  const popup = document.getElementById("specialPopupOverlay");
  const popupContent = document.getElementById("specialPopupContent");
  popup.classList.remove("show");
  popupContent.classList.remove("popup-expanded");

  // Reset country field and dependent fields:
  document.getElementById("countrySelect").value = "";
  document.getElementById("stateSelect").value = "";
  document.getElementById("cityInput").value = "";

  document.getElementById("stateInline").classList.add("disabled");
  document.getElementById("cityInline").classList.add("disabled");
  document.getElementById("buttonWrapper").classList.remove("show");
  document.getElementById("submitBtn").innerText = "save";
}

function handleYes() {
  logUserActivity("Selected Yes", "Clicked YES on Question 1");

  document.getElementById("yesFields").classList.add("show");
  document.getElementById("question2Block").classList.remove("show");
  document.getElementById("datePicker").value = "";
  document.getElementById("formattedDate").innerText = "";
  document.getElementById("countrySelect").value = "";
  document.getElementById("stateSelect").value = "";
  document.getElementById("cityInput").value = "";
  document.getElementById("kahanHeading").classList.add("disabled");
  document.getElementById("countryInline").classList.add("disabled");
  document.getElementById("stateInline").classList.add("disabled");
  document.getElementById("cityInline").classList.add("disabled");
  document.getElementById("buttonWrapper").classList.remove("show");
  document.getElementById("submitBtn").innerText = "save";

  const pakkaRadios = document.getElementsByName("pakka");
  pakkaRadios.forEach((radio) => (radio.checked = false));
  document.getElementById("pakkaReasonField").classList.remove("show");
  document.getElementById("pakkaReasonInput").value = "";

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const dd = String(tomorrow.getDate()).padStart(2, "0");
  document.getElementById("datePicker").min = `${yyyy}-${mm}-${dd}`;
}

function handleNo() {
  logUserActivity("Selected NO", "Clicked NO on Question 1");
  document.getElementById("yesFields").classList.remove("show");
  document.getElementById("question2Block").classList.add("show");
  document.getElementById("buttonWrapper").classList.remove("show");
  document.getElementById("submitBtn").innerText = "save";

  const pakkaRadios = document.getElementsByName("pakka");
  pakkaRadios.forEach((radio) => (radio.checked = false));
  document.getElementById("pakkaReasonField").classList.remove("show");
  document.getElementById("pakkaReasonInput").value = "";
}

function handlePakka() {
  const indiaDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const pakkaRadios = document.getElementsByName("pakka");
  let isYes = false;
  let isNo = false;

  pakkaRadios.forEach((radio) => {
    if (radio.checked) {
      if (radio.value === "yes") isYes = true;
      else if (radio.value === "no") isNo = true;
    }
  });

  if (isYes) {
    document.getElementById("pakkaReasonField").classList.add("show");
    document.getElementById("buttonWrapper").classList.add("show");

    logUserActivity("Selected YES", "Clicked YES on Question 2");
  } else {
    document.getElementById("pakkaReasonField").classList.remove("show");
    document.getElementById("pakkaReasonInput").value = "";
    document.getElementById("buttonWrapper").classList.remove("show");

    logUserActivity("Selected NO", "Clicked NO on Question 2");
  }

  const proceedRadios = document.getElementsByName("proceed");
  let isProceedNo = false;
  proceedRadios.forEach((radio) => {
    if (radio.checked && radio.value === "no") isProceedNo = true;
  });

  if (isProceedNo && isNo) {
    const popupMessage = "sukriya! for considering humara request, take your time - lekin not much, firse plan karte hain";

    //Now show popup
    showPopup(popupMessage, true);

    logUserActivity("Reconsidering Popup", "Meeting Request Reconsidered");

    const fullMessage = `
      Submitted at : ${indiaDate}

      Q: Doctor Sahiba! milna hai ?
      A: Haanji

      Q: Declined, finally ?
      A: Nah!

      Popup message: ${popupMessage}
    `;

    const dummyWrapper = document.getElementById("dummyWrapper");

    const dataToSave = {
      question: "Doctor Sahiba! milna hai ?",
      option: "Haanji",
      sub_question: "Declined, finally ?",
      sub_option: "Nah!",
      popup_message: popupMessage,
      created_at_ist: indiaDate
    };

    // Disable Pakka and Proceed radios
    document.querySelectorAll('input[name="pakka"]').forEach((radio) => {
      radio.disabled = true;
    });
    document.querySelectorAll('input[name="proceed"]').forEach((radio) => {
      radio.disabled = true;
    });

    // Show Sending... in bottom right
    document.getElementById("pakkaSendingStatus").innerText = "Sending...";
    document.getElementById("pakkaSendingStatus").style.display = "block";

    saveToFirestore("Request Reconsidered Update", dataToSave);

    saveToSupabase({
      question: "Doctor Sahiba! milna hai ?",
      option: "Hanji",
      sub_question: "Declined, finally ?",
      sub_option: "Nah!",
      popup_message: popupMessage,
      created_at_ist: indiaDate
    });

    sendWeb3Form("Request Reconsidered Update", fullMessage, dummyWrapper, "").then(() => {
        // Re-enable radios
        document.querySelectorAll('input[name="pakka"]').forEach((radio) => {
          radio.disabled = false;
        });
        document.querySelectorAll('input[name="proceed"]').forEach((radio) => {
          radio.disabled = false;
        });

        // Hide Sending...
        document.getElementById("pakkaSendingStatus").style.display = "none";
      }
    );
  }
}

function showPopup(message, autoSwitchToYes = false, noReload = false, popupLabel = "Reconsidering Popup") {
  const popup = document.getElementById("popupOverlay");
  const popupContent = document.getElementById("popupContent");
  popupContent.innerHTML = message;
  popup.classList.add("show");

  let autoCloseTimer = null;
  let alreadyClosed = false;

  const closeHandler = (closeType = "Closed Manually") => {
    if (alreadyClosed) return; //prevent multiple calls
    alreadyClosed = true;

    popup.classList.remove("show");
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    popup.onclick = null;

    logUserActivity("Popup Closed", popupLabel + ` ${closeType}`);

    if (autoSwitchToYes) {
      const proceedRadios = document.getElementsByName("proceed");
      proceedRadios.forEach((radio) => {
        if (radio.value === "yes") {
          radio.checked = true;
        } else {
          radio.checked = false;
        }
      });
      handleYes();
    } else if (!noReload) {
      // Only reload if noReload is false
      setTimeout(() => {
        location.reload();
      }, 500);
    }
  };

  popup.onclick = () => closeHandler("Closed Manually");

  autoCloseTimer = setTimeout(() => {
    closeHandler("Auto Closes");
  }, 5000);
}

async function handleSubmit() {
  const proceedRadios = document.getElementsByName("proceed");
  const pakkaRadios = document.getElementsByName("pakka");

  let proceedValue = "";
  let pakkaValue = "";

  proceedRadios.forEach((radio) => {
    if (radio.checked) {
      proceedValue = radio.value;
    }
  });

  pakkaRadios.forEach((radio) => {
    if (radio.checked) {
      pakkaValue = radio.value;
    }
  });

  const indiaDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  if (proceedValue === "yes") {
    const submitBtn = document.getElementById("submitBtn");

    if (submitBtn.innerText === "Let's Plan & Meet") {
      logUserActivity("Button Click", "Clicked on button @ Let's Plan & Meet");

      const date = document.getElementById("formattedDate").innerText;
      const country = document.getElementById("countrySelect").value;
      const state = document.getElementById("stateSelect").value;
      const city = document.getElementById("cityInput").value.trim();

      // Save to Firestore
      const dataToSave = {
        question: "Doctor Sahiba! milna hai ?",
        option: "Haanji",
        date: date,
        country: country,
        state: state,
        city: city,
        created_at_ist: indiaDate
      };

      // Disable button
      submitBtn.disabled = true;
      submitBtn.innerText = "Planning...";

      saveToFirestore("Plan & Meet Submission", dataToSave);

      // Save to Supabase → insert first, get row ID
      const { data, error } = await supabaseClient
        .from("form_submissions")
        .insert([
          {
            question: "Doctor Sahiba! milna hai ?",
            option: "Haanji",
            date: date,
            country: country,
            state: state,
            city: city,
            message: "", // initially empty
            created_at_ist: indiaDate
          },
        ])
        .select("id");

      if (error) {
        console.error("❌ Supabase error:", error);
        showErrorPopupAndReload();
        return;
      }

      if (data && data.length > 0) {
        lastSupabaseRowId = data[0].id;
        console.log("✅ Supabase row created, ID:", lastSupabaseRowId);
      }

      const fullMessage = `
      Submitted at : ${indiaDate}

      Q: Doctor Sahiba! milna hai ?
      A: Haanji

      Kab milna hai...
        Date Picked: ${date}

      Kahan milna hai...
        Country selected: ${country}
        State selected: ${state}
        City: ${city}
      `;

      const dummyWrapper = document.getElementById("dummyWrapper");

      // Build tempDiv
      const tempDiv = document.createElement("div");
      tempDiv.className = "plan-date-screenshot-box";

      tempDiv.innerHTML = `
                <div class="heading">Plannings; Milte Hain! </div>
                <hr class="underline">
                <div class="text-content">
  Q: <strong>Doctor Sahiba! milegi na ?</strong><br>
  A: <strong>Haanji</strong><br><br>
      <strong>Kab milna hai...</strong><br>
  Date Picked:  <strong>${date}</strong><br><br>
      <strong>Kahan milna hai...</strong><br>
  Country ?  <strong>${country}</strong></strong><br>
  State   ?  <strong>${state}</strong><br>
  City    ?   <strong>${city}</strong><br><br>
  <hr class="underline">
  <div class="bottom-text">Now don't change the plan</div>
                </div>
            `;

      document.body.appendChild(tempDiv);

      html2canvas(tempDiv).then((canvas) => {
        const link = document.createElement("a");
        const timestamp = new Date().getTime();
        link.href = canvas.toDataURL("image/png");
        link.download = `plan-a-meet-${timestamp}.png`;
        link.click();
        logUserActivity("Screenshot Download", "Plan-a-date screenshot downloaded");

        // Cleanup
        document.body.removeChild(tempDiv);

        // Send mail
        sendWeb3Form("Plan & Meet Submission", fullMessage, dummyWrapper, "")
        .then(() => {
          submitBtn.disabled = false;
          submitBtn.innerText = "Let's Plan & Meet";
        });

        // Show popup
        showMeetupPopup();

        // After popup → show confirmation
        setTimeout(() => {
          showScreenshotSavedMessage();
        }, 600);
      });
    } else {
      showMeetupPopup();
    }
  } else if (proceedValue === "no" && pakkaValue === "yes") {
    logUserActivity("Button Click", "Clicked on Submit @ Optional Reason");
    showWhatsappOnlyPopup();

    let pakkaReason = document.getElementById("pakkaReasonInput").value.trim();
    if (pakkaReason.length === 0) pakkaReason = "empty";

    const fullMessage = `
      Submitted at : ${indiaDate}

      Q: Doctor Sahiba! milna hai ?
      A: NO
      
      Q: Declined, finally ?
      A: YES
      Reason: ${pakkaReason}
    `;

    const dummyWrapper = document.getElementById("dummyWrapper");

    const dataToSave = {
      question: "Doctor Sahiba! milna hai ?",
      option: "NO",
      sub_question: "Declined, finally ?",
      sub_option: "YES",
      reason: pakkaReason,
      created_at_ist: indiaDate
    };

    saveToFirestore("Meet Request Declined Submission", dataToSave);

    saveToSupabase({
      question: "Doctor Sahiba! milegi na ?",
      option: "NO",
      sub_question: "Declined, finally ?",
      sub_option: "YES",
      reason: pakkaReason,
      created_at_ist: indiaDate
    });

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.innerText = "Sending...";

    const tempDiv = document.createElement("div");
    tempDiv.className = "reason-screenshot-box";

    const reasonTextForScreenshot =
      pakkaReason === "empty" ? "lekin kyun ? the answer will be incomplete forever." : pakkaReason;

    tempDiv.innerHTML = `
        <div class="heading">Don't want to Meet</div>
        <hr class="underline">
        <div class="text-content">${reasonTextForScreenshot.replace(/\n/g, "<br>")}</div>
        <hr class="underline">
        <div class="bottom-text">chalo, theek hai.</div>
    `;

    document.body.appendChild(tempDiv);

    html2canvas(tempDiv).then((canvas) => {
      const link = document.createElement("a");
      const timestamp = new Date().getTime();
      link.href = canvas.toDataURL("image/png");
      link.download = `neverthought_${timestamp}.png`;
      link.click();

      logUserActivity("Screenshot Download", "Optional Reason screenshot downloaded");
      showAndThisTooMessage("no worries! btw screenshot saved in your gallery, image will haunt you (*humare thoughts) :P");
      document.body.removeChild(tempDiv);

      sendWeb3Form("Meet Request Declined Submission", fullMessage, dummyWrapper, "").then(
        () => {
          submitBtn.disabled = false;
          submitBtn.innerText = "save";
        }
      );
    });
  }
}

function showMeetupPopup() {
  const popup = document.getElementById("meetupPopupOverlay");
  const popupContent = document.getElementById("meetupPopupContent");

  popupContent.innerHTML = `
        <div id="meetup-popup-marker" data-popup-type="ideal-meetup"></div>
        <div class="close-btn" onclick="logUserActivity('Popup Closed', 'Ideal Meetup Popup Closed Manually'); hideMeetupPopup()">&times;</div>
        <div style="text-align:center;">
            <div style="font-family: 'Great Vibes'; letter-spacing: 1px; word-spacing: 1px; font-size: 22px; color: #c0392b; margin-bottom: 15px;">
                Got a magical setup that feels right?
            </div>
            <textarea id="meetupInput" class="meetup-textarea" placeholder="Paint the vibe..."
                oninput="autoGrow(this); handleMeetupInput()"></textarea>
            
            <div id="meetupSubmitWrapper" style="display:none; margin-bottom: 15px;">
                <button onclick="submitMeetup()" style="padding: 6px 16px; font-size: 16px; font-family: 'Kalam'; background-color: #fef4f4; color: #c0392b; box-shadow: 0 4px 8px rgba(192, 57, 43, 0.3); border: 2px solid #c0392b; border-radius: 8px; cursor: pointer;">
                    save
                </button>
            </div>

            <div style="margin-top: 10px;">
                <a href="https://wa.me/919709909629?text=Hi Patient... missed me ?" target="_blank" onclick="logUserActivity('Whatsapp Click', 'Clicked ta WhatsApp link')" style="text-decoration: none; color: #25D366; font-family: 'Great Vibes'; letter-spacing: 1px; word-spacing: 1px; font-size: 22px;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width: 24px; vertical-align: middle; margin-right: 8px;">
                    baatein karni hai, avi ?
                </a>
            </div>
            <div style="position: absolute; bottom: 30px; left: 0; right: 0; color: #ff8585; font-family: Courier Prime; font-size: 14px;">
              (tumhe dekhne se sukoon milta hai :D)
            </div>
        </div>
        <audio id="meetupMusic">
          <source src="song.mpeg" type="audio/mpeg">
        </audio>
  `;

  popup.classList.add("show");

  setTimeout(() => {
  const music = document.getElementById("meetupMusic");
  if (music) {
    music.volume = 1;
    music.muted = false;
    music.play().then(() => {
      console.log("Music started");
    }).catch(err => {
      console.warn("Autoplay blocked:", err);
    });
  }
  }, 1000);

  setTimeout(() => {
    const textarea = document.getElementById("meetupInput");
    if (textarea) {
      textarea.addEventListener("click", function () {
        logUserActivity("Meetup ta Click", "Clicked on Ideal Meetup textarea");
      });
      textarea.addEventListener("blur", function () {
        const val = textarea.value.trim();
        logUserActivity("Meetup ta Input", `Ideal Meetup text → ${val.length > 0 ? val : "blank"}`);
      });
      setupMeetupTypingLogger();
    }
  }, 150);
  logUserActivity("Meetup ta Popup", "Ideal Meetup Popup");
}

function hideMeetupPopup() {
  const popup = document.getElementById("meetupPopupOverlay");
  popup.classList.remove("show");

  // Stop the music if playing
  const audio = document.getElementById("meetupMusic");
  if (audio && !audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }

  // const popupContent = document.getElementById("meetupPopupContent").innerHTML;

  // Wait a bit before clearing content
  setTimeout(() => {
    document.getElementById("meetupPopupContent").innerHTML = "";
  }, 300);
  // Reload if it's either Ideal Meetup or WhatsApp-only popup
  const isWhatsappOnly = document.querySelector('#meetup-popup-marker')?.dataset.popupType === "whatsapp-only";
  const isIdealMeetup = document.querySelector('#meetup-popup-marker')?.dataset.popupType === "ideal-meetup";

  if (isWhatsappOnly || isIdealMeetup) {
    setTimeout(() => {
      location.reload();
    }, 500); // Give time for popup animation to fade
  }
}

function handleMeetupInput() {
  const textarea = document.getElementById("meetupInput");
  const text = textarea.value.trim();
  const wrapper = document.getElementById("meetupSubmitWrapper");

  if (text.length > 0) {
    if (!wrapper.querySelector("button")) {
      wrapper.innerHTML = `
                <button onclick="submitMeetup()" style="
                    padding: 8px 16px;
                    font-size: 16px;
                    font-family: 'Kalam';
                    background-color: #fef4f4;
                    color: #c0392b;
                    border: 2px solid #c0392b;
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(192, 57, 43, 0.3);
                ">
                    save
                </button>
            `;
    }
    wrapper.style.display = "block";
  } else {
    wrapper.style.display = "none";
  }
}

async function submitMeetup() {
  logUserActivity("Button Click", "Clicked on Submit @ Ideal Meetup");
  const textarea = document.getElementById("meetupInput");
  const text = textarea.value.trim();
  if (text.length === 0) return;

  const indiaDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const dataToSave = {
    question: "Got a magical setup that feels right? Paint the vibe.",
    message: text,
    created_at_ist: indiaDate
  };

  saveToFirestore("Meetup Thought Submission", dataToSave);

  if (lastSupabaseRowId) {
    const { data, error } = await supabaseClient
      .from("form_submissions")
      .update({
        message: text,
      })
      .eq("id", lastSupabaseRowId);

    if (error) {
      console.error("❌ Supabase update error:", error);
    } else {
      console.log("✅ Supabase row updated with message:", data);
    }

    const { data: newData, error: newError } = await supabaseClient
      .from("form_submissions")
      .insert([
        {
          question: "Got a magical setup that feels right? Paint the vibe.",
          message: text,
          created_at_ist: indiaDate
        },
      ]);

    if (newError) {
      console.error("❌ Supabase insert new row error:", newError);
    } else {
      console.log("✅ Supabase new row inserted:", newData);
    }
  } else {
    saveToSupabase({
      question: "Got a magical setup that feels right? Paint the vibe.",
      message: text,
      created_at_ist: indiaDate,
    });
  }

  // TempDiv for screenshot
  const tempDiv = document.createElement("div");
  tempDiv.className = "meetup-screenshot-box";

  tempDiv.innerHTML = `
        <div class="heading">A Magical Setup that just feels right!</div>
        <hr class="underline">
        <div class="text-content">${text.replace(/\n/g, "<br>")}</div>
        <hr class="underline">
        <div class="bottom-text">chalooo... let's plan something!</div>
    `;

  document.body.appendChild(tempDiv);

  html2canvas(tempDiv).then((canvas) => {
    const link = document.createElement("a");
    const timestamp = new Date().getTime();
    link.href = canvas.toDataURL("image/png");
    link.download = `thoughts__${timestamp}.png`;
    link.click();
    logUserActivity("Screenshot Download", "Meetup ta screenshot downloaded");

    document.body.removeChild(tempDiv);

    const wrapper = document.getElementById("meetupSubmitWrapper");
    const buttonHtml = `
            <button onclick="submitMeetup()" style="
                padding: 8px 16px;
                font-size: 16px;
                font-family: 'Kalam';
                background-color: #fef4f4;
                color: #c0392b;
                border: 2px solid #c0392b;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 4px 8px rgba(192, 57, 43, 0.3);
            ">
                save
            </button>
        `;
    const fullMessage = `
      Submitted at : ${indiaDate}

      Got a magical setup that feels right? Paint the vibe. 
      ${text}
    `;

    sendWeb3Form("Meetup Thought Submission", fullMessage, wrapper, buttonHtml);

    textarea.value = "";
    textarea.style.height = "auto";

    // After screenshot → show confirmation
    setTimeout(() => {
      showAndThisTooMessage("and this too! check your gallery");
    }, 600);
  });
}

function autoGrow(element) {
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
}

function showWhatsappOnlyPopup() {
  const popup = document.getElementById("meetupPopupOverlay");
  const popupContent = document.getElementById("meetupPopupContent");

  popupContent.innerHTML = `
        <div id="meetup-popup-marker" data-popup-type="ideal-meetup"></div>
        <div class="close-btn" onclick="logUserActivity('Popup Closed', 'Whatsapp Popup Closed Manually'); hideMeetupPopup()">&times;</div>
        <div style="text-align:center;">
          <div style="font-family: Courier Prime; font-size: 14px; color: black; margin-bottom: 8px;">(I won't disturb you)</div>

            <div style="margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;">
            <div style="margin-top: 10px;">
                <a href="https://wa.me/919709909629?text=Hi... wait for sometime, maybe things will fix.. or not!" target="_blank" onclick="logUserActivity('Whatsapp Click', 'Clicked dnt WhatsApp link')" style="text-decoration: none; color: #25D366; font-family: 'Great Vibes'; letter-spacing: 1px; word-spacing: 1px; font-size: 22px;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width: 24px; vertical-align: middle; margin-right: 8px;">
                    fir baatein nahi hi karte?
                </a>
              <span style="font-family: 'Great Vibes'; letter-spacing: 1px; word-spacing: 1px; font-size: 22px; color: black;">better?</span>
            </div>
        </div>
    `;

  popup.classList.add("show");

  logUserActivity("Reason WA Popup", "Reason Whatsapp Popup");
}

//logging city value
document.addEventListener("DOMContentLoaded", function () {
  const cityInput = document.getElementById("cityInput");
  if (cityInput) {
    cityInput.addEventListener("blur", function () {
      const city = cityInput.value.trim() || "blank";
      logUserActivity("City Field", city);
    });
  }
});

//logging optional reason value
document.addEventListener("DOMContentLoaded", function () {
  const pakkaReasonInput = document.getElementById("pakkaReasonInput");
  if (pakkaReasonInput) {
    pakkaReasonInput.addEventListener("blur", function () {
      const reasonVal = pakkaReasonInput.value.trim();
      logUserActivity(
        "Input",
        `Reason field value → ${reasonVal.length > 0 ? reasonVal : "empty"}`
      );
    });
  }
});

// City field logging by each keypress
document.getElementById("cityInput").addEventListener("input", function () {
  const val = this.value.trim();
  logTypingActivity("City", val);
});

// Reason field logging by each keypress
document.getElementById("pakkaReasonInput").addEventListener("input", function () {
    const val = this.value.trim();
    logTypingActivity("Reason", val);
  });

// Ideal Meetup textarea logging by each keypress
function setupMeetupTypingLogger() {
  const textarea = document.getElementById("meetupInput");
  if (!textarea) return;

  textarea.addEventListener("input", function () {
    const val = this.value.trim();
    logTypingActivity("Ideal Meetup", val);
  });
}

//Prevents to reload the page when popup is open
window.addEventListener("beforeunload", function (e) {
  const santoriniVisible = document.getElementById("specialPopupOverlay")?.classList.contains("show");
  const meetupVisible = document.getElementById("meetupPopupOverlay")?.classList.contains("show");
  const hasMeetupInput = !!document.getElementById("meetupInput");

  const meetupPopupContent = document.getElementById("meetupPopupContent")?.innerHTML || "";
  const whatsappPopupActive = meetupPopupContent.includes("don't wanna talk");

  if (
    santoriniVisible ||
    (meetupVisible && hasMeetupInput) ||
    whatsappPopupActive
  ) {
    e.preventDefault();
    e.returnValue = ""; // required for Chrome
  }
});
