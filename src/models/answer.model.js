const answerSchema = new mongoose.Schema({
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attempt"
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  },
  selectedOptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Option"
  }
});

export default mongoose.model("Answer", answerSchema);