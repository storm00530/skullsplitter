const mongoose = require("../services/mongoose").mongoose;

const Schema = mongoose.Schema;

const CollectionsModel = new Schema(
  {
    id: {
      type: String,
    },
    title: {
      type: String,
    },
    imgSRC: {
      type: String,
    },
    discount_percent: {
      type: Number,
    },
    discount_min: {
      type: Number,
    },
    discount_max: {
      type: Number,
    },
    discount_code: {
      type: String,
    },
    left_number: {
      type: Number,
    },
  },
  { strict: false },
  { _id: false },
  {
    collection: "discounted_collections",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("CollectionsModel", CollectionsModel);
