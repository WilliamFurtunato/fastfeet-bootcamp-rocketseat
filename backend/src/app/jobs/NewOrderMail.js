import Mail from '../../lib/Mail';

class NewOrderMail {
  get key() {
    return 'NewOrderMail';
  }

  async handle({ data }) {
    const { orderToMail } = data;

    const address = `${orderToMail.recipient.street}, n° ${orderToMail.recipient.numb} ${orderToMail.recipient.complement}, ${orderToMail.recipient.city} - ${orderToMail.recipient.state}, ${orderToMail.recipient.zip_code}`;
    await Mail.sendMail({
      to: `${orderToMail.deliveryman.name} <${orderToMail.deliveryman.email}>`,
      subject: 'Novo produto disponível para retirada',
      template: 'newOrder',
      context: {
        product: orderToMail.product,
        deliveryman: orderToMail.deliveryman.name,
        recipient: orderToMail.recipient.name,
        address,
      },
    });
  }
}

export default new NewOrderMail();
