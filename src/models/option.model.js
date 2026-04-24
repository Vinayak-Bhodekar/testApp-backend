const optionSchema = new mongoose.Schema({
  text: String,
  isCorrect: Boolean,
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  }
});

export default mongoose.model("Option", optionSchema);