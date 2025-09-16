/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config()
const { ClerkExpressWithAuth, default: clerkClient } =require('@clerk/clerk-sdk-node')
const app = express();
const PORT = 5000;
app.use(express.json())
app.use(cors());

app.post("/role", ClerkExpressWithAuth() ,async (req,res)=>{
   
   const { role ,Id } = req.body;
   if(!Id )
   {
     res.status(404).json({message:"useId not found"})
   }
   
    await clerkClient.users.updateUser(Id, {
      publicMetadata: { role }, // or privateMetadata for server-only
    });

    res.status(200).json({ success: true });
})


app.listen(PORT , ()=>console.log("server is running...."))