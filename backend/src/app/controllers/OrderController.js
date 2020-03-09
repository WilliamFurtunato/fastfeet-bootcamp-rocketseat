import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

class OrderController {
  async index(req, res) {
    const deliveries = await Order.findAll();

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { product, recipient_id, deliveryman_id, start_date } = req.body;

    // check if recipient_id exists
    const recipientExists = await Recipient.findByPk(recipient_id);
    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    // check if deliveryman_id exists
    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);
    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    // Check for past dates
    const hourStart = startOfHour(parseISO(start_date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    // check dates availability

    const checkAvailability = await Order.findOne({
      where: {
        deliveryman_id,
        canceled_at: null,
        start_date: hourStart,
      },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Delivery date is not availability' });
    }

    const order = await Order.create({
      product,
      recipient_id,
      deliveryman_id,
      start_date: hourStart,
    });

    return res.json(order);
  }
}

export default new OrderController();
