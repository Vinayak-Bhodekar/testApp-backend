import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    
    const {channelId} = req.params
    const userId = req.user?._id
    const newChannelId = new mongoose.Types.ObjectId(channelId)
      
    if(!userId) {
        throw new ApiError(400, "User not found")
    }
    if(!newChannelId) {
        throw new ApiError(400, "Channel not found")
    }

    const subscribeTo = await User.findById(channelId)

    if(!subscribeTo) {
        throw new ApiError(400, "Invalid channel id")
    }

    const isAlreadySubscribed = await subscription.findOne({
        Channel: newChannelId,
        Subscriber: userId
    })

    console.log("isAlreadySubscribed",isAlreadySubscribed)

    if(isAlreadySubscribed) { 
        await subscription.findByIdAndDelete(isAlreadySubscribed._id)
        res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"))
    }
    else{
        const newSubsrciption = await subscription.create({
            Subscriber:userId,
            Channel: channelId
        })
        if(!newSubsrciption) {
            throw new ApiError(400, "Unable to subscribe")
        }
        res.status(200).send(new ApiResponse(200, "Subscribed successfully",newSubsrciption))
    }

    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user._id

    
    const subscribers = await subscription.find({
        Channel: userId
    }).populate("Subscriber", "name profilePic")

    if(!subscribers) {
        throw new ApiError(400, "Unable to fetch subscribers")
    }
    res.status(200).json(new ApiResponse(200, "Fetched subscribers successfully", subscribers))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const userId = req.user._id
    console.log("userId",userId)
    const subscribedChannels = await subscription.find({
        Subscriber: userId
    })
    console.log("subscribedChannels",subscribedChannels)
    if(!subscribedChannels) {
        return next(new ApiError(400, "Unable to fetch subscribed channels"))
    }
    return res.status(200).json(new ApiResponse(200, "Fetched subscribed channels successfully", subscribedChannels))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}