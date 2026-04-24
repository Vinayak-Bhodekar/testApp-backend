import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    

    const sortOption = {}

    sortOption[sortBy] = sortType === "asc" ? 1:-1

    const VideoHistory = await Video.aggregate([
        {
            $match: {
                owner:new mongoose.Types.ObjectId(userId),
                ...(query && {
                    $or : [
                        {title: {$regex:query, $options:"i"}},
                        {description: {$regex:query, $options:"i"}}
                    ]
                })   
            }
        },
        {$sort:sortOption},
        {$skip: (page-1)*limit}, 
        {$limit:parseInt(limit)}
    ])

    res.status(200).send(new ApiResponse(200,VideoHistory,"User video History fetched"))
 })

const publishAVideo = asyncHandler(async (req, res) => {
    console.log("public Video call")
    const { title, description} = req.body

    const videoFile = req.files?.videoFile?.[0]?.path
    const thumbNail = req.files?.thumbNail?.[0]?.path

    if(!videoFile)
        throw new ApiError(400, "Please upload a video file")

    if(!thumbNail)
        throw new ApiError(400, "Please upload a thumbNail file")

    console.log("videoFile", videoFile)
    console.log("thumbNail", thumbNail)
    const uploadedVideo = await uploadOnCloudinary(videoFile)
    const uploadedThumbnail = await uploadOnCloudinary(thumbNail)
    
    if(!uploadedVideo)
        throw new ApiError(500, "Error uploading video")


    if(!uploadedThumbnail)
        throw new ApiError(500, "Error uploading thumbnail")

    const newVideo = await Video.create({
        title,
        description,
        owner: req.user._id,
        videoFile: {
            url: uploadedVideo.secure_url,
            publicId: uploadedVideo.public_id
        },
        thumbnail:{
            url:uploadedThumbnail.secure_url,
            publicId:uploadedThumbnail.public_id
        } , 
        views: 0,
        isPublished: true
    })
    
    res.status(201).json(new ApiResponse(201, newVideo, "Video uploaded successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    
    const { videoId } = req.params
    const video = await Video.findById(videoId).select("-__v")

    if(!video) {
        throw new ApiError(404, "Video not found")  
    }
    
    

    const { _id, title, description, videoFile, thumbnail, views, isPublished } = video
    const owner = await User.findById(video.owner).select("-__v -password -refreshToken")   

    if(!owner) {
        throw new ApiError(404, "User not found")  
    }
    const videoDetails = {
        _id,
        title,
        description,
        videoFile,
        thumbnail,
        views,
        isPublished,
        owner: {
            _id: owner._id,
            name: owner.name,
            email: owner.email
        }
    }
    res.status(200).json(new ApiResponse(200, videoDetails, "Video details fetched successfully"))
    
})

const updateVideo = asyncHandler(async (req, res) => {
    console.log("update video called")
    const { videoId } = req.params
    const {title,description} = req.body
    const thumbNail = req.file?.path

    const video = await Video.findById(videoId)

    if(!thumbNail) {
        throw new ApiError(400,"Please upload a thumbnail")
    }
    
    if(!video) {
        throw new ApiError(404,"videoID not found")
    }

    await deleteFromCloudinary(video.thumbnail.publicId,"image")

    const response = await uploadOnCloudinary(thumbNail)

    if(!response) {
        throw new ApiError(500,"Error uploading thumbnail")
    }

    video.thumbnail.url = response.secure_url
    video.thumbnail.publicId = response.public_id
    video.title = title
    video.description = description
    await video.save({validateBeforeSave:false})

    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))

    
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    try {
            
        await deleteFromCloudinary(video.videoFile.publicId,"video")
        await deleteFromCloudinary(video.thumbnail.publicId,"image")
    
        await Video.findByIdAndDelete(videoId)
    
        res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"))
        
    } catch (error) {
        res.status(500).json(new ApiResponse(500, null, "Error deleting video:-",error))    
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404,"video not found by videoId:",videoId)
    }

    video.isPublished = video.isPublished ? false : true

    await video.save({validateBeforeSave:false})

    res.status(200).send(new ApiResponse(201,"isPublished toggle successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}