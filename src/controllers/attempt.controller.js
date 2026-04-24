import Attempt from "../models/Attempt.js";
import Answer from "../models/Answer.js";
import Option from "../models/Option.js";

export const submitAttempt = async (req, res) => {
  const { testId, answers } = req.body;

  const attempt = await Attempt.create({
    userId: req.user.id,
    testId
  });

  let score = 0;

  for (let ans of answers) {
    const option = await Option.findById(ans.selectedOptionId);

    if (option?.isCorrect) score++;

    await Answer.create({
      attemptId: attempt._id,
      ...ans
    });
  }

  attempt.score = score;
  await attempt.save();

  res.json({ score });
};