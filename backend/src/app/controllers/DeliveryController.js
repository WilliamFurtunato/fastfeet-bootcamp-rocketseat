import { Op } from 'sequelize';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const orders = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: null,
        end_date: {
          [Op.ne]: null,
        },
      },
      order: ['end_date'],
      attributes: ['id', 'product', 'end_date'],
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

    const { product, start_date, end_date } = await order.update({
      end_date: new Date(),
    });

    return res.json({ product, start_date, end_date });
  }
}

export default new DeliveryController();
