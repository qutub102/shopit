const { Schema, model } = require("mongoose");

const orderSchema = Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      phoneNo: {
        type: Number,
        required: true,
      },
      postalCode: {
        type: Number,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    paidAt: {
      type: Date,
    },
    paymentInfo: {
      id: {
        type: String,
      },
      status: {
        type: String,
      },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: { type: Number, required: true, default: 0.0 },
    orderStatus: { type: String, required: true, default: "Processing" },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = model("Order", orderSchema);
