const MongoClient=require('mongodb').MongoClient;


const url='mongodb://localhost:27017';
const dbName='circulation';
const assert=require('assert');

const circulationRepo=require('./src/repo/circulationRepo')();
const data=require('./circulation.json');



async function main(){
    const conn=new MongoClient(url);
    try{

  
    await conn.connect();
  
    console.log('Loading data');
    const results=await circulationRepo.loadData(data);
    assert.equal(data.length,results.insertedCount);

  
    const getData = await circulationRepo.get();
    console.log(getData.length)
    assert.equal(data.length, getData.length);



    const filterData=await circulationRepo.get({Newspaper:getData[4].Newspaper});
    assert.deepStrictEqual(filterData[0],getData[4]);


    const limitData=await circulationRepo.get({},3);
    assert.strictEqual(limitData.length,3);

    const id=getData[4]._id.toString();
    const byId=await circulationRepo.getById(id);
    assert.deepStrictEqual(byId,getData[4]);


    const newItem={
        "Newspaper": "chaten",
        "Daily Circulation, 2004": 2192,
        "Daily Circulation, 2013": 1674,
        "Change in Daily Circulation, 2004-2013": -24,
        "Pulitzer Prize Winners and Finalists, 1990-2003": 1,
        "Pulitzer Prize Winners and Finalists, 2004-2014": 1,
        "Pulitzer Prize Winners and Finalists, 1990-2014": 2
    }

    const addItem=await circulationRepo.add(newItem);
    assert(addItem._id);


    const updatedItem = await circulationRepo.update(addItem._id, {
        "Newspaper": "My new paper",
        "Daily Circulation, 2004": 1,
        "Daily Circulation, 2013": 2,
        "Change in Daily Circulation, 2004-2013": 100,
        "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
        "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
        "Pulitzer Prize Winners and Finalists, 1990-2014": 0
      });
      assert.equal(updatedItem.Newspaper, "My new paper");
  
  
      const newAddedItemQuery = await circulationRepo.getById(addItem._id);
      assert.equal(newAddedItemQuery.Newspaper, "My new paper");
  
      const removed = await circulationRepo.remove(addItem._id);
      assert(removed);
      const deletedItem = await circulationRepo.getById(addItem._id);
      assert.equal(deletedItem, null);
  

      const avg=await circulationRepo.averageFinalists();
    console.log('Average Finalists:'+avg);


    }catch(error){
        console.log(error);
    }finally{           
        const ad = conn.db(dbName).admin();

        await conn.db(dbName).dropDatabase();
        console.log(await ad.listDatabases());
    
        conn.close();
    }
}

main();