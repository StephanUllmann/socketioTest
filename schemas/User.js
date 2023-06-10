const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rooms: {
    type: [String],
  },
});

userSchema.statics.signup = async function (username, email, password) {
  const userExists = await this.findOne({ username });
  const emailExists = await this.findOne({ email });

  if (userExists) {
    throw Error("Username already in use");
  }
  if (emailExists) {
    throw Error("Email already in use");
  }
  if (!username || !email || !password) {
    throw Error("Please fill all fields");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
    throw Error(
      "Min 8 characters, min 1 uppercase, min 1 lowercase, min 1 number"
    );
  }

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ username, email, password: hash });

  return user;
};

userSchema.statics.login = async function (username, password) {
  if (!username || !password) {
    throw Error("Please fill all fields.");
  }
  const user = await this.findOne({ username });

  if (!user) {
    throw Error("Did you mistype your username?");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect password");
  }
  return user;
};

module.exports = mongoose.model("User", userSchema);
