const mongoose = require("mongoose");

//schema
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "user name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
     phone: {
      type: String,
      required: [true, "phone number is require"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
      answer: {
      type: String,
      required: [true, "Asnwer is required"],
    },
  
    role: {
      type: String,
      required: [true, "user type is required"],
      default: "client",
      enum: ["Participant", "Organisateur"],
    },
    profile: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png",
    },
       address: {
      type: Array,
    },
  
    update_pass_date: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);
userSchema.methods.validTokenDate = function (JWTDate) {
  const dataPass = parseInt(this.update_pass_date.getTime() / 1000);
  return JWTDate < dataPass;
};
//export
module.exports = mongoose.model("User", userSchema);
