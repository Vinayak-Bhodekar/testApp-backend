import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  })
)

//common middleware

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import healthCheckRouter  from "./routes/healthCheck.routes.js"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js";
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import likeRouter from  "./routes/like.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import commentRouter from "./routes/comment.routes.js"



app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/Video", videoRouter)
app.use("/api/v1/Tweets", tweetRouter)
app.use("/api/v1/Subscription", subscriptionRouter)
app.use("/api/v1/Playlist", playlistRouter)
app.use("/api/v1/Like", likeRouter)
app.use("/api/v1/Dashboard", dashboardRouter)
app.use("/api/v1/Comment", commentRouter)


app.use(errorHandler)

export {app};
