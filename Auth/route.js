const express = require("express");
const router = express.Router();

const { register, login, update, deleteUser, getUsers,sendemail,updatepassword } = require("./auth");
const { adminAuth } = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/update").put(adminAuth, update);
router.route("/deleteUser").delete(adminAuth, deleteUser);
router.route("/getUsers").get(getUsers);
router.route("/sendemail").post(sendemail);
router.route("/updatepassword").post(updatepassword);

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await new User(req.body).save();

        res.send(user);
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
});
// router.get('/', function(req, res, next) {
//     res.render('contact', { title: 'Contact' });
// });
 // khai báo sử dụng module nodemailer



module.exports = router;
