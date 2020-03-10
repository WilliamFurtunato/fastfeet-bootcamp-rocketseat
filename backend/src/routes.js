import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import DeliveryController from './app/controllers/DeliveryController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/deliveryman/:id/delivered', DeliveryController.index);
routes.put('/deliveryman/:id/order/:orderId/end', DeliveryController.update);

routes.get('/deliveryman/:id/deliveries', ScheduleController.index);
routes.put('/deliveryman/:id/order/:orderId/start', ScheduleController.update);

routes.get('/deliveryman/:id/notifications', NotificationController.index);
routes.put('/notification/:id', NotificationController.update);

routes.get(
  '/deliveries/problems',
  authMiddleware,
  DeliveryProblemController.index
);

routes.get(
  '/delivery/:id/problems',
  authMiddleware,
  DeliveryProblemController.show
);

routes.delete(
  '/problem/:id/cancel-delivery',
  authMiddleware,
  DeliveryProblemController.delete
);

routes.post('/delivery/:id/problems', DeliveryProblemController.store);

routes.use(authMiddleware);
routes.post('/files', upload.single('file'), FileController.store);

routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);
routes.put('/recipient/:id', RecipientController.update);

routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.delete);
routes.get('/deliveryman', DeliverymanController.index);

routes.get('/orders', OrderController.index);
routes.post('/orders', OrderController.store);
routes.put('/order/:id', OrderController.update);
routes.delete('/order/:id', OrderController.delete);

export default routes;
