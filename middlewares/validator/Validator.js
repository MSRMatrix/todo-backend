import {validationResult, body} from "express-validator"

export const validateRequest = (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      return next();
    }
    res.status(422).send({ errors: result.array() });
  }

export const categoryValidator = [
    body("name")
    .notEmpty()
    .withMessage("Name required")
    .trim()
    .escape(),
    body("limitedBudget")
    .notEmpty()
    .withMessage("Budget required")
    .trim()
    .isString()
    .escape()
]