const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = "simtar_secret_key_2026";

/* MONGODB */

mongoose.connect(
"mongodb+srv://Tapiwa:Rufaro2004@cluster0.xdgyosf.mongodb.net/simtar?retryWrites=true&w=majority"
)


.then(() => {

console.log(
"MongoDB Connected 🚀"
);

})

.catch(err => {

console.log(err);

});

/* PATIENT MODEL */

const patientSchema =
new mongoose.Schema({

patientId:String,
password:String

});

const Patient =
mongoose.model(
"Patient",
patientSchema
);

/* MIDDLEWARE */

app.use(cors());

app.use(bodyParser.json());

app.use(
express.static(
path.join(__dirname, "../")
)
);

app.use(
"/results",
express.static("results")
);

/* MULTER */

const storage =
multer.diskStorage({

destination:function(
req,
file,
cb
){

cb(null, "results/");

},

filename:function(
req,
file,
cb
){

const patientId =
req.body.patientId;

cb(
null,
patientId + ".pdf"
);

}

});

const upload =
multer({
storage:storage
});

/* ADMIN */

let admin = {

username:"admin",

password:
bcrypt.hashSync(
"admin123",
10
)

};

/* ADMIN LOGIN */

app.post(
"/admin/login",
async (req, res) => {

try {

const {
username,
password
} = req.body;

if(
username !== admin.username
){

return res.json({
message:
"Invalid username"
});

}

const isMatch =
await bcrypt.compare(
password,
admin.password
);

if(!isMatch){

return res.json({
message:
"Invalid password"
});

}

const token =
jwt.sign(

{
username:
admin.username
},

SECRET,

{
expiresIn:"2h"
}

);

res.json({ token });

}

catch(error){

console.log(error);

res.status(500).json({
message:"Server error"
});

}

});

/* DATABASE JSON */

const DB_FILE =
"database.json";

function readDB(){

if(
!fs.existsSync(DB_FILE)
){

fs.writeFileSync(
DB_FILE,
JSON.stringify({
appointments:[]
})
);

}

return JSON.parse(
fs.readFileSync(DB_FILE)
);

}

function writeDB(data){

fs.writeFileSync(
DB_FILE,
JSON.stringify(
data,
null,
2
)
);

}

/* APPOINTMENTS */

app.post(
"/appointment",
(req, res) => {

let db = readDB();

db.appointments.push(
req.body
);

writeDB(db);

res.json({
message:
"Appointment saved successfully"
});

});

app.get(
"/appointments",
(req, res) => {

let db = readDB();

res.json(
db.appointments
);

});

app.delete(
"/appointment/:index",
(req, res) => {

let db = readDB();

db.appointments.splice(
req.params.index,
1
);

writeDB(db);

res.json({
message:"Deleted"
});

});

/* PATIENTS */

app.post(
"/patient",
async (req, res) => {

const newPatient =
new Patient(req.body);

await newPatient.save();

res.json({
message:"Patient saved"
});

});

app.get(
"/patients",
async (req, res) => {

const patients =
await Patient.find();

res.json(patients);

});

/* PATIENT LOGIN */

app.post(
"/patient/login",
async (req, res) => {

const {
patientId,
password
} = req.body;

const patient =
await Patient.findOne({
patientId,
password
});

if(patient){

return res.json({

success:true,

pdf:
"/results/" +
patientId +
".pdf"

});

}

res.json({
success:false
});

});

/* RESULTS LIST */

app.get(
"/results-list",
(req, res) => {

const resultsFolder =
"results";

fs.readdir(
resultsFolder,
(err, files) => {

if(err){

return res.json([]);

}

const pdfs =
files.filter(file =>
file.endsWith(".pdf")
);

res.json(pdfs);

});

});

/* DELETE RESULT */

app.delete(
"/delete-result/:file",
(req, res) => {

const filePath =
path.join(
__dirname,
"results",
req.params.file
);

fs.unlink(
filePath,
(err) => {

if(err){

return res.json({
message:
"Delete failed"
});

}

res.json({
message:
"PDF deleted"
});

});

});

/* UPLOAD RESULT */

app.post(
"/upload-result",
upload.single("pdf"),
(req, res) => {

res.json({
message:
"Result uploaded successfully"
});

});

/* HOME */

app.get("/", (req, res) => {

res.send(
"SIMTAR backend running 🚀"
);

});

/* SERVER */

app.listen(PORT, () => {

console.log(
"Server running on http://localhost:" + PORT
);

});