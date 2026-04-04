const mongoose = require('mongoose');

const MarketplaceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Electronics', 'Books', 'Furniture', 'Other'],
      default: 'Other',
    },
    sellerName: { type: String, required: true },
    sellerContact: { type: String, required: true },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MarketplaceItem', MarketplaceItemSchema);

