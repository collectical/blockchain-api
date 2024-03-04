require('dotenv').config()
const sharp = require('sharp')
const { faker } = require('@faker-js/faker')
const ipfsClient = require('ipfs-http-client')

const auth =
  'Basic ' +
  Buffer.from(process.env.INFURIA_PID + ':' + process.env.INFURIA_API).toString(
    'base64',
  )
const client = ipfsClient.create({
  host: 'ipfs.infura.io',
  port: 5001,
  duplex: true,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
})
const attributes = {
  weapon: [
    'Stick',
    'Knife',
    'Blade',
    'Club',
    'Ax',
    'Sword',
    'Spear',
    'Halberd',
  ],
  environment: [
    'Space',
    'Sky',
    'Deserts',
    'Forests',
    'Grasslands',
    'Mountains',
    'Oceans',
    'Rainforests',
  ],
  rarity: Array.from(Array(6).keys()),
}
const toMetadata = ({ id, name, description, price, image , }) => ({
  id,
  name,
  description,
  price,
  image,
  demand: faker.random.numeric({ min: 10, max: 100 }),
  attributes: [
    {
      trait_type: 'Environment',
      value: attributes.environment.sort(() => 0.5 - Math.random())[0],
    },
    {
      trait_type: 'Weapon',
      value: attributes.weapon.sort(() => 0.5 - Math.random())[0],
    },
    {
      trait_type: 'Rarity',
      value: attributes.rarity.sort(() => 0.5 - Math.random())[0],
    },
    {
      display_type: 'date',
      trait_type: 'Created',
      value: Date.now(),
    },
    {
      display_type: 'number',
      trait_type: 'generation',
      value: 1,
    },
  ],
})
const toWebp = async (image) => await sharp(image).resize(500).webp().toBuffer()
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data'); // Import the FormData module

const uploadToIPFS = async (data) => {
  try {
    // Create a Readable Stream from the file
    // const fileContents = fs.createReadStream(data);

    const url = 'https://ipfs.infura.io:5001/api/v0/add';

    // Set the necessary headers
    const headers = {
      "Authorization": auth,
      'Content-Type': 'multipart/form-data',
    };

    // Create a FormData object and append the file data
    const formData = new FormData();
    formData.append('file', data);

    // Make the Axios POST request to upload the file to IPFS
    const response = await axios.post(url, formData, { headers });

    // Check if the request was successful and return the IPFS hash
    if (response.status === 200) {
      const ipfsHash = response.data.Hash;
      return `https://ipfs.io/ipfs/${ipfsHash}`;
    } else {
      console.error('IPFS upload failed:', response.data);
      throw new Error('IPFS upload failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

// Example usage:
uploadToIPFS()
  .then((ipfsUrl) => {
    // console.log('IPFS URL:', ipfsUrl);
  })
  .catch((error) => {
    // console.error('Error:', error.message);
  });
exports.toWebp = toWebp
exports.toMetadata = toMetadata
exports.uploadToIPFS = uploadToIPFS
