import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import cloudinary from '../lib/cloudinary.js';
import { io, userSocketMap } from '../server.js'

// Get all users except the logged in user

export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.user._id; 
        const filteredUsers = await User.find({ _id : { $ne : userId }}).select("-password");
 
        // Count number of message not seen
        const unseenMessage = {}
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({senderId : user._id, recieverId : userId,
                seen : false})

                if(messages.length > 0) {
                    unseenMessage[user._id] = messages.length;
                } 
            })  
            await Promise.all(promises);
            res.json({success : true, users : filteredUsers, unseenMessage });   

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Server error' });
    } 
} 

//  Get all messages between two users
export const getMessages = async (req, res) => {
    try { 
        const { id : selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, recieverId: selectedUserId },
                { senderId: selectedUserId, recieverId: myId }
            ]
        })
        await Message.updateMany(
            { senderId: selectedUserId, recieverId: myId },
             { seen: true });

        res.json({ success: true, messages });
        
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Server error' });
    }
} 

// Api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        
        await Message.findByIdAndUpdate(id, {seen : true});
        req.json({ success : true })
        
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Server error' });
    } 
} 

// Send messae to selected user
export const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const recieverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = Message.create({
            senderId, recieverId, text, image : imageUrl
        }) 

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[recieverId];

        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

       res.json({ success : true, newMessage });
    } catch (error) {
        res.json({ success : false, message : error.message });
    }
} 

