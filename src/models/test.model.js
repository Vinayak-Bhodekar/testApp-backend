const testSchema = new mongoose.Schema({
  title: String,
  description: String,
  category:{
    type:String,
    required:true
  },
  difficulty: {
    type: String,
    enum:["Begginer", "Advanced", "Intermediate"]
  },
  duration: {
    type:Number
  },
  tags: {
    type: [String]
  },
  questions: {
    type:[mongoose.Schema.Types.ObjectId],
    ref:"Question"
  },
  creatorName: {
    type:String
  },
  published: {
    type: Boolean
  },
  totalAttempts:{
    type:Number
  },
  avgScore:{
    type:Number
  },
  passRate:{
    type:Number
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

export default mongoose.model("Test", testSchema);