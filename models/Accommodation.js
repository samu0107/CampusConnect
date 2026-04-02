const mongoose = require('mongoose');

const AccommodationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    rent: { type: Number, required: true },
    location: { type: String, required: true }, // e.g., Malabe
    address: { type: String, required: true }, // e.g., 123 Kaduwela Road
    propertyType: { type: String, enum: ['Room', 'Full House', 'Hostel'], required: true },
    targetGender: { type: String, enum: ['Boys', 'Girls', 'Any'], required: true },
    ownerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    imageUrls: [{ type: String }],
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    submittedBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Accommodation', AccommodationSchema);

