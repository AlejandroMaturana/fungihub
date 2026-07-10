import { Router } from 'express';
import { Op } from 'sequelize';
import { authenticate, optionalAuth } from '../middlewares/auth.js';
import { Event, Device } from '../models/index.js';

const router = Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, deviceId, from, to } = req.query;
    const where = {};
    if (type) where.type = type;
    if (deviceId) where.deviceId = deviceId;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp[Op.gte] = new Date(from);
      if (to) where.timestamp[Op.lte] = new Date(to);
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows, count } = await Event.findAndCountAll({
      where,
      include: [{ model: Device, attributes: ['deviceId', 'chamberName'] }],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    res.json({
      data: rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    console.error('[EVENTS] Error listing:', err.message);
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

router.get('/device/:deviceId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, from, to } = req.query;
    const where = { deviceId: req.params.deviceId };
    if (type) where.type = type;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp[Op.gte] = new Date(from);
      if (to) where.timestamp[Op.lte] = new Date(to);
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows, count } = await Event.findAndCountAll({
      where,
      include: [{ model: Device, attributes: ['deviceId', 'chamberName'] }],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
    res.json({
      data: rows,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    console.error('[EVENTS] Error listing for device:', err.message);
    res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

export default router;
