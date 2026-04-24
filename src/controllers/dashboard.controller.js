import mongoose,{isValidObjectId} from "mongoose"
import { Video } from "../models/video.models.js"
import { subscription } from "../models/subscription.models.js"
import { like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req,res) => {
    const userId = req.user?._id
    
    if(!isValidObjectId(userId)){
        return next(new ApiError("Invalid user id",400))
    }

    if(!userId){
        return next(new ApiError("User not found",404))
    }

    const totalVideos = await Video.countDocuments({owner:userId})

    const totalSubscribers = await subscription.countDocuments({channel:userId})

    const totalLikes = await like.countDocuments({owner:userId})

    const totalViews = await Video.aggregate([
        {
            $match: {
                owner:userId
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {$sum: "$views"}
            }
        }
    ])

    const total = totalViews[0]?.totalViews || 0



    
    res.status(200).json(new ApiResponse(200,"Channel stats fetched successfully",{
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    }))
    
    //TODO : get the channel stats like total videos, video views, subscribers,like
})
const getChannelVideos = asyncHandler(async (req,res) => {

    const user = req.user._id

    if(!user) {
        throw new ApiError(400,"userId is required")
    }

    const video = await Video.find({owner:user}).select("-__v -createdAt -updatedAt -thumbnail -owner -isPublished -views -__v")

    if(video.length !== 0) {
        res.status(200).json(new ApiResponse(200,"video successfully fetched",video))
    }

    res.status(200).json(new ApiResponse(200,"no video by user"))
    //TODO : get all the videos uploaded by  the channel
})

export {
    getChannelStats,
    getChannelVideos
}