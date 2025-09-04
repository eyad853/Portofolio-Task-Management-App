import express from "express"
import mongoose from "mongoose"
import router from "./routes/routes.js"
import cors from "cors"
import dotenv from 'dotenv'
import passport from "passport"
import session from "express-session"
import "./config/googlePassport.js"
import "./config/githubPassport.js"
import MongoStore from "connect-mongo"
import http from "http"
import { Server } from "socket.io"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url"
import User from "./schemas/UserSchema.js"
import sharedsession from "express-socket.io-session"
dotenv.config()
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.vercelDomain,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

app.set('io' , io)

// Make sure uploads directory exists - modern approach
const uploadsDir = path.join(process.cwd(), "backend", "uploads");

app.use(cors({
  origin: process.env.vercelDomain,
  credentials: true
}));

// Make uploads directory accessible
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const sessionMiddleware = session({
secret:process.env.SESSION_SECRET,
saveUninitialized:false,
resave:false,
store:MongoStore.create({
mongoUrl:process.env.DB,
collectionName: 'sessions',  // Collection where sessions are stored
ttl: 14 * 24 * 60 * 60, // Session TTL in seconds (14 days)
})
})

app.use(sessionMiddleware)

app.use(passport.initialize())
app.use(passport.session())

io.use(sharedsession(sessionMiddleware, {
  autoSave: true
})); // for Socket.IO

io.on('connection' , async(socket)=>{
  const session = socket.handshake.session;

  if (!session || !session.passport || !session.passport.user) {
    console.log("Unauthenticated socket");
    return;
  }

  const userId = session.passport.user; // This is usually the user._id if you're using Passport

  socket.join(userId.toString());
  // console.log(`Socket ${socket.id} joined room ${userId}`);
})

passport.serializeUser((user, done) => {
    done(null, user._id); // For local users, storing the _id in session
  });
  
passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user); // Attach the user object to req.user
    } catch (error) {
      done(error)
    }
  });

const handleConnect = async ()=>{
    await mongoose.connect(process.env.DB)
    console.log("db has been connected");
}
handleConnect()

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
  try{
    handleConnect()
  }catch(err){
    console.log('failed ageain');
    setTimeout(()=>{handleConnect()},5000)
  }
});
mongoose.connection.on('error', () => {
  console.log('Mongoose disconnected from MongoDB');
  try{
    handleConnect()
  }catch(err){
    console.log('failed ageain');s
    setTimeout(()=>{handleConnect()},5000)
  }
});

app.use(express.json({ limit: '10mb' }));

app.use(router)


const PORT=8000
server.listen(PORT , ()=>{
    console.log("server started");
    
})

console.log(process.cwd());