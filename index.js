const express = require('express');
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmzpktv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const galleryCollection = client.db('toyProducts').collection('gallery')
    const addedToyCollection = client.db('toyProducts').collection('addedToys')

    // const indexKeys = { toyName: 1, category: 1 }
    // const indexOptions = { name: "toyNameCategory" }
    //  await addedToyCollection.createIndex(indexKeys, indexOptions)

    app.get('/getToyByText/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await addedToyCollection.find({
        $or: [
          { toyName: { $regex: searchText, $options: "i" } },
          { category: { $regex: searchText, $options: "i" } },
        ],
      }).toArray();
      res.send(result);
    })


    app.get('/gallery', async (req, res) => {
      const cursor = galleryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    // added all toys
    app.get('/addedToys', async (req, res) => {
      const sort = req.query.sort;
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const options = {
        sort: { 'price': sort === 'ascending' ? 1 : -1 }
      }
      const result = await addedToyCollection.find(query, options).toArray();
      res.send(result)
    })

    app.get('/addedToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: { _id: 0, sellerName: 1, email: 1, toyName: 1, toyPhoto: 1, price: 1, category: 1, quantity: 1, rating: 1, description: 1, date: 1, like: 1 }
      }
      const result = await addedToyCollection.findOne(query, options);
      res.send(result);
    })


    app.post('/addedToys', async (req, res) => {
      const addedToys = req.body;
      console.log(addedToys);
      const result = await addedToyCollection.insertOne(addedToys)
      res.send(result)
    })

    app.put('/addedToys/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }
      const updatedToy = req.body;
      const toy = {
        $set: {
          toyName: updatedToy.toyName,
          toyPhoto: updatedToy.toyPhoto,
          sellerName: updatedToy.sellerName,
          email: updatedToy.email,
          category: updatedToy.category,
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
          date: updatedToy.date,
          rating: updatedToy.rating,
          like: updatedToy.like,
        }
      }
      const result = await addedToyCollection.updateOne(filter, toy, options)
      res.send(result);
    })

    app.delete('/addedToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addedToyCollection.deleteOne(query)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Toys Server is Running')
})

app.listen(port, (req, res) => {
  console.log(`Toys server is running on port: ${port}`);
})