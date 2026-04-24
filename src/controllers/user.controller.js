import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary,deleteFromCloudinary,cloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    if(!user) {
      return new ApiError(404,"User not found")
    }
  
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
  
    await user.save({validateBeforeSave:false})
  
    return {accessToken,refreshToken}
  } catch (error) {
    return new ApiError(500,"Something went wrong while generating access and refresh token") 
  }
}

const registerUser = asyncHandler(async (req,res) => {
  console.log("TYPE:", req.headers["content-type"]);
  console.log("BODY:", req.body);
  const {fullName,email,username,password} = req.body;

  if([fullName,email,username,password].some((field) => {field?.trim() === ""})) {
    throw new ApiError(400,"All fields are required")
  }

  const existedUser = await User.findOne({
    $or:[{userName:username},{email:email}]
  })
  if(existedUser) {
    throw new ApiError(409,"User with username and email already exist")
  }

  try {
    const user = await User.create({
      fullName,
      email,
      password,
      username:username.toLowerCase()

    })
  
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser) {
      throw new ApiError(500,"Something went wrong while registering a user")
    }
  
    return res
    .status(201)
    .json(new ApiResponse(200,createdUser,"User registed successfully"))
  } catch (error) {
    console.log(error)
    

    
    throw new ApiError(500,"Something went wrong while registering a user and image deleted",error)
  }
})

const loginUser = asyncHandler(async (req,res) => {
  const {email,username,password} = req.body
  
  const user = await User.findOne({
    $or:[{username:username},{email:email}]
  })


  if(!user) {
    throw new ApiError(404,"User not found")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)
  
  if(!isPasswordValid) {
    throw new ApiError(401,"invalid credential")
  }
  
  const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

  user.refreshToken = refreshToken

  await user.save({ validateBeforeSave: false });
  
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  if(!loggedInUser) {
    throw new ApiError(404,"User can't login")
  }

  const option = {
    httpOnly:true,
    secure:process.env.NODE_ENV === "production"
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,option)
  .cookie("refreshToken",refreshToken,option)
  .json(new ApiResponse(
    200,
    {user:accessToken,refreshToken,loggedInUser},
    "Usser logged in successfully"
  ))
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {new:true}
  )

  const option = {
    httpOnly:true,
    secure:process.env.NODE_ENV === "production"
  }

  return res
  .status(200)
  .clearCookie("accessToken",option)
  .clearCookie("refreshToken",option)
  .json(new ApiResponse(200,{},"User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  
  if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
          throw new ApiError(401, "Invalid refresh token")
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expired or used")
          
      }
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      const {accessToken} = await generateAccessAndRefreshToken(user._id)
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(
          new ApiResponse(
              200, 
              {accessToken:accessToken, refreshToken: user.refreshToken},
              "Access token refreshed"
          )
      )
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})



const changeUserPassword = asyncHandler(async (req,res) => {
  const {oldPassword,newPassword} = req.body

  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect) {
    return new ApiError(401,"Invalid old password") 
  }

  user.password = newPassword

  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully"))
})
const getCurrentUser = asyncHandler(async (req,res) => {
  const { _id, username, email, refreshToken } = req.user;
  return res
  .status(200)
  .json(new ApiResponse(200, { _id, username, email, refreshToken }, "User details")
  );
})
const updateAccountDetail = asyncHandler(async (req,res) => {
  const {fullname, email} = req.body

  if(!fullname || !email) {
    throw new ApiError(400,"Fullname and email is required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname,
        email:email.toLowerCase()
      }
    }

  ).select("-password -refreshToken")

  return res.status(200).json(new ApiResponse(200,user,"User details updated successfully"))
  

})
const updateUserCover = asyncHandler(async (req,res) => {
  
  const coverLocalPath = req.file.path
  
  if(!coverLocalPath) {
    throw new ApiError(400,"File is required")
  }

  const coverImage = await uploadOnCloudinary(coverLocalPath)

  if(!coverImage.url) {
    throw new ApiError(500,"Something went wrong while uploading coverImage")  
  }

  const existingUser = await User.findById(req.user?._id)

  try {
    if(existingUser?.coverImagePublic_Id) {
      await deleteFromCloudinary(existingUser?.coverImagePublic_Id,"image")
    }

    existingUser.coverImagePublic_Id = coverImage.public_Id
    existingUser.coverImage = coverImage.url

    await existingUser.save({validateBeforeSave:false})
    const userResponse = existingUser.toObject()
    delete userResponse.password  
    delete userResponse.refreshToken

    res.status(200).json(new ApiResponse(200,userResponse,"CoverImage updated successfully"))

  } catch (error) {
    throw new ApiError(500,"Something went wrong while deleting previous CoverImage")
  }
})
const updateUserAvatar = asyncHandler(async (req,res) => {

  const avatarLocalPath = req.file.path
  
  if(!avatarLocalPath) {
    throw new ApiError(400,"File is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url) {
    throw new ApiError(500,"Something went wrong while uploading avatar")  
  }

  const existingUser = await User.findById(req.user?._id)

  try {
    if(existingUser?.avatarPublic_Id) {
      await deleteFromCloudinary(existingUser?.avatarPublic_Id,"image")
    }

    existingUser.avatarPublic_Id = avatar.public_id
    existingUser.avatar = avatar.url

    await existingUser.save({validateBeforeSave:false})
    const userResponse = existingUser.toObject()
    delete userResponse.password  
    delete userResponse.refreshToken

    res.status(200).json(new ApiResponse(200,userResponse,"Avatar updated successfully"))

  } catch (error) {
    throw new ApiError(500,"Something went wrong while deleting previous avatar")
  }
})
const getUserChannelProfile = asyncHandler(async (req,res) => {
  const userName = req.params
  console.log(userName.userName)
  if(!userName.userName.trim()) {
    throw new ApiError(400,"Username is required")
  }

  const channel = await User.aggregate(
    [{
      $match:{
        username:userName.userName?.toLowerCase()
      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"Channel",
        as:"subscribers"
      }
    },
  {
    $lookup:{
      from:"subscriptions",
      localField:"_id",
      foreignField:"Subscriber",
      as:"subscribedTo"
    }
  },
  {
    $addFields:{
      subscriberCount:{$size:"$subscribers"},
      channelsSubscribedToCount:{$size:"$subscribedTo"}
    }
  },
  {
    $project:{
      fullName:1,
      username:1,
      avatar:1,
      coverImage:1,
      subscriberCount:1,
      channelsSubscribedToCount:1,
      isSubscribed:1,
      coverImage:1,
      email:1
    }    

  }]
  )

  if(!channel?.length){
      throw new ApiError(404,"Channel not found")
  }

  return res.status(200).json(new ApiResponse(200,channel[0],"Channel details"))
})
const getWatchHistory = asyncHandler(async (req,res) => {
  const user = await User.aggregate([
    {$match:{
      _id:new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup:{
        from:"Video",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[ 
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner: {$first: "$owner"}
            }
          }
        ]
      }
    },
  ])

  return res.status(200).json(new ApiResponse(200,user[0],"Watch history"))
})

export { registerUser,loginUser, logoutUser,refreshAccessToken,changeUserPassword,getCurrentUser,updateAccountDetail,updateUserAvatar,updateUserCover,getUserChannelProfile,getWatchHistory } 

