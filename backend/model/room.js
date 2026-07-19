const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    // Hotel Reference
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotels",
      required: true,
    },

    // Basic Information
    roomName: {
      type: String,
      required: true,
      trim: true,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    floor: {
      type: Number,
      default: 1,
    },

    roomType: {
      type: String,
      enum: [
        "Single",
        "Double",
        "Twin",
        "Queen",
        "King",
        "Suite",
        "Deluxe",
        "Family",
        "Executive",
        "Presidential",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // Capacity
    roomSize: Number, // sqft

    adults: {
      type: Number,
      default: 2,
    },

    children: {
      type: Number,
      default: 0,
    },

    maxGuests: {
      type: Number,
      default: 2,
    },

    // Bed
    beds: {
      type: Number,
      default: 1,
    },

    bedType: {
      type: String,
      enum: [
        "Single",
        "Double",
        "Queen",
        "King",
        "Twin",
        "Sofa",
      ],
    },

    // Pricing
    price: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    finalPrice: Number,

    tax: {
      type: Number,
      default: 18,
    },

    weekendPrice: Number,

    festivalPrice: Number,

    extraBedPrice: Number,

    // Availability
    totalRooms: {
      type: Number,
      default: 1,
    },

    availableRooms: {
      type: Number,
      default: 1,
    },

    bookingStatus: {
      type: String,
      enum: [
        "Available",
        "Booked",
        "Maintenance",
      ],
      default: "Available",
    },

    // Images
    images: [
      {
        type: String,
      },
    ],

    // Amenities
    wifi: Boolean,

    ac: Boolean,

    heater: Boolean,

    fan: Boolean,

    smartTV: Boolean,

    ott: Boolean,

    telephone: Boolean,

    refrigerator: Boolean,

    microwave: Boolean,

    kettle: Boolean,

    coffeeMachine: Boolean,

    wardrobe: Boolean,

    workDesk: Boolean,

    sofa: Boolean,

    diningTable: Boolean,

    iron: Boolean,

    locker: Boolean,

    // Bathroom
    attachedBathroom: Boolean,

    bathtub: Boolean,

    shower: Boolean,

    hotWater: Boolean,

    toiletries: Boolean,

    hairDryer: Boolean,

    // View
    balcony: Boolean,

    roomView: {
      type: String,
      enum: [
        "City",
        "Garden",
        "Mountain",
        "Sea",
        "Pool",
      ],
    },

    // Meals
    breakfast: Boolean,

    lunch: Boolean,

    dinner: Boolean,

    // Services
    roomService: Boolean,

    laundry: Boolean,

    housekeeping: Boolean,

    wakeupCall: Boolean,

    newspaper: Boolean,

    // Hotel Facilities
    parking: Boolean,

    swimmingPool: Boolean,

    gym: Boolean,

    spa: Boolean,

    restaurant: Boolean,

    bar: Boolean,

    // Accessibility
    wheelchair: Boolean,

    lift: Boolean,

    // Safety
    smokeDetector: Boolean,

    fireExtinguisher: Boolean,

    cctv: Boolean,

    electronicLock: Boolean,

    // Policies
    smoking: Boolean,

    pets: Boolean,

    coupleFriendly: Boolean,

    localIdAccepted: Boolean,

    refundable: Boolean,

    instantBooking: Boolean,

    // Rating
    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // Status
    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("rooms", roomSchema);