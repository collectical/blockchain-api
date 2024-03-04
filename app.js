const cors = require('cors')
const os = require('os');
// const path = require('path');
// const fs = require('fs').promises; // Use promises version of fs
const fs = require('fs').promises
const express = require('express')
// const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const multer = require("multer");
const fileupload = require('express-fileupload')
const { toWebp, toMetadata, uploadToIPFS } = require('./metadata')

const app = express()

const Photo1 = require("./model");

const cloudinary = require('cloudinary').v2;
async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb+srv://tunitx:FnPe7JctlVTlhJOT@mintmart.wjhqljx.mongodb.net/?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}
connectToDatabase();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dvrko0bzr',
  api_key: '188551638249943',
  api_secret: 'aLZPOLQJ0LrahpXo6QY8tdYl7Sc',
  secure: true,
});

// app.use(cors())
// app.use(cors({}))
// allow all origins
app.use(cors({ origin: '*' }))
app.use(fileupload())

app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.get('/nfts', async (req, res) => {
  try {
    const photos = await Photo1.find({});
    res.status(200).json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/process', async (req, res) => {
  try {
    const name = req.body.name
    const description = req.body.description
    const price = req.body.price
    const image = req.files.image;
    console.log(req.body);

    if (!name || !description || !price || !image) {
      return res
        .status(400)
        .send('name, description, and price must not be empty')
    }

    let params

    await toWebp(image.data).then(async (data) => {
      // Convert Buffer to Data URL
      const dataUrl = `data:image/webp;base64,${data.toString('base64')}`;
    
      // Upload Data URL to Cloudinary
      const result = await cloudinary.uploader.upload(dataUrl, {
        resource_type: "auto"
      });
    
      params = {
        name,
        description,
        price,
        image: result.secure_url, // Store the Cloudinary URL in your model
      }
    
      // Save the details in your model
      const photo = new Photo1(params);
      await photo.save();
      console.log(photo);
    })

    // await fs.writeFile('token.json', JSON.stringify(toMetadata(params)))
    // const data = await fs.readFile('token.json')
    // const metadataURI = await uploadToIPFS(data)
    // console.log("yha------------------------")
    // console.log({ ...toMetadata(params), metadataURI })
    return res.status(200).json({message : 'success'})
  } catch (error) {
    console.log(error)
    return res.status(400).json({ error })
  }
})

app.listen(process.env.PORT || 9000, () => {
  console.log('Listen on the port 9000...')
})
