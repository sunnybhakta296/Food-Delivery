import { CustomerPayload } from "./Customer.dto";
import { VendorPayload } from "./Vendor.dto";

export type AuthPayload = CustomerPayload | VendorPayload;
