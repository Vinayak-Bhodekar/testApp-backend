import mongoose, {isValidObjectId} from "mongoose"
import {playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    const user = req.user

    if(!name || !description) {
        return res.status(400).send(new ApiResponse("Please provide all fields", false, null))
    }

    const playlistExists = await playlist.findOne({name, owner: user._id})

    if(playlistExists) {
        throw new ApiError(400, "Playlist already exists")
    }

    const newPlaylist = await playlist.create({
        name,
        description,
        owner: user._id
    })

    const Playlist = await playlist.findById(newPlaylist._id).select("-__v")

    if(!newPlaylist) {
        throw new ApiError(500, "Could not create playlist")
    }

    res.status(201).send(new ApiResponse("Playlist created successfully", true, Playlist))

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user._id
    
    if(!userId) {
        throw new ApiError(404,"userId is required")   
    }

    console.log(userId)
    if(!isValidObjectId(userId)) {
        throw new ApiError(400,"userId is not valid")   
    }

    const playList = await playlist.find({owner:userId}).select("__v")

    if(!playList || playList.length === 0) {
        throw new ApiError(404,"Playlist not found")
    }

    res.status(200).json(new ApiResponse(200,"playList fetched successfully",playList))
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId) {
        throw new ApiError(404,"playlistId is required")   
    }

    const playList = await playlist.findById(playlistId).select("-__v")

    if(!playList) {
        throw new ApiError(404,"Playlist not found")
    }

    res.status(200).json(new ApiResponse(200,"playList fetched successfully",playList))
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    const video = new mongoose.Types.ObjectId(videoId)
    
    console.log(typeof video)
    if(!playlistId || !video) {
        throw new ApiError(404,"playlistId and videoId are required")   
    }

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400,"playlistId and videoId are not valid")   
    }

    const playList = await playlist.findById(playlistId).select("-__v")
    console.log("playlist",playList)    
    if(!playList) {
        throw new ApiError(404,"Playlist not found")
    }

    const videoExists = playList.videos.filter(video => video._id.toString() === videoId)
    console.log("videoExists",videoExists)
    if(videoExists.length !== 0) {
        throw new ApiError(400,"Video already exists on playlist")
    }
    
    playList.videos.push(videoId)
    await playList.save({validateBeforeSave:false})

    const updatedPlaylist = await playlist.findById(playlistId).select("-__v")

    if(!updatedPlaylist) {
        throw new ApiError(500,"Could not update playlist")
    }

    res.status(200).json(new ApiResponse(200,"Video added to playlist successfully", updatedPlaylist))
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const video = new mongoose.Types.ObjectId(videoId)

    if(!playlistId || !videoId) {
        throw new ApiError(404,"playlistId and videoId are required")   
    }

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400,"playlistId and videoId are not valid")   
    }

    const playList = await playlist.findById(playlistId).select("-__v")

    if(!playList) {
        throw new ApiError(404,"Playlist not found")
    }

    const videoExists = playList.videos.filter(video => video._id.toString() === videoId)   

    if(videoExists.length === 0) {
        throw new ApiError(400,"Video does not exists on playlist")
    }

    playList.videos = playList.videos.filter(video => video._id.toString() !== videoId)

    await playList.save({validateBeforeSave:false})

    const updatedPlaylist = await playlist.findById(playList._id).select("-__v")

    if(!updatedPlaylist) {
        throw new ApiError(500,"Could not update playlist")
    }

    res.status(200).json(new ApiResponse(200,"Video removed from playlist successfully", updatedPlaylist))
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId) {
        throw new ApiError(404,"playlistId is required")   
    } 

    console.log("playlist",playlistId) 

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400,"playlistId is not valid")   
    }

    const playList = await playlist.findById(playlistId)

    console.log("playlist",playList) 

    if(!playList) {
        throw new ApiError(404,"Playlist not found")
    }

       

    const deletedPlaylist = await playlist.findByIdAndDelete(playlistId).select("-__v")

    if(!deletedPlaylist) {
        throw new ApiError(500,"Could not delete playlist")
    }

    res.status(200).json(new ApiResponse(200,"Playlist deleted successfully", deletedPlaylist))
    // TODO: delete playl   ist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!playlistId) {
        throw new ApiError(404,"playlistId is required")   
    }   

    if(!isValidObjectId(playlistId)) {      
        throw new ApiError(400,"playlistId is not valid")   
    }

    if(!name && !description) {
        throw new ApiError(400,"Please provide name or description to update")
    }

    const playList = await playlist.findById(playlistId).select("-__v")

    if(!playList) {
        throw new ApiError(404,"Playlist not found")
    }

    if(name) {
        playList.name = name
    }

    if(description) {
        playList.description = description
    }

    await playList.save({validateBeforeSave:false})

    res.status(200).json(new ApiResponse(200,"Playlist updated successfully", playList))
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}