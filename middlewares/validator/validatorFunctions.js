import { validationResult, body } from "express-validator";

export const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }
  res.status(422).send({ errors: result.array() });
};

export const userValidator = [
  body("username")
    .notEmpty()
    .withMessage("Username is required!")
    .trim()
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("Password is required!")
    .trim()
    .isStrongPassword()
    .withMessage(
      `Password is not strong enough! 
       A capital letter, number and 
        sign must be present!`
    )
    .isLength({ min: 8 })
    .withMessage("Passwort muss mindestens 8 Zeichen lang sein!")
    .escape(),
  body("email")
    .notEmpty()
    .withMessage("Email is required!")
    .trim()
    .isEmail()
    .withMessage("Email must be legit!")
    .normalizeEmail()
    .escape(),
];

export const listValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required!")
    .trim()
    .escape(),
    body("description")
    .trim()
    .escape(),
];

export const taskValidator = [
  body("task")
    .notEmpty()
    .withMessage("Task is required!")
    .trim()
    .escape(),
];

export const userUpdateValidator = (fieldsToUpdate) => {
  const validators = [];

  if (fieldsToUpdate.includes("username")) {
    validators.push(
      body("username")
        .if(body("username").exists({ checkFalsy: true }))
        .trim()
        .isString()
        .withMessage("Der Benutzername muss ein String sein.")
        .escape()
    );
  }

  if (fieldsToUpdate.includes("password")) {
    validators.push(
      body("password")
        .if(body("password").exists({ checkFalsy: true }))
        .trim()
        .isStrongPassword()
        .withMessage("Das Passwort ist nicht stark genug.")
        .isLength({ min: 8 })
        .withMessage("Das Passwort muss mindestens 8 Zeichen lang sein.")
        .escape()
    );
  }

  if (fieldsToUpdate.includes("email")) {
    validators.push(
      body("email")
        .if(body("email").exists({ checkFalsy: true }))
        .trim()
        .isEmail()
        .withMessage("Die angegebene E-Mail-Adresse ist nicht gültig.")
        .normalizeEmail()
        .escape()
    );
  }

  return validators;
};


export const taskUpdateValidator = (fieldsToUpdate) => {
  const validators = [];

  if (fieldsToUpdate.includes("task")) {
    validators.push(
      body("task")
        .if(body("task").exists({ checkFalsy: true }))
        .trim()
        .isString()
        .notEmpty()
        .escape()
    );
  }

  return validators;
};

export const listUpdateValidator = (fieldsToUpdate) => {
  const validators = [];

  if (fieldsToUpdate.includes("name")) {
    validators.push(
      body("name")
        .if(body("name").exists({ checkFalsy: true }))
        .trim()
        .isString()
        .notEmpty()
        .escape()
    );
  }

  if (fieldsToUpdate.includes("description")) {
    validators.push(
      body("description")
        .if(body("description").exists({ checkFalsy: true }))
        .trim()
        .isString()
        .notEmpty()
        .escape()
    );
  }

  return validators;
};