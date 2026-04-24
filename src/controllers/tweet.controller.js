import mongoose, { isValidObjectId } from "mongoose"
import {tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => { 
    const {content} = req.body
    const userId = req.user?._id
    console.log("userId",userId)    

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const newTweet = await tweet.create({
        content,
        owner:userId
    })

    res.status(201).send(new ApiResponse(201, "Tweet created successfully", newTweet))

})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const allTweets = await tweet.find({owner:userId}).select("-__v -tweetId")

    if(!allTweets || allTweets.length === 0) {
        throw new ApiError(404, "No tweets found for this user")
    }

    res.status(200).send(new ApiResponse(200, "Tweets fetched successfully", allTweets))
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {content} = req.body 

    const userId = req.user?._id
    if(!content) {
        throw new ApiError(400, "tweetgg  is required")
    }

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweetToUpdate = await tweet.findByIdAndUpdate(
        tweetId,
        {
          $set:{
            content
          }
        }
    
      ).select("-__v")

    if(tweetToUpdate.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this tweet")
    }

    if(!tweetToUpdate) {
        throw new ApiError(404, "Tweet not found")
    }

    res.status(200).send(new ApiResponse(200, "Tweet updated successfully", tweetToUpdate)) 


    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id
    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }   

    const tweetToDelete = await tweet.findByIdAndDelete(tweetId).select("-__v") 

    if(tweetToDelete.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }

    if(!tweetToDelete) {        
        throw new ApiError(404, "Tweet not found")
    }

    res.status(200).send(new ApiResponse(200, "Tweet deleted successfully", tweetToDelete)) 

    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}