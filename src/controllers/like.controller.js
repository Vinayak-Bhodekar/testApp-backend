import mongoose,{isValidObjectId, mongo} from "mongoose"
import { like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike =asyncHandler(async (req,res) => {
    const userId = req.user._id
    const {videoId} = req.params
    const videoIdObj = new mongoose.Types.ObjectId(videoId)

    if(!videoId) {
        throw new ApiError(400,"videoId is required")
    }

    if(!userId) {
        throw new ApiError(400,"userId is required")
    }

    const video = await like.findOne({video:videoIdObj})

    if(!video) {
        const createVideoLike = await like.create({
            video:videoIdObj,
            likedBy:userId
        })

        if(!createVideoLike) {
            throw new ApiError(400,"video not like")
        }

        res.status(200).json(new ApiResponse(200,"video liked Successfully",createVideoLike))
    }

    const deleteVideoLike = await like.findByIdAndDelete(video._id)

    res.status(200).json(new ApiResponse(200,"video disliked successfully"))
    //TODO: toggle like an video
})
const toggleCommentLike =asyncHandler(async (req,res) => {
    const {commentId} = req.params

    const commentIdObj = new mongoose.Types.ObjectId(commentId)
    
    if(!commentId) {
        throw new ApiError(400,"commentId is required")
    }

    const comment = await like.findOne({comment:commentIdObj})

    if(!comment) {
        const newComment = await like.create({
            comment:commentIdObj
        })

        if(!newComment) {
            throw new ApiError(400,"comment not created")
        }

        res.status(200).json(new ApiResponse(200,"comment liked successfully"))
    }

    const deleteCommentLike = await like.findByIdAndDelete(comment?._id)

    res.status(200).json(new ApiResponse(200,"disliked comment succesfully"))
    //TODO: toggle like an comment
})
const toggleTweetLike =asyncHandler(async (req,res) => {
    const userId = req.user._id
    const {tweetId} = req.params
    const tweetIdObj = new mongoose.Types.ObjectId(tweetId)

    if(!tweetId) {
        throw new ApiError(400,"tweetId is required")
    }

    if(!userId) {
        throw new ApiError(400,"userId is required")
    }

    const tweet = await like.findOne({tweet:tweetIdObj})

    if(!tweet) {
        const createTweetLike = await like.create({
            tweet:tweetIdObj,
            likedBy:userId
        })

        if(!createTweetLike) {
            throw new ApiError(400,"tweet not like")
        }
        console.log(createTweetLike)

        res.status(200).json(new ApiResponse(200,"tweet liked Successfully",createTweetLike))
    }

    const deleteTweetLike = await like.findByIdAndDelete(tweet._id)

    res.status(200).json(new ApiResponse(200,"tweet disliked successfully"))
    
    //TODO: toggle like an Tweet
})

const getlikedVideos = asyncHandler(async(req,res) => {
    //TODO: get all liked video
    const user = req.user._id

    if(!user) {
        throw new ApiError(400,"userId is required")
    }

    const likedVideos = await like.find(
        {
            likedBy:user,
            video:{$ne:null}
        })

    if(!likedVideos) {
        throw new ApiError(400,"liked videos not found")
    }

    res.status(200).json(new ApiResponse(200,"liked videos",likedVideos))

})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getlikedVideos
}
