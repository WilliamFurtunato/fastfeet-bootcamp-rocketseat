import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { order } = data;

    const address = `${order.recipient.street}, n° ${order.recipient.numb} ${order.recipient.complement}, ${order.recipient.city} - ${order.recipient.state}, ${order.recipient.zip_code}`;

    await Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'Entrega cancelada',
      template: 'cancellation',
      context: {
        product: order.product,
        deliveryman: order.deliveryman.name,
        recipient: order.recipient.name,
        address,
      },
    });
  }
}

export default new CancellationMail();
