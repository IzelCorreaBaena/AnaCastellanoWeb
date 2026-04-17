import { RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found`, code: 'NOT_FOUND' });
};
