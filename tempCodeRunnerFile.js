const query = {_id : new ObjectId(id)};
        console.log(query);
        const result = await serviceCollection.findOne(query);
        res.send(result);