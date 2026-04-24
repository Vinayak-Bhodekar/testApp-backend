import mongoose, { Schema } from "mongoose"; // ✅ Fixed import
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// ✅ Capitalized "Schema" used properly
const videoSchema = new Schema({
  videoFile: {
    type: Object, // ✅ Assuming you're storing Cloudinary object here (with public_id, URL)
    required: true
  },
  thumbnail: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  views: {
    type: Number, // ✅ should be a number, not string
    default: 0    // ✅ recommended default value
  },
  isPublished: {
    type: Boolean,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId, // ✅ FIXED: Schema.Type ❌ → Schema.Types ✅
    ref: "User",
    required: true
  }
}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema); // ✅ Capital "V"
