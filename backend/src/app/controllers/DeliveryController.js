import * as Yup from 'yup';

import Order from '../models/Order';

class DeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      signature_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, orderId } = req.params;

    const { signature_id } = req.body;

    const order = await Order.findByPk(orderId);

    if (!(order.deliveryman_id.toString() === id)) {
      return res
        .status(401)
        .json({ error: 'You are not authorized to deliver this product' });
    }

    const { product, start_date, end_date } = await order.update({
      end_date: new Date(),
      signature_id,
    });

    return res.json({ orderId, product, start_date, end_date });
  }
}

export default new DeliveryController();
