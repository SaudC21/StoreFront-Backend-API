import client from "../database";

export type Order = {
   product_id: string;
   quantity: number;
   user_id: string;
   status: string;
}

export type OrderProduct = {
   quantity: number;
   order_id: number;
   product_id: number;
}

export class orderStore {
   async index(): Promise<Order[]> { // SHOW ALL orders
      try {
         const conn = await client.connect();
         const sql = 'SELECT * FROM orders';
         const result = await conn.query(sql);
         const orders = result.rows;
         conn.release();
         return orders;
      } catch (error) {
         throw new Error(`Can't get all orders. Error: ${error}`);
      }
   }

   async show(id: number): Promise<Order> { // SHOW one order
      try {
         const conn = await client.connect();
         const sql = 'SELECT order FROM orders WHERE id=($1)';
         const result = await conn.query(sql, [id]);
         const order = result.rows[0];
         conn.release();
         return order;
      } catch (error) {
         throw new Error(`Can't get order ${id}. Error: ${error}`);
      }
   }

   async create(order: Order): Promise<Order> { // CREATE new order
      try {
         const conn = await client.connect();
         const sql = 'INSERT INTO orders (product_id, quantity, user_id, status) VALUES($1, $2, $3, $4) RETURNING *';

         const result = await conn.query(sql, [
            order.product_id,
            order.quantity, 
            order.user_id, 
            order.status
         ]);
         const orderRecord = result.rows[0];
         
         conn.release();
         return orderRecord;
      } catch (error) {
         throw new Error(`Couldn't add new order ${order}. Error: ${error}`);
      }
   }

   async update(order: Order): Promise <Order | null> { // UPDATE order info
      try {
         const conn = await client.connect();
         const sql = 'UPDATE orders SET name = $1, price = $2 WHERE id = $3';

         const result = await conn.query(sql, [
            order.product_id,
            order.quantity,
            order.user_id,
            order.status,
         ]);
         conn.release();
         const orderRecord = result.rows[0];

         return orderRecord;
      } catch (error) {
         throw new Error(`Could not update order of user ${order.user_id}. Error: ${error}`)
      }
   }

   async delete(id: number): Promise<Order> { // DELETE one order
      try {
         const conn = await client.connect();
         const sql = 'DELETE FROM orders WHERE id=($1)';

         const result = await conn.query(sql, [id]);
         const order = result.rows[0];

         conn.release();
         return order;
      } catch (error) {
         throw new Error(`Couldn't delete order ${id}. Error: ${error}`);
      }
   }

   async createOrderProduct(order: OrderProduct): Promise<Order> {
      try {
         const conn = await client.connect();
         const sql = 'INSERT INTO order_products (quantity, order_id, product_id) VALUES($1, $2, $3) RETURNING *';

         const result = await conn.query(sql, [
            order.quantity,
            order.order_id,
            order.product_id,
         ]);
         const orderRecord = result.rows[0];

         conn.release();
         return orderRecord;
      } catch (error) {
         throw new Error(`Unable to add product ${order.product_id} to order ${order.order_id}: ${error}`);      
      }
   }

   async deleteOrderProduct(orderProduct_id: string): Promise<Order> {
      try {
         const conn = await client.connect();
         const sql = 'DELETE FROM order_products WHERE id=($1)';

         const result = await conn.query(sql, [orderProduct_id]);
         conn.release();

         const orderRecord = result.rows[0];
         return orderRecord;
      } catch (error) {
         throw new Error(`Unable to delete order product ${orderProduct_id}. Error: ${error}`);      
      }
   }
}