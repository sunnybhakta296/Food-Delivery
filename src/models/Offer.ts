import mongoose, { Schema } from "mongoose";

export interface OfferDoc extends Document {
  offerType: string;
  vendors: [any];
  title: string;
  description: string;
  minValue: number;
  offerAmount: number;
  startValidity: Date;
  endValidity: Date;
  promocode: string;
  promoType: string;
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}

const OfferSchema = new Schema({
  offerType: { type: String, require: true },
  vendors: { type: mongoose.Types.ObjectId, required: true },
  title: { type: String, require: true },
  description: { type: String },
  minValue: { type: Number, require: true },
  offerAmount: { type: Number, require: true },
  startValidity: Date,
  endValidity: Date,
  promocode: { type: String, require: true },
  promoType: { type: String, require: true },
  bank: [{ type: String }],
  bins: [{ type: Number }],
  pincode: { type: String, required: true },
  isActive: Boolean,
});

const Offer = mongoose.model<OfferDoc>("order", OfferSchema);
export { Offer };
