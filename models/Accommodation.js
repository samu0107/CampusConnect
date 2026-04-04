const mongoose = require('mongoose');

<<<<<<< HEAD
const accommodationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  price: { type: Number, required: true, min: 0 },
  distance: { type: Number, required: true, min: 0 },
  distanceUnit: { type: String, enum: ['km', 'm'], default: 'km' },
  address: { type: String, required: true },
  photos: {
    type: [String],
    validate: {
      validator: (v) => v.length >= 2 && v.length <= 5,
      message: 'Must have between 2 and 5 photos'
    },
    required: true
  },
  facilities: [{
    type: String,
    enum: ['WiFi','Parking','Kitchen','Air Conditioning',
           'Hot Water','Security','Study Room','CCTV',
           'Furnished','Water Included','Electricity Included']
  }],
  owner: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  gender: { type: String, enum: ['Male','Female','Any'], default: 'Any' },
  availableRooms: { type: Number, default: 1, min: 0 },
  isAvailable: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Accommodation', accommodationSchema);
=======
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

>>>>>>> b22d0fe6145d37fbe98664d2543db0f55edd837c
