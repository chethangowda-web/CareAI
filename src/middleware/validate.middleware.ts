import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const messages = error.details.map(d => d.message).join('; ');
      return res.status(400).json({ error: messages });
    }
    next();
  };

export const symptomAnalysisSchema = Joi.object({
  symptoms: Joi.string().min(3).max(2000).required(),
  duration: Joi.string().valid('hours', 'days', 'weeks').required(),
  severity: Joi.number().integer().min(1).max(10).required(),
  temperature: Joi.number().min(20).max(115).optional().allow(null, 0),
  temperatureUnit: Joi.string().valid('C', 'F').required(),
});
