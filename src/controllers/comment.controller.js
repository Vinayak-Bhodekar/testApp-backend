import mongoose,{isValidObjectId} from "mongoose"
import { Comment } from "../models/comment.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    const {page=1,limit=10} = req.query

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400,"videoId is not valid")
    }
    if(!videoId) {
        throw new ApiError(400,"videoId is required")
    }
    if(!page || !limit) {
        throw new ApiError(400,"page and limit is required")
    }

    const comments = await Comment.find({video:videoId})
    .sort({created:-1})
    .skip((page-1)*limit)
    .limit(parseInt(limit))

    res.status(200).json(new ApiResponse(200,"successfully fetched comments",comments))


    //TODO: get all comments for a video
})

const addComment = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    const {content} = req.body
    const user = req.user._id
    console.log("user",user)
    if(!content) {
        throw new ApiError(400,"content is required")
    }
    if(!videoId) {
        throw new ApiError(400,"videoId is required")
    }

    const comment = await Comment.create({
        content,
        video:new mongoose.Types.ObjectId(videoId),
        owner:user
    })

    console.log("comment",comment)

    if(!comment) {
        throw new ApiError(400,"error in creating a comment")
    }

    res.status(200).json(new ApiResponse(200,"successffully comment created",comment))

    //TODO: add a commnet to a video
})

const updateComment = asyncHandler(async (req,res) => {
    const {content} = req.body
    const user = req.user._id
    const {commentId} = req.params

    if(!content) {
        throw new ApiError(400,"content is required")
    }
    if(!commentId) {
        throw new ApiError(400,"commentId is required")
    }

    const comment = await Comment.findByIdAndUpdate(commentId,{content},{new:true})

    if(!comment) {
        throw new ApiError(400,"error in updating a comment")
    }

    res.status(200).json(new ApiResponse(200,"successffully comment updated",comment))


    
    //TODO: update a comment
})

const deleteComment = asyncHandler(async (req,res) => {
    //TODO: delete a comment
    const {commentId} = req.params

    
    if(!commentId) {
        throw new ApiError(400,"commentId is required")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment) {
        throw new ApiError(400,"error in updating a deleting")
    }

    res.status(200).json(new ApiResponse(200,"successffully comment deleted",comment))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}