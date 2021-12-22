//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');


const {
  redirect
} = require("express/lib/response");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoListDB", {
  useNewUrlParser: true
});
const itemSchema = {
  name: {
    type: String,
    require: true
  }
};
const Item = mongoose.model(
  "item",
  itemSchema
);

const item1 = new Item({
  name: "buy food"
});

const item2 = new Item({
  name: "buy cook"
});

const item3 = new Item({
  name: "buy eat"
});

const defultItems = [item1, item2, item3];
//Item.insertMany(defultItems,function(err){
//  if(err){
//   console.log(err);
//  }
//  else{
//    console.log("succses");
// }
//});

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {


  Item.find({}, function (err, found) {
    if (found.length === 0) {
      Item.insertMany(defultItems, function (err) {
        if (err) {
          console.log(err);
        }

      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "today",
        newListItems: found
      });
    }


  });


});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  console.log(listName);
  if (listName === "today") {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err, foundList){
      
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }



});

app.post("/delete", function (req, res) {
  const chackItemID = req.body.chackbox;
  const listName = req.body.listName;
  

  if(listName === "today"){
    Item.findByIdAndRemove(chackItemID, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("item removed");
      }
      res.redirect("/");
    });
  }else{
    List.findOneAndUpdate(
      {name : listName},
      {$pull:{items:{_id : chackItemID}}},
      function(err, foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      }
    );

  }

  
});

app.get("/:title", function (req, res) {
  const customListName = _.capitalize(req.params.title);
  List.findOne({
    name: customListName
  }, function (err, result) {
    if (!err) {
      if (!result) {
        //creat now list
        const list = new List({
          name: customListName,
          items: defultItems
        });
        list.save();
        res.redirect("/" + customListName);

      } else {
        //show list
        res.render("list", {
          listTitle: result.name,
          newListItems: result.items
        });




      }
    }
  });

});


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});