import * as Yup from 'yup';

import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import Notification from '../schemas/Notification';

import CancellationMail from '../jobs/CancellationMail';
import NewOrderMail from '../jobs/NewOrderMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const deliveries = await Order.findAll({
      order: ['id'],
    });

    return res.json(deliveries);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // check if recipient_id exists
    const recipientExists = await Recipient.findByPk(req.body.recipient_id);
    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    // check if deliveryman_id exists
    const deliverymanExists = await Deliveryman.findByPk(
      req.body.deliveryman_id
    );
    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const order = await Order.create(req.body);

    const orderToMail = await Order.findByPk(order.id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
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

    await Queue.add(NewOrderMail.key, { orderToMail });

    // notify deliveryman
    await Notification.create({
      content: `NOVA ENCOMENDA - O item '${req.body.product}' já está disponível para retirada `,
      user: req.body.deliveryman_id,
    });

    return res.json(order);
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
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

    order.canceled_at = new Date();

    await order.save();

    await Queue.add(CancellationMail.key, { order });

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // check if recipient_id exists
    const recipientExists = await Recipient.findByPk(req.body.recipient_id);
    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    // check if deliveryman_id exists
    const deliverymanExists = await Deliveryman.findByPk(
      req.body.deliveryman_id
    );
    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const order = await Order.findByPk(req.params.id);

    const { id, product, recipient_id, deliveryman_id } = await order.update(
      req.body
    );

    return res.json({ id, product, recipient_id, deliveryman_id });
  }
}

export default new OrderController();
