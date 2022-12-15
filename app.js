//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
const { name } = require("ejs");
mongoose.set('strictQuery',true);
mongoose.connect("mongodb+srv://prachii1408:avnishprachi@prachi.z9krwxd.mongodb.net/test");
 const itemsSchema=new mongoose.Schema({
  name:String
 });
 const Item=mongoose.model("Item",itemsSchema);
 const item1=new Item({
  name:"Welcome to your to-do list"
 });
 const item2=new Item({
  name:"Click + to enter new item"
 });

 const item3=new Item({
  name:"Click this to delete this item"
 });

 const defaultItems=[item1,item2,item3];

 const app = express();
 const listschema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
 });
 const List=mongoose.model("List",listschema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const day = date.getDate();

app.get("/", function(req, res) {

// const day = date.getDate();
Item.find(function(err,items){
  
    if(items.length===0){

 Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("default items added successfully");
  }
  res.redirect("/");
 });}
 else{
    res.render("list", {listTitle:"Today", newListItems: items});}
});

  
});

app.post("/", function(req, res){

  const item = new Item({
    name:req.body.newItem
  });
  const customItem=req.body.list;
  if(customItem==="Today"){
    item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:customItem},function(err,foundItem){
      foundItem.items.push(item);
      foundItem.save();
      res.redirect("/"+customItem);
    })
  }
})

  app.post("/delete",function(req,res){
    const checkedId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
      Item.deleteOne({_id:checkedId},function(err){
        if(err){
          console.log(err);
        }
        else{
          res.redirect("/");
        }
      })
    }
    else{
       List.findOneAndUpdate({name:listName},
        {$pull:{items:{_id:checkedId}}},
        function(err,foundList){
          if(!err){
            res.redirect("/"+listName);
          }
        }
        )
    }
  })


app.get("/:listId", function(req,res){
  const listId=_.capitalize(req.params.listId);
  List.findOne({name:listId},function(err,result){
    if(!err){
      if(result){
        res.render("list",{listTitle:listId,newListItems:result.items});
      }
      else{
        const list=new List({
          name:listId,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+listId);
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
