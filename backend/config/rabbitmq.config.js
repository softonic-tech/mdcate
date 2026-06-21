import amqplib from "amqplib";
import env from "./env.config.js";

let channel = null;
let connection = null;

export const QUEUES = {
  NOTIFICATION: "notification_queue",
  EMAIL: "email_queue",
  VIDEO_PROCESS: "video_process_queue",
  BADGE_CHECK: "badge_check_queue",
};

export const connectRabbitMQ = async () => {
  try {
    connection = await amqplib.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();

    for (const queue of Object.values(QUEUES)) {
      await channel.assertQueue(queue, { durable: true });
    }

    console.log("RabbitMQ connected");

    connection.on("close", () => {
      console.warn("RabbitMQ connection closed, reconnecting...");
      setTimeout(connectRabbitMQ, 5000);
    });

    return channel;
  } catch (error) {
    console.error(`RabbitMQ connection failed: ${error.message}`);
    console.warn("Continuing without RabbitMQ - async jobs will be disabled");
    return null;
  }
};

export const getChannel = () => channel;

export const publishToQueue = async (queue, data) => {
  if (!channel) return false;
  try {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
    return true;
  } catch (error) {
    console.error(`Failed to publish to ${queue}: ${error.message}`);
    return false;
  }
};

export const consumeFromQueue = async (queue, handler) => {
  if (!channel) return;
  channel.consume(
    queue,
    async (msg) => {
      if (!msg) return;
      try {
        const data = JSON.parse(msg.content.toString());
        await handler(data);
        channel.ack(msg);
      } catch (error) {
        console.error(`Queue ${queue} handler error: ${error.message}`);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
};
