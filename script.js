// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBKb2TcFAR4BPJtb2K934hixjXh0NHQdA8",
    authDomain: "meet-up-page-4d80d.firebaseapp.com",
    projectId: "meet-up-page-4d80d",
    storageBucket: "meet-up-page-4d80d.firebasestorage.app",
    messagingSenderId: "1054752022608",
    appId: "1:1054752022608:web:d66039cac2ffaa2c327155"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function saveToFirestore(subject, dataObject) {
    dataObject.subject = subject;
    dataObject.timestamp = firebase.firestore.FieldValue.serverTimestamp();

    db.collection("meetup_submissions").add(dataObject)
        .then(() => {
            console.log("Data saved to Firestore");
        })
        .catch((error) => {
            console.error("Error saving data:", error);
        });
}

function sendWeb3Form(subject, message, wrapperElement, buttonHtml) {
    wrapperElement.innerHTML = `
        <div style="
            font-family: 'Times New Roman', Times, serif;
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
            "Accept": "application/json"
        },
        body: JSON.stringify({
            access_key: "97a69f00-08d7-44d8-a71e-3b42fbf56c09",
            subject: subject,
            message: message
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            wrapperElement.innerHTML = `
                <div style="
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 16px;
                    color: #c0392b;
                    margin-top: 8px;
                ">
                    Done!
                </div>
            `;
        } else {
            wrapperElement.innerHTML = `
                <div style="
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 16px;
                    color: #c0392b;
                    margin-top: 8px;
                ">
                    Failed! Please try again.
                </div>
            `;
            setTimeout(() => {
                wrapperElement.innerHTML = buttonHtml;
            }, 1500);
        }

        return data;
    })
    .catch(error => {
        console.error("Error:", error);
        wrapperElement.innerHTML = `
            <div style="
                font-family: 'Times New Roman', Times, serif;
                font-size: 16px;
                color: #c0392b;
                margin-top: 8px;
            ">
                Failed! Please try again.
            </div>
        `;
        setTimeout(() => {
            wrapperElement.innerHTML = buttonHtml;
        }, 1500);
    });
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
        submitBtn.innerText = "Submit";
    }

    if (state) {
        document.getElementById("cityInline").classList.remove("disabled");
    } else {
        document.getElementById("cityInline").classList.add("disabled");
        document.getElementById("buttonWrapper").classList.remove("show");
        submitBtn.innerText = "Submit";
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
        submitBtn.innerText = "Let's plan a date";
    } else {
        document.getElementById("buttonWrapper").classList.remove("show");
        submitBtn.innerText = "Submit";
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
        const formattedDate = `${dateObj.toLocaleString('default', { month: 'long' })} ${day}${daySuffix}, ${dateObj.getFullYear()}`;
        formattedDiv.innerText = formattedDate;
    } else {
        formattedDiv.innerText = "";
    }
}

function getDaySuffix(day) {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function handleCountryChange() {
    const country = document.getElementById("countrySelect").value;

    if (country === "India") {
        document.getElementById("stateInline").classList.remove("disabled");
    } else if (country === "Other") {
        showPopup("maaf karna! I don't have passport... <br> this option will be available soon :)",false,true);
        document.getElementById("countrySelect").value = "";
        document.getElementById("stateSelect").value = "";
        document.getElementById("cityInput").value = "";
        document.getElementById("stateInline").classList.add("disabled");
        document.getElementById("cityInline").classList.add("disabled");
        document.getElementById("buttonWrapper").classList.remove("show");
        document.getElementById("submitBtn").innerText = "Submit";
        return;
    } else {
        document.getElementById("stateInline").classList.add("disabled");
        document.getElementById("cityInline").classList.add("disabled");
        document.getElementById("buttonWrapper").classList.remove("show");
        document.getElementById("submitBtn").innerText = "Submit";
    }

    handleFieldEnableFlow();
}

function handleStateChange() {
    const state = document.getElementById("stateSelect").value;
    if (state) {
        document.getElementById("cityInline").classList.remove("disabled");
        document.getElementById("cityInput").value = "";
    } else {
        document.getElementById("cityInline").classList.add("disabled");
        document.getElementById("buttonWrapper").classList.remove("show");
        document.getElementById("submitBtn").innerText = "Submit";
    }
    handleFieldEnableFlow();
}

function handleYes() {
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
    document.getElementById("submitBtn").innerText = "Submit";

    const pakkaRadios = document.getElementsByName("pakka");
    pakkaRadios.forEach(radio => radio.checked = false);
    document.getElementById("pakkaReasonField").classList.remove("show");
    document.getElementById("pakkaReasonInput").value = "";

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    document.getElementById("datePicker").min = `${yyyy}-${mm}-${dd}`;
}

function handleNo() {
    document.getElementById("yesFields").classList.remove("show");
    document.getElementById("question2Block").classList.add("show");
    document.getElementById("buttonWrapper").classList.remove("show");
    document.getElementById("submitBtn").innerText = "Submit";

    const pakkaRadios = document.getElementsByName("pakka");
    pakkaRadios.forEach(radio => radio.checked = false);
    document.getElementById("pakkaReasonField").classList.remove("show");
    document.getElementById("pakkaReasonInput").value = "";
}

function handlePakka() {
    const pakkaRadios = document.getElementsByName("pakka");
    let isYes = false;
    let isNo = false;

    pakkaRadios.forEach(radio => {
        if (radio.checked) {
            if (radio.value === "yes") isYes = true;
            else if (radio.value === "no") isNo = true;
        }
    });

    if (isYes) {
        document.getElementById("pakkaReasonField").classList.add("show");
        document.getElementById("buttonWrapper").classList.add("show");
    } else {
        document.getElementById("pakkaReasonField").classList.remove("show");
        document.getElementById("pakkaReasonInput").value = "";
        document.getElementById("buttonWrapper").classList.remove("show");
    }

    const proceedRadios = document.getElementsByName("proceed");
    let isProceedNo = false;
    proceedRadios.forEach(radio => {
        if (radio.checked && radio.value === "no") isProceedNo = true;
    });

    if (isProceedNo && isNo) {
        const popupMessage = "Wohoo! thanks for considering my request...";
    
        const fullMessage = `
    Question: Do you want to proceed ?
    Option chosen: NO
    sub-question: Pakka toh ?
    sub-option chosen: NO
    Popup message: ${popupMessage}
    `;
    
        const dummyWrapper = document.getElementById("dummyWrapper");
    
        const dataToSave = {
            question: "Do you want to proceed ?",
            option: "NO",
            sub_question: "Pakka toh ?",
            sub_option: "NO",
            popup_message: popupMessage
        };
    
        // 👉 Disable Pakka and Proceed radios
        document.querySelectorAll('input[name="pakka"]').forEach(radio => {
            radio.disabled = true;
        });
        document.querySelectorAll('input[name="proceed"]').forEach(radio => {
            radio.disabled = true;
        });
    
        // 👉 Show Sending... in bottom right
        document.getElementById("pakkaSendingStatus").innerText = "Sending...";
        document.getElementById("pakkaSendingStatus").style.display = "block";
    
        saveToFirestore("Pakka NO Submission", dataToSave);
    
        sendWeb3Form("Pakka NO Submission", fullMessage, dummyWrapper, "")
            .then(() => {
                // 👉 Re-enable radios
                document.querySelectorAll('input[name="pakka"]').forEach(radio => {
                    radio.disabled = false;
                });
                document.querySelectorAll('input[name="proceed"]').forEach(radio => {
                    radio.disabled = false;
                });
    
                // 👉 Hide Sending...
                document.getElementById("pakkaSendingStatus").style.display = "none";
    
                // 👉 Now show popup
                showPopup(popupMessage, true);
            });
    }       

}

function showPopup(message, autoSwitchToYes = false, noReload = false) {
    const popup = document.getElementById("popupOverlay");
    const popupContent = document.getElementById("popupContent");
    popupContent.innerHTML = message;
    popup.classList.add("show");

    let autoCloseTimer = null;

    const closeHandler = () => {
        popup.classList.remove("show");
        popup.onclick = null;
        clearTimeout(autoCloseTimer);

        if (autoSwitchToYes) {
            const proceedRadios = document.getElementsByName("proceed");
            proceedRadios.forEach(radio => {
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

    popup.onclick = closeHandler;
    autoCloseTimer = setTimeout(() => {
        closeHandler();
    }, 5000);
}

function handleSubmit() {
    const proceedRadios = document.getElementsByName("proceed");
    const pakkaRadios = document.getElementsByName("pakka");

    let proceedValue = "";
    let pakkaValue = "";

    proceedRadios.forEach(radio => {
        if (radio.checked) {
            proceedValue = radio.value;
        }
    });

    pakkaRadios.forEach(radio => {
        if (radio.checked) {
            pakkaValue = radio.value;
        }
    });

    if (proceedValue === "yes") {
        const submitBtn = document.getElementById("submitBtn");
    
        if (submitBtn.innerText === "Let's plan a date") {
            const date = document.getElementById("formattedDate").innerText;
            const country = document.getElementById("countrySelect").value;
            const state = document.getElementById("stateSelect").value;
            const city = document.getElementById("cityInput").value.trim();
    
            const dataToSave = {
                question: "Do you want to proceed?",
                option: "YES",
                date: date,
                country: country,
                state: state,
                city: city
            };
    
            saveToFirestore("Let's Plan a Date Submission", dataToSave);
            
    
            const fullMessage = `
    Question 1: Do you want to proceed?
    Option chosen: YES
    
    Kab milna hai...
    Choose a date: ${date}
    
    Kahan milna hai...
    Choose a country: ${country}
    Choose a state: ${state}
    City: ${city}
    `;
    
            const dummyWrapper = document.getElementById("dummyWrapper");
    
            // 👉 Disable button, show "Planning..."
            submitBtn.disabled = true;
            submitBtn.innerText = "Planning...";
    
            sendWeb3Form("Let's Plan a Date Submission", fullMessage, dummyWrapper, "")
                .then(() => {
                    // 👉 Enable button, restore text
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Let's plan a date";
    
                    // 👉 Now show popup
                    showMeetupPopup();
                });
        } else {
            showMeetupPopup();
        }
    } else if (proceedValue === "no" && pakkaValue === "yes") {
        showWhatsappOnlyPopup();
    
        // Build full message:
        let pakkaReason = document.getElementById("pakkaReasonInput").value.trim();
        if (pakkaReason.length === 0) pakkaReason = "blank";
    
        const fullMessage = `
    Question: Do you want to proceed ?
    Option chosen: NO
    sub-question: Pakka toh ?
    sub-option chosen: YES
    Reason: ${pakkaReason}
    `;
    
        const dummyWrapper = document.getElementById("dummyWrapper");
    
        const dataToSave = {
            question: "Do you want to proceed ?",
            option: "NO",
            sub_question: "Pakka toh ?",
            sub_option: "YES",
            reason: pakkaReason
        };
    
        saveToFirestore("Pakka YES Submission", dataToSave);
    
        // Disable button and show "Sending..."
        const submitBtn = document.getElementById("submitBtn");
        submitBtn.disabled = true;
        submitBtn.innerText = "Sending...";
    
        sendWeb3Form("Pakka YES Submission", fullMessage, dummyWrapper, "")
            .then(() => {
                // Enable button and restore text
                submitBtn.disabled = false;
                submitBtn.innerText = "Submit";
            });
    }
    
}

function showMeetupPopup() {
    const popup = document.getElementById("meetupPopupOverlay");
    const popupContent = document.getElementById("meetupPopupContent");

    popupContent.innerHTML = `
        <div class="close-btn" onclick="hideMeetupPopup()">&times;</div>
        <div style="text-align:center;">
            <div style="font-family: 'Brush Script MT', cursive; font-size: 22px; color: #c0392b; margin-bottom: 15px;">
                What's your ideal meetup?
            </div>
            <textarea id="meetupInput" placeholder="Type here..."
            style="width: 90%; max-width: 90%; box-sizing: border-box; min-height: 40px; max-height: 300px; padding: 12px 12px 12px 16px; font-size: 16px; border-radius: 8px; border: 1px solid #c0392b; font-family: 'Brush Script MT', cursive; margin-bottom: 15px; resize: none; overflow: hidden;"
            oninput="autoGrow(this); handleMeetupInput()">
            </textarea>
            
            <div id="meetupSubmitWrapper" style="display:none; margin-bottom: 15px;">
                <button onclick="submitMeetup()" style="padding: 8px 16px; font-size: 16px; font-family: 'Times New Roman', Times, serif; background-color: #fef4f4; color: #c0392b; box-shadow: 0 4px 8px rgba(192, 57, 43, 0.3); border: 2px solid #c0392b; border-radius: 8px; cursor: pointer;">
                    Submit
                </button>
            </div>

            <div style="margin-top: 10px;">
                <a href="https://wa.me/919905583175?text=Hi" target="_blank" style="text-decoration: none; color: #25D366; font-family: 'Brush Script MT', cursive; font-size: 22px;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width: 24px; vertical-align: middle; margin-right: 8px;">
                    wanna talk now ?
                </a>
            </div>
        </div>
    `;

    popup.classList.add("show");

    setTimeout(() => {
        const textarea = document.getElementById("meetupInput");
        if (textarea) {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = 0;
            textarea.scrollTop = 0;
        }
    }, 100);

    popup.onclick = function(event) {
        if (event.target === popup) {
            hideMeetupPopup();
        }
    };
}

function hideMeetupPopup() {
    const popup = document.getElementById("meetupPopupOverlay");
    popup.classList.remove("show");
    setTimeout(() => {
        location.reload();
    }, 300);
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
                    font-family: 'Times New Roman', Times, serif;
                    background-color: #fef4f4;
                    color: #c0392b;
                    border: 2px solid #c0392b;
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(192, 57, 43, 0.3);
                ">
                    Submit
                </button>
            `;
        }
        wrapper.style.display = "block";
    } else {
        wrapper.style.display = "none";
    }
}

