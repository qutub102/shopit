const Product = require("../models/products");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const APIFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

const createProduct = catchAsyncError(async (req, res, next) => {
  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  let imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "shopit/products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;

  req.body.user = req.user.id;
  const savedProduct = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product: savedProduct,
  });
});

const getProducts = catchAsyncError(async (req, res, next) => {
  // return next(new ErrorHandler("My Error", 400));

  const resPerPage = 4;
  const productCount = await Product.countDocuments();
  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter();

  let products = await apiFeatures.query;
  const filterProductsCount = products.length;

  apiFeatures.pagination(resPerPage);
  products = await apiFeatures.query;

  // if (products.length === 0)
  //   return next(new ErrorHandler("Product not found", 404));
  // res.status(404).json({ message: "Products not avaliable" });

  // setTimeout(() => {
  res.status(200).json({
    success: true,
    count: products.length,
    productCount,
    resPerPage,
    filterProductsCount,
    products,
  });
  // }, 1000);
});

const getProductById = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product not found", 404));
  // return res.status(404).json({
  //   success: false,
  //   message: "Product Not Found!",
  // });

  res.status(200).json({ success: true, product });
});

const updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));
  // req.body.user = req.user.id;

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting images associated with the product
    for (let i = 0; i < product.images.length; i++) {
      const result = await cloudinary.v2.uploader.destroy(
        product.images[i].public_id
      );
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "shopit/products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

const deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));

  // Deleting images associated with the product
  for (let i = 0; i < product.images.length; i++) {
    const result = await cloudinary.v2.uploader.destroy(
      product.images[i].public_id
    );
  }

  await product.remove();
  res
    .status(200)
    .json({ success: true, message: "Product Deleted Successfully" });
});

const createReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: +rating,
    comment,
  };
  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find((r) => {
    return r.user.toString() === req.user._id.toString();
  });
  if (isReviewed) {
    product.reviews.forEach((r) => {
      if (r.user.toString() === req.user._id.toString()) {
        r.comment = comment;
        r.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numofReviews = product.reviews.length;
  }
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
  });
});

const getAllReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.json({ success: true, rating: product.rating, reviews: product.reviews });
});

const deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  const reviews = product.reviews.filter(
    (r) => r._id.toString() !== req.query.id.toString()
  );

  const numofReviews = reviews.length;

  let rating;
  if (reviews.length === 0) {
    rating = 0;
  } else {
    rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
  }
  console.log(rating);
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      rating,
      numofReviews,
    },
    { new: true, runValidators: true, useFindAndModify: false }
  );

  res.json({ success: true });
});

const getAdminProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find().sort({ natural: -1 });

  res.json({
    success: true,
    products,
  });
});

module.exports = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  createReview,
  getAllReviews,
  deleteReview,
  getAdminProducts,
};
