const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    // isLoggedIn: false,
    errors: [],
    oldInput:{email:''},
    // user: {},
  });
};

exports.postLogin = async(req, res, next) => {
  // console.log("User Login Info:", req.body);
  // req.islLoggedIn = true;
  // res.cookie("isLoggedIn", true);
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return res.status(422).render("auth/login",{
      pageTitle: "Login",
      currentPage: "Login",
      // isLoggedIn: false,
      errors: ["User does not exist"],
      oldInput: {email},
      // user: {}

    })
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch){
    return res.status(422).render("auth/login",{
      pageTitle: "Login",
      currentPage: "Login",
      // isLoggedIn: false,
      errors:["Invalid Password"],
      oldInput: {email},
      // user: {},
    })
  }
  req.session.isLoggedIn = true;
  req.session.user = {
    _id: user._id.toString(),
    email: user.email,
    userType: user.userType,
    firstName: user.firstName,
  };

   req.session.save(() => {
    res.redirect("/");
  });
};


exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    // isLoggedIn: false,
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      // password: "",  remove password for security reasons
      userType: "",
    },
    // user: {},
  });
};

exports.postSignup = [

  check("firstName")
  .notEmpty()
  .withMessage("First name is required.")
  .trim()
  .isLength({ min: 2})
  .withMessage("First name must be at least 2 characters long.")
  .matches(/^[A-Za-z]+$/)
  .withMessage("First name must contain only letters."),

  check("lastName")
  .matches(/^[A-Za-z]*$/)
  .withMessage("Last name must contain only letters."),

  check("email")
  .isEmail()
  .withMessage("Please enter a valid email address.")
  .normalizeEmail(),

  check("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters long.")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter.")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter.")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number.")
  .matches(/[\W_]/)
  .withMessage("Password must contain at least one special character.")
  .trim(),

  check("confirmPassword")
  .trim()
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match.");
    }
    return true;
  }),

  check("userType")
  .notEmpty()
  .withMessage("Please select the user type.")
  .isIn(['guest', 'host'])
  .withMessage("Invalid user type selected."),

  check("terms")
  .notEmpty()
  .withMessage("You must accept the terms and conditions.")
  .custom((value) => {
    if (value !== 'on') {
      throw new Error("You must accept the terms and conditions.");
    }
    return true;
    }),

  
  (req, res, next) => {

    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        // isLoggedIn: false,
        errors: errors.array().map(err => err.msg),
        oldInput: { firstName, lastName, email, password, userType },
        // user: {},
      });
    }
    // console.log(req.body);
    // req.islLoggedIn = true;
    // res.cookie("isLoggedIn", true);
    // req.session.isLoggedIn = true;
    bcrypt.hash(password,12)
    .then(hashedPassword => {
      const user = new User({firstName, lastName, email, password: hashedPassword, userType});
      return user.save()
    })
    .then(() => {
      // console.log("User signed up:", user);
      res.redirect("/login");
    })
    .catch(err => {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        // isLoggedIn: false,
        errors: [err.message],
        oldInput: { firstName, lastName, email, userType },
        // user: {},
      });
    });
  }];




exports.postLogout = (req, res, next) => {
  // req.islLoggedIn = false;
  req.session.destroy(() => {
    res.redirect("/login");
  })
}
