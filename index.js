const express=require('express');
const { MongoClient } = require('mongodb');
const app=express();
const port=process.env.PORT || 5000;
const ObjectId=require('mongodb').ObjectId;

require('dotenv').config();



const cors=require('cors');
// MIDDLEWARE 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ltd8o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);

async function run(){
    try{
        // database connection 
        await client.connect();
        console.log('client connected to database');
        const database=client.db('sigma-travel');
        const servicesCollection=database.collection('services');
        const orderCollection=database.collection('order');

        // POST API 
        app.post('/orders',async (req,res)=>{
            const orderData=req.body;
            console.log(orderData);
            const result =await orderCollection.insertOne(orderData);
            res.json(result.acknowledged);
            // res.send('hitten')
        });
         // Get all orders 
      app.get('/allBookings', async (req,res)=> {
        const result = await orderCollection.find({});
        const convertedOrders = await result.toArray();
        res.json(convertedOrders);
      })
    //   post add tour api 
        app.post('/addtour',async (req,res)=>{
            const tour=req.body;
            // console.log(tour);
            const result =await servicesCollection.insertOne(tour);
            res.json(result);
        });
          
    // Get my orders 
    app.get('/allBookings/:userEmail', async (req,res)=> {
        const userEmail = req.params.userEmail;
        console.log(userEmail);
        const result = await orderCollection.find({userEmail:userEmail});
        const convertedOrders = await result.toArray();
        res.json(convertedOrders);
        res.send(userEmail);
    });
     
        // get singleservice
        app.get('/services/:id',async (req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const service=await servicesCollection.findOne(query);
            res.json(service);
        });

        // get API 
        app.get('/services',async(req,res)=>{
            const cursor=servicesCollection.find({});
            const services=await cursor.toArray();
            res.send(services);
        });


     // Delete a booking 
     app.delete('/booked', async(req,res)=> {
        const deleteId = req.body.deleteId;
        const result = await orderCollection.deleteOne({_id:ObjectId(deleteId)});
        res.json({res:' '})
      })
      // Update a booking by admin 
      app.put('/booked', async (req,res)=> {
        const updateId = req.body.updateId;
        const status = req.body.status;
        const filter = { _id: ObjectId(updateId)};
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            status: status
          },
        };
        const result = await orderCollection.updateOne(filter, updateDoc, options);
        res.json({res:' '});
      })
      //check booked item
      app.get('/booked', async(req,res)=> {
        const userEmail = req.query.userEmail;
        const id = req.query.id;
        if(userEmail!=undefined && id!=='undefined') {
          const result = await orderCollection.findOne({userEmail:userEmail,id:id});
          if(result) res.json({res:' '});
          else res.json({res: ''});
        }
      })

    }finally{
        // await client.close();

    }
}

run().catch(console.dir);


// localhost test server 
app.get('/',(req,res)=>{
    res.send('connect from server');
});

app.listen(port,()=>{
    console.log('running server on port',port);
})