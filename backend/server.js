import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors'
import { configDotenv } from 'dotenv';
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import connectDB from './lib/db.js'

configDotenv();
connectDB();

const app = express();
app.use(express.json({limit : "10mb"}));
app.use(cors())


app.use("/api/auth", userRouter); 
app.use('/api/messages', messageRouter);

const server = createServer(app);

 export const io = new Server(server, {
  cors: { origins: '*' }
}); 

export const userSocketMap = {}; // { userId : socketId }


// Socket.io connection handler
io.on('connection', (socket) => {
     const userId = socket.handshake.query.userId;
     console.log("User Connected", userId);

     if(userId) userSocketMap[userId] = socket.id;

     // Emit online users to all connected clients
     io.emit('getOnlineUsers', Object.keys(userSocketMap));

     socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
     })
})


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
     console.log("Server is listening on PORT : 5000");
})