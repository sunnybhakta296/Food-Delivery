import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { CreateCustomerInput, UserLoginInput } from "../dto";
import { Customer } from "../models";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  validatePassword,
} from "../utility/PasswordUtility";

export const CustomerSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInput, req.body);

  const validationError = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (validationError.length) {
    return res.status(400).json(validationError);
  }
  const { email, password, firstName, lastName } = customerInputs;
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return res.status(400).json({ message: "Email already exit" });
  }

  try {
    const customer = await Customer.create({
      email,
      password: userPassword,
      salt,
      firstName,
      lastName,
    });

    return res.status(201).json({ email: customer.email });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerInputs = plainToClass(UserLoginInput, req.body);

    const validationError = await validate(customerInputs, {
      validationError: { target: true },
    });

    if (validationError.length) {
      return res.status(400).json(validationError);
    }
    const { email, password } = customerInputs;

    const customer = await Customer.findOne({ email });

    if (customer) {
      const validation = await validatePassword(
        password,
        customer.password,
        customer.salt
      );
      if (validation) {
        const signature = await GenerateSignature({
          _id: customer._id,
          email: customer.email,
        });

        return res.status(200).json({
          signature,
          email: customer.email,
        });
      }
    }
    return res
      .status(500)
      .json({ msg: `email/password combination not matched` });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const CustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customer = req.user;
    if (customer) {
      const profile = await Customer.findById(customer._id);
      if (profile) {
        return res.status(200).json(profile);
      }
    }
    return res.status(403).json({ msg: "Profile not found" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
