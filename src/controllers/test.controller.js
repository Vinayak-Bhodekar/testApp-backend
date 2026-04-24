import Test from "../models/Test.js";

export const createTest = async (req, res) => {
  const test = await Test.create({
    ...req.body,
    createdBy: req.user.id
  });
  res.json(test);
};

export const getTests = async (req, res) => {
  const tests = await Test.find().populate("createdBy");
  res.json(tests);
};