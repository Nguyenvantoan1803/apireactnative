const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
 
const jwtSecret =
  "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd";
exports.register = async (req, res, next) => {
  const { username, password, email } = req.body;
  console.log(req.body)
  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" });
  }
  if (email.length < 6) {
    return res.status(400).json({ message: "Email less than 6 characters" });
  }
  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      username: username,
      password: hash,
      email:email,
    })
      .then((user) => {
        console.log("pppp")
        const maxAge = 3 * 60 * 60;
        const token = jwt.sign(
          { id: user._id, username, role: user.role },
          jwtSecret,
          {
            expiresIn: maxAge, // 3hrs
          }
        );
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000,
        });
        res.status(201).json({
          message: "User successfully created",
          user: user._id,
          role: user.role,
        });
      })
      .catch((error) =>
        res.status(400).json({
          message: "User not successful created",
          error: error.message,
        })
      );
  });
};

exports.login = async (req, res, next) => {
  const { password,email } = req.body;
  console.log(password,email,"sdgrfd")
  
  // Check if username and password is provided
  if ( !password ||!email) {
    return res.status(400).json({
      message: "Username or Password not present",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({
        message: "Login not successful",
        error: "User not found",
      });
    } else {
      // comparing given password with hashed password
        bcrypt.compare(password, user.password).then(function (result) {
          if (result) {
            const maxAge = 3 * 60 * 60;
            const token = jwt.sign(
              { id: user._id, username :user.username, role: user.role },
              jwtSecret,
              {
                expiresIn: maxAge, // 3hrs in sec
              }
            );
            res.cookie("jwt", token, {
              httpOnly: true,
              maxAge: maxAge * 1000, // 3hrs in ms
            });
            res.status(200).json({
              message: "User successfully Logged in",
              user: user._id,
              role: user.role,
            });
          } else {
            res.status(400).json({ message: "Login not succesful" });
          }
        })
     
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    });
  }
};

exports.update = async (req, res, next) => {
  const { role, id } = req.body;
  // Verifying if role and id is presnt
  if (role && id) {
    // Verifying if the value of role is admin
    if (role === "admin") {
      // Finds the user with the id
      await User.findById(id)
        .then((user) => {
          // Verifies the user is not an admin
          if (user.role !== "admin") {
            user.role = role;
            user.save((err) => {
              //Monogodb error checker
              if (err) {
                return res
                  .status("400")
                  .json({ message: "An error occurred", error: err.message });
                process.exit(1);
              }
              res.status("201").json({ message: "Update successful", user });
            });
          } else {
            res.status(400).json({ message: "User is already an Admin" });
          }
        })
        .catch((error) => {
          res
            .status(400)
            .json({ message: "An error occurred", error: error.message });
        });
    } else {
      res.status(400).json({
        message: "Role is not admin",
      });
    }
  } else {
    res.status(400).json({ message: "Role or Id not present" });
  }
};

exports.updatepassword = async(req,res,next)=>{
  const {password,id} = req.body;
  User.findOne({ _id: id }).then((update)=>{
    if (!update) return res.status(400).send("invalid link or expired");
  });
  bcrypt.hash(password, 10).then(async (hash) => {
    console.log(hash,"hash")
     const a = await User.findByIdAndUpdate(id,{
        password: hash,
      })
    a.save();
    if(!a)  return res.status(400).send("Update not successful ");
   // update.password = req.body.password;
    return a
  })

  return res.status(200).send("Update successful ")
}

exports.deleteUser = async (req, res, next) => {
  const { id } = req.body;
  await User.findById(id)
    .then((user) => user.remove())
    .then((user) =>
      res.status(201).json({ message: "User successfully deleted", user })
    )
    .catch((error) =>
      res
        .status(400)
        .json({ message: "An error occurred", error: error.message })
    );
};

exports.getUsers = async (req, res, next) => {
  await User.find({})
    .then((users) => {
      const userFunction = users.map((user) => {
        const container = {};
        container.username = user.username;
        container.role = user.role;
        container.id = user._id;

        return container;
      });
      res.status(200).json({ user: userFunction });
    })
    .catch((err) =>
      res.status(401).json({ message: "Not successful", error: err.message })
    );
};

exports.sendemail = async(req, res, next)=> {
  const { email } = req.body;
  const body = "https://www.pnj.com.vn/"
  const title="Lời chúc Giáng sinh và Năm mới cho vợ yêu: Chúc vợ, một nửa của đời anh luôn cảm thấy hạnh phúc khi có anh luôn bên cạnh. Dù em đi tới đâu anh vẫn theo từng bước chân em. Anh chỉ mong được theo em trên đoạn đường còn lại để có thể dìu em khi em ngã, hạnh phúc khi được thấy em cười, và bên cạnh em khi em cô đơn nhất, với anh như thế là đủ. Mãi yêu vợ!"
  console.log(email,"gdfgdfg")
  var transporter =  nodemailer.createTransport({ // config mail server
      service: 'Gmail',
      auth: {
          user: 'vantoan18032001@gmail.com',
          pass: 'kbsmxwemhtbhghfl'
      }
  });
  var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
      from: 'VanToan',
      to: email,
      subject: 'Giáng Sinh An Lành',
      text: 'You recieved message from ' + req.body.email,
      html: '<p>Xin gửi lời chúc an lành đến người nhận được email này.</p></b><ul><li>Nội dung: ' + title + '</li><li>Link:' + body + '</li></ul>'
  }
  transporter.sendMail(mainOptions, function(err, info){
      if (err) {
          console.log(err);
          res.redirect('/');
      } else {
          console.log('Message sent: ' +  info.response);
          res.redirect('/');
      }
  });
};