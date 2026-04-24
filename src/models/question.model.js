const questionSchema = new mongoose.Schema({
  text: String,
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test"
  }
});

export default mongoose.model("Question", questionSchema);