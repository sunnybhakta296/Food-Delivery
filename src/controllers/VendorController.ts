import { NextFunction, Request, Response } from "express";
import { CreateOfferInputs, EditVendorPayload, VendorLoginInput } from "../dto";
import { Food, Offer, Order, Vendor } from "../models";
import {
  GenerateSignature,
  validatePassword,
} from "../utility/PasswordUtility";
import { CreateFoodInput } from "../dto/Food.dto";

export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VendorLoginInput>req.body;

  const exitstingUser = await Vendor.findOne({ email });

  if (exitstingUser) {
    const validation = await validatePassword(
      password,
      exitstingUser.password,
      exitstingUser.salt
    );
    if (validation) {
      const signature = await GenerateSignature({
        _id: exitstingUser._id,
        email: exitstingUser.email,
        name: exitstingUser.name,
      });

      return res.json(signature);
    }
  }
  return res.json({ message: "Credential do not match" });
};

export const GetVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existingVendor = Vendor.findById(user._id);
    return res.json(existingVendor);
  }

  return res.status(401).json({ message: "Vendor not found" });
};

export const UpdateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { foodType, name, address, phone } = <EditVendorPayload>req.body;

  if (user) {
    const existingVendor = await Vendor.findById(user._id);
    if (existingVendor) {
      existingVendor.name = name;
      existingVendor.address = address;
      existingVendor.phone = phone;
      existingVendor.foodType = foodType;
      const saveResult = await existingVendor.save();

      return res.json(saveResult);
    }
  }
  return res
    .status(500)
    .json({ message: "Unable to update the vendor profile" });
};

export const UpdateVendorCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existingVendor = await Vendor.findById(user._id);
    if (existingVendor) {
      const files = req.files as [Express.Multer.File];
      const images = files.map((file: Express.Multer.File) => file.filename);

      existingVendor.coverImages.push(...images);
      const result = await existingVendor.save();

      return res.json(result);
    }
  }
  return res.status(400).json({ message: "Unable to update vendor profile" });
};

export const UpdateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { lat, lng } = req.body;

  if (user) {
    const existingVendor = await Vendor.findById(user._id);
    if (existingVendor) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
      if (lat && lng) {
        existingVendor.lat = lat;
        existingVendor.lng = lng;
      }

      const result = await existingVendor.save();

      return res.json(result);
    }
  }
  return res.status(400).json({ message: "Unable to update vendor service" });
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { name, description, category, foodType, readyTime, price } = <
    CreateFoodInput
  >req.body;
  if (user) {
    const existingVendor = await Vendor.findById(user._id);

    if (existingVendor) {
      const files = req.files as [Express.Multer.File];
      const images = files.map((file: Express.Multer.File) => file.filename);

      const food = await Food.create({
        vendorId: existingVendor._id,
        name,
        description,
        price,
        category,
        rating: 0,
        readyTime,
        foodType,
        images,
      });

      existingVendor.foods.push(food);
      const result = await existingVendor.save();

      return res.json(result);
    }
  }
  return res.status(400).json({ message: "Unable to Add Food" });
};

export const GetFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const foods = await Food.find({ vendorId: user._id });
    if (foods && foods.length) return res.json(foods);
  }
  return res.status(400).json({ message: "Unable to Get Food" });
};

export const GetCurrentOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const orders = await Order.find({ vendorId: user._id }).populate(
      "items.food"
    );
    if (orders && orders.length) {
      return res.json(orders);
    }
  }

  return res.status(401).json({ message: "Orders Not found" });
};

export const ProcessOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;
  const { status, remarks, time } = req.body;

  if (orderId) {
    const order = await Order.findById(orderId);
    if (order) {
      order.orderStatus = status;
      order.remarks = remarks;
      if (time) {
        order.readyTime = time;
      }

      const result = await order.save();
      if (result) {
        return res.json(result);
      }
    }
  }
  return res.json({ message: "Unable to process order" });
};

export const GetOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    if (order != null) {
      return res.status(200).json(order);
    }
  }

  return res.json({ message: "Order Not found" });
};

export const GetOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    let currentOffer = [];
    const offers = await Offer.find().populate("vendors");

    if (offers && offers.length) {
      offers.map((item) => {
        if (item.vendors) {
          item.vendors.map((vendor) => {
            if (vendor._id.toString() === user._id) {
              currentOffer.push(item);
            }
          });
        }

        if (item.offerType === "GENERIC") {
          currentOffer.push(item);
        }
      });
    }
    return res.json(currentOffer);
  }

  return res.json({ message: "Offers Not available" });
};

export const AddOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const {
      title,
      description,
      offerType,
      offerAmount,
      pincode,
      promocode,
      promoType,
      startValidity,
      endValidity,
      bank,
      bins,
      minValue,
      isActive,
    } = <CreateOfferInputs>req.body;

    const vendor = Vendor.findById(user._id);
    if (vendor) {
      const offer = await Offer.create({
        title,
        description,
        offerType,
        offerAmount,
        pincode,
        promoType,
        startValidity,
        endValidity,
        bank,
        isActive,
        minValue,
        vendor: [vendor],
      });
      res.status(200).json(offer);
    }
  }
  return res.json({ message: "issue in adding offer" });
};

export const EditOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const offerId = req.params.id;

  if (user) {
  }
  const {
    title,
    description,
    offerType,
    offerAmount,
    pincode,
    promocode,
    promoType,
    startValidity,
    endValidity,
    bank,
    bins,
    minValue,
    isActive,
  } = <CreateOfferInputs>req.body;

  const currentOffer = await Offer.findById(offerId);
  if (currentOffer) {
    const vendor = Vendor.findById(user._id);
    if (vendor) {
      currentOffer.title = title;
      currentOffer.description = description;
      currentOffer.offerType = offerType;
      currentOffer.offerAmount = offerAmount;
      currentOffer.pincode = pincode;
      currentOffer.promoType = promoType;
      currentOffer.startValidity = startValidity;
      currentOffer.endValidity = endValidity;
      currentOffer.bank = bank;
      currentOffer.isActive = isActive;
      currentOffer.minValue = minValue;

      const result = await currentOffer.save();
      return res.status(200).json(result);
    }
  }
  return res.json({ message: "issue in Editing offer" });
};
