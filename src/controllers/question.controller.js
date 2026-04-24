import Question from "../models/Question.js";
import Option from "../models/Option.js";

export const addQuestion = async (req, res) => {
  const { text, testId, options } = req.body;

  const question = await Question.create({ text, testId });

  const opts = options.map(opt => ({
    ...opt,
    questionId: question._id
  }));

  await Option.insertMany(opts);

  res.json({ question });
};