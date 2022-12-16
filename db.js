const Mongoose = require("mongoose");

const localDB = `mongodb+srv://api:vantoan090801@cluster0.1n4mqst.mongodb.net/?retryWrites=true&w=majority`;

const connectDB = async () => {
  await Mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("MongoDB Connected");
};

module.exports = connectDB;
