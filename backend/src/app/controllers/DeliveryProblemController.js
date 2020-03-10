import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import DeliveryProblem from '../models/DeliveryProblem';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveries = await DeliveryProblem.findAll({
      attributes: ['id', 'description', 'delivery_id'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product', 'recipient_id', 'deliveryman_id'],
        },
      ],
    });

    return res.json(deliveries);
  }

  async show(req, res) {
    const delivery = await DeliveryProblem.findOne({
      where: {
        delivery_id: req.params.id,
      },
      attributes: ['id', 'description', 'delivery_id'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product', 'recipient_id', 'deliveryman_id'],
        },
      ],
    });

    return res.json(delivery);
  }

  async store(req, res) {
    const delivery = await DeliveryProblem.create({
      delivery_id: req.params.id,
      description: req.body.description,
    });

    return res.json(delivery);
  }

  async delete(req, res) {
    const delivery = await DeliveryProblem.findByPk(req.params.id);

    const { delivery_id } = delivery;

    const order = await Order.findByPk(delivery_id, {
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
}

export default new DeliveryProblemController();
