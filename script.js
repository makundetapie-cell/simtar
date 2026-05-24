// BOOKING FORM
document
.getElementById("bookingForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    let appointment = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        service: document.getElementById("service").value,
        date: document.getElementById("date").value
    };

    fetch("https://simtar.onrender.com/appointment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(appointment)
    })
    .then(res => res.json())
    .then(data => {
        alert("Appointment sent to server!");
        document.getElementById("bookingForm").reset();
    });

});


// LOGIN FORM

document
.getElementById("loginForm")
.addEventListener(
"submit",
function(e){

e.preventDefault();

let patientId =
document
.getElementById(
"patientId"
)
.value
.trim();

let password =
document
.getElementById(
"password"
)
.value
.trim();

let patients =
JSON.parse(
localStorage.getItem(
"patients"
)
) || {};

if(
patients[patientId]
&&
patients[patientId]
.password === password
){

localStorage.setItem(
"loggedInPatient",
patientId
);

window.location.href =
"results.html";

} else {

alert(
"Incorrect Patient ID OR PASSWORD"
);

}

});