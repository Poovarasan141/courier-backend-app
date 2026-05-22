const Joi = require("joi");

const createOrderSchema = Joi.object({
  courier_partner: Joi.string().required().trim(),
  order_id: Joi.string().required().trim(),

  customer_name: Joi.string().required().trim(),
  customer_phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required(),

  customer_email: Joi.string().email().optional(),

  address: Joi.string().required().trim(),
  city: Joi.string().required().trim(),
  state: Joi.string().required().trim(),
  pincode: Joi.string().required().trim(),

  amount: Joi.number().required(),

  item_description: Joi.string().optional(),
  weight: Joi.number().optional(),
  length: Joi.number().optional(),
  breadth: Joi.number().optional(),
  height: Joi.number().optional(),
});

module.exports = {
  createOrderSchema,
};