function submitMeetup() {
    const text = document.getElementById("meetupInput").value.trim();
    if (text.length === 0) return;

    const dataToSave = {
        question: "What's your ideal meetup?",
        message: text
    };

    saveToFirestore("Meetup Popup Submission", dataToSave);

    const wrapper = document.getElementById("meetupSubmitWrapper");
    const buttonHtml = `
        <button onclick="submitMeetup()" style="
            padding: 8px 16px;
            font-size: 16px;
            font-family: 'Times New Roman', Times, serif;
            background-color: #fef4f4;
            color: #c0392b;
            border: 2px solid #c0392b;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(192, 57, 43, 0.3);
        ">
            Submit
        </button>
    `;

    sendWeb3Form("New Meetup Submission", text, wrapper, buttonHtml);

    document.getElementById("meetupInput").value = "";
}

function autoGrow(element) {
    element.style.height = "auto";
    element.style.height = (element.scrollHeight) + "px";
    element.scrollTop = 0;
}

function showWhatsappOnlyPopup() {
    const popup = document.getElementById("meetupPopupOverlay");
    const popupContent = document.getElementById("meetupPopupContent");

    popupContent.innerHTML = `
        <div class="close-btn" onclick="hideMeetupPopup()">&times;</div>
        <div style="text-align:center;">
            <div style="margin-top: 10px;">
                <a href="https://wa.me/919905583175?text=Hi" target="_blank" style="text-decoration: none; color: #25D366; font-family: 'Brush Script MT', cursive; font-size: 22px;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="width: 24px; vertical-align: middle; margin-right: 8px;">
                    don't wanna talk ?
                </a>
            </div>
        </div>
    `;

    popup.classList.add("show");

    popup.onclick = function(event) {
        if (event.target === popup) {
            hideMeetupPopup();
        }
    };
}
