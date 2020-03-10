import {
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';
import { Op } from 'sequelize';

import Order from '../models/Order';
import Recipient from '../models/Recipient';

class ScheduleController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        end_date: null,
        canceled_at: null,
      },
      order: ['start_date'],
      attributes: ['id', 'product', 'start_date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'numb',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
    });

    return res.json(orders);
  }

  async update(req, res) {
    const { id, orderId } = req.params;

    const order = await Order.findByPk(orderId);

    if (!(order.deliveryman_id.toString() === id)) {
      return res
        .status(401)
        .json({ error: 'You are not authorized to deliver this product' });
    }

    const initial = setSeconds(
      setMinutes(setHours(new Date(), '08'), '00'),
      '00'
    );
    const final = setSeconds(
      setMinutes(setHours(new Date(), '18'), '00'),
      '00'
    );

    // check if hourStart is valid (between 08:00-18:00)
    if (!(isBefore(new Date(), final) && isAfter(new Date(), initial))) {
      return res.status(400).json({
        error:
          'Withdrawal of unavailable product.Try again between 08:00 and 18:00',
      });
    }

    const todaysDeliveries = await Order.findAndCountAll({
      where: {
        deliveryman_id: id,
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
      },
    });

    if (todaysDeliveries.count >= 5) {
      return res.status(400).json({
        error: 'You have already reached the delivery limit per day',
      });
    }

    const { start_date, product } = await order.update({
      start_date: new Date(),
    });

    return res.json({ orderId, start_date, product });
  }
}

export default new ScheduleController();
