const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose");

const app = express()

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://Aarya:elsa@cluster0.lxjd0.mongodb.net/todolistDB", {
  useNewUrlParser: true
})

const taskSchema = {
  name: {
    type: String,
    required: true
  }
}

const listSchema = {
  name: {
    type: String,
    required: true
  },
  items: [taskSchema]
}

const Task = mongoose.model("Task", taskSchema)
const List = mongoose.model("List", listSchema)

const item1 = new Task({
  name: "Welcome to your to-do list!"
})

const item2 = new Task({
  name: "Hit the + button to add a new item."
})

const item3 = new Task({
  name: "<--- Hit this to delete an item."
})

const item4 = new Task({
  name: "Add name of new list after '/' in the URL."
})

const defaultArray = [item1, item2, item3, item4]

app.get("/", function(req, res) {

  Task.find({}, function(err, results) {
    if (results.length === 0) {
      Task.insertMany(defaultArray, function(err) {
        if (err)
          console.log(err);
        else
            console.log("Success")
      })
      res.redirect("/")
    }
    else {
      res.render("list", {
        listTitle: "Today",
        newListItems: results
      })
    }
  })
})

app.get("/:pname", function(req, res) {

  const title = req.params.pname
  List.findOne({
    name: title
  }, function(err, results) {
    if (!err) {
      if (!results) {
        const list = new List({
          name: title,
          items: defaultArray
        })
        list.save();
        res.redirect("/" + title)
      } else
        res.render("list", {
          listTitle: title,
          newListItems: results.items
        })
    }
  })

})

app.post("/", function(req, res) {
  const item = req.body.newItem
  const lname = req.body.list

  const taskToBeAdded = new Task({
    name: item
  })

  if (lname === "Today") {
    taskToBeAdded.save()
    res.redirect("/")
  } else {
    List.findOne({
      name: lname
    }, function(err, results) {
      results.items.push(taskToBeAdded)
      results.save()
      res.redirect("/" + lname)
    })
  }
})

app.post("/delete", function(req, res) {
  const toDel = req.body.check
  const lname = req.body.listName

  if (lname === "Today") {
    Task.deleteOne({
      _id: toDel
    }, function(err) {
      if (err)
        console.log(err);
      else
        console.log("Deleted");
    })
    res.redirect("/")
  } else {
    List.findOneAndUpdate({
      name: lname
    }, {
      $pull: {
        items: {
          _id: toDel
        }
      }
    }, function(err, results) {
      if (!err)
        res.redirect("/" + lname)
      else
        console.log(err);
    })
  }

})

app.listen(process.env.PORT || 3000, function() {
  console.log("Listening on port 3000");
})
