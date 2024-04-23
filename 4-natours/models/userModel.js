const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = mongoose.Schema(
{
  name:
  {
    type: String,
    required: [true, "A user must have a name."],
    trim: true,
    maxlength: [20, "A user name must have less or equal then 20 characters."],
    minlength: [1, "A user name must have more or equal then 1 character."],
  },
  email:
  {
    type: String,
    required: [true, "A tour must have an email."],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please type a valid email address."]
  },
  photo:
  {
    type: String,
    default: "default.jpg"
  },
  role:
  {
    type: String,
    enum: ["user", "guide", "lead", "admin"],
    default: "user"
  },
  password:
  {
    type: String,
    required: [true, "A user must have a password."],
    validate: [validator.isStrongPassword, "Please type a stronger password."],
    select: false
  },
  passwordConfirm:
  {
    type: String,
    required: [true, "A user must have a password."],
    validate:
    {
      //This only works on CREATE and SAVE
      validator: function(element)
      {
        return element === this.password;
      },
      message: "Passwords are not the same."
    },
    select: false
  },
  active:
  {
    type: Boolean,
    default: true,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('find', function(next) 
{
  this.where({ active: { $ne: false } });
  next();
});

userSchema.pre("save", async function(next) 
{
  //Only runs if the passwords has been modified
  if(!this.isModified("password")) return next();

  //Hash the password with cost of 14
  this.password = await bcrypt.hash(this.password, 14);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next(); 
});

userSchema.pre("save", async function(next) 
{
  if(!this.isModified("password") || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000; //One second in the past!
  //Ensures that the token is created after the password has been changed
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword)
{
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.ChangedPasswordAfter = function(JWTTimestamp)
{
  if(this.passwordChangedAt)
  {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
    //console.log("Password changed")
    return JWTTimestamp < changedTimestamp;
  }
  //False means NOT changed
  //console.log("password not changed");
  return false;
};

userSchema.methods.CreatePasswordResetToken = function()
{
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256")
                                  .update(resetToken)
                                  .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;