import mongoose, { Document, Schema } from "mongoose";

export interface TransactionDoc extends Document {
  customer: string;
  vendorId: string;
  orderId: string;
  orderValue: string;
  offerUsed: string;
  status: string;
  paymentMode: string;
  paymentResponse: string;
}

const TransactionSchema = new Schema(
  {
    customer: String,
    vendorId: String,
    orderId: String,
    orderValue: String,
    offerUsed: String,
    status: String,
    paymentMode: String,
    paymentResponse: String,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

const Transaction = mongoose.model<TransactionDoc>(
  "transaction",
  TransactionSchema
);

export { Transaction };
