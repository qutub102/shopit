const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

exports.registerUser = catchAsyncError(async (req, res, next) => {
  let result = {};
  if (req.body.defaultAvatar === "") {
    result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "shopit/avatar",
      width: 150,
      crop: "scale",
    });
  } else {
    result.public_id = req.body.defaultAvatar.split("=")[0];
    result.secure_url = req.body.defaultAvatar.split("=")[1];
  }
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return next(new ErrorHandler("Something is missing!!", 400));

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });
  // const token = await user.generateToken();
  // res.status(201).json({
  //   success: true,
  //   token,
  // });
  sendToken(user, 201, res);
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 401));
  }
  const user = await User.findOne({ email: email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid email or password", 401));
  if (!(await user.matchPassword(password))) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  // const token = await user.generateToken();
  // res.status(201).json({
  //   success: true,
  //   token,
  // });
  sendToken(user, 201, res);
});

exports.logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logout",
    });
});

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new ErrorHandler("User not found with this email", 404));

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // const resetUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/vi/password/reset/${resetToken}`;

  // const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  // const message = `Your password reset token is as follow :\n\n${resetUrl}\n\nIf you have not requested this email,then ignore it`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="${resetUrl}">link</a> to set a new password.</p>
          `,
    });
    res.status(200).json({
      success: true,
      message: "Email send to " + user.email,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword)
    return next(new ErrorHandler("Password does not match", 400));

  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const isMatched = await user.matchPassword(req.body.oldPassword);
  if (!isMatched)
    return next(new ErrorHandler("Old Password you entered is incorrect", 400));

  user.password = req.body.password;
  await user.save();
  sendToken(user, 200, res);
});

exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
  };

  // update avatar =>
  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const image_id = user.avatar.public_id;
    const res = await cloudinary.v2.uploader.destroy(image_id);

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "/shopit/avatar",
      width: 150,
      crop: "scale",
    });

    newUser.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  await User.findByIdAndUpdate(req.user._id, newUser, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({ success: true });
});

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

exports.getUserById = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(
      new ErrorHandler(`User does not found with id : ${req.params.id}`)
    );

  res.status(200).json({ success: true, user });
});

exports.updateUserByAdmin = catchAsyncError(async (req, res, next) => {
  const newUSer = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUSer, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.deleteUserByAdmin = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.id });
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.avatar.public_id !== "shopit/avatar/lxwpcsi6hhbfjhcypg4n") {
    // Remove avatar from cloudinary
    const image_id = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(image_id);
  }

  await user.remove();
  res.status(200).json({
    success: true,
  });
});
