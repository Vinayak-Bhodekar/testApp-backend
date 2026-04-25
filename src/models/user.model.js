import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pkg from 'mongoose'


const {Schema} = pkg;


const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['admin','student'],
      required: true,
      default:'student'
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true
    }, 
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true,"the password is required"]
    },
    refreshToken : {
      type: String
    },
    testTaken: {
      type: Number,
      default:0,
    },
    testCreated: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps:true
  }
)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign({
    _id:this.id,
    email:this.email,
    fullname:this.fullname
  },
  process.env.ACCESS_TOKEN_SECRET,
  {expiresIn:process.env.ACCESS_TOKEN_EXPIRES}
)
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign({
    _id:this.id, 
  },
  process.env.REFRESH_TOKEN_SECRET,
  {expiresIn:process.env.REFRESH_TOKEN_EXPIRES} 
)
}

export const User = mongoose.model("User",userSchema)