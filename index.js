const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2lj0rsv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('event-elevate').collection('services');
    const bookingCollection = client.db('event-elevate').collection('booking');

    app.get('/services', async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    })

    app.get('/booking', async (req, res) => {
      let query = {};
      if (req.query?.UserEmail) {
        query = { UserEmail: req.query.UserEmail }
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })

    app.post("/services", async (req, res) => {
      const newServices = req.body;
      console.log(newServices);
      const result = await serviceCollection.insertOne(newServices);
      res.send(result);
    })

    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedCoffee = req.body
      const updated = {
        $set: {
          ServiceImage: updatedCoffee.ServiceImage,
          ServiceName: updatedCoffee.ServiceName,
          ServiceDescription: updatedCoffee.ServiceDescription,
          ServiceProvider: updatedCoffee.ServiceProvider,
          ServiceArea: updatedCoffee.ServiceArea,
          ServicePrice: updatedCoffee.ServicePrice,
          UserId: updatedCoffee.UserID
        }
      }
      const result = await serviceCollection.updateOne(filter, updated, options);

      res.send(result);
    })

    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const result = await serviceCollection.deleteOne(filter);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send("Event Elevate is running");
})

app.listen(port, () => {
  console.log(`Event Elevate is Running at ${port}`);
})