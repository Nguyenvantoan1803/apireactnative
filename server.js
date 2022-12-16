const express = require("express");
const connectDB = require("./db");
const app = express();
const cookieParser = require("cookie-parser");
const { adminAuth, userAuth } = require("./middleware/auth.js");
const cors = require("cors")

const PORT = 5000;

app.set("view engine", "ejs");

connectDB();


// const allowlist = ['http://localhost:19006']
// const corsOptionsDelegate = {
//     origin: function(origin,callback){
//         if(allowlist.indexOf(origin) !==-1){
//             callback(null,true)

//         }else{
//             callback(new Error(`${origin} not allowed by Cors`))
//         }
//     },
//     optionsSuccessStatus: 200
// }
app.use(cors())
app.options('*', cors())

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./Auth/route"));

app.get("/", (req, res) => res.render("home"));
app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login"));
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.redirect("/");
});
app.get("/admin", adminAuth, (req, res) => res.render("admin"));
app.get("/basic", userAuth, (req, res) => res.render("user"));

const server = app.listen(PORT, () =>
  console.log(`Server Connected to port ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});
