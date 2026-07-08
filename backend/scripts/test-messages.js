import 'dotenv/config';
import { prisma } from './lib/prisma.js';

async function checkMessages() {
  try {
    const messages = await prisma.message.findMany();
    console.log('Messages in DB:', JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error fetching messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMessages();
