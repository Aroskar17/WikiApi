require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000 || process.env.PORT;
const uri = process.env.MONGODB_URI;

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

try {
  mongoose.connect(uri, {
    useNewUrlParser: true,
  });
  console.log("Connected to MongoDb");
} catch (err) {
  console.log(err);
}

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Article = new mongoose.model("Article", articleSchema);

app
  .route("/articles")
  .get(function (req, res) {
    Article.find({}, function (err, articles) {
      if (err) {
        res.status(500).send(err);
      } else if (!articles) {
        console.log("Articles not found");
      } else {
        const formattedArticles = articles.map((article) => {
          return {
            _id: article._id,
            title: article.title,
            content: article.content,
          };
        });
        res.json(formattedArticles);
      }
    });
  })
  .post((req, res) => {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content,
    });
    newArticle.save((err) => {
      if (err) console.log(err);
      else {
        console.log("Successfully inserted");
        res.send(req.body);
      }
    });
  })
  .delete((req, res) => {
    Article.deleteMany((err) => {
      if (err) console.log(err);
      else {
        console.log("Articles deleted successfully");
        res.send("Deleted all articles");
      }
    });
  });

app
  .route("/articles/:articleTitle")
  .get((req, res) => {
    Article.find({ title: req.params.articleTitle }, (err, articlesData) => {
      if (!err) {
        res.send(articlesData);
      } else if (!articlesData) res.send("No data found");
      else res.send(err);
    });
  })

  .put((req, res) => {
    Article.updateMany(
      { title: req.params.articleTitle },
      { title: req.body.title, content: req.body.content },
      { overwrite: true },
      (err, results) => {
        if (err) res.send(err);
      }
    );
  })

  .patch((req, res) => {
    Article.updateOne(
      { title: req.params.articleTitle },
      { $set: { title: "Thanks", content: "pgo" } },
      (err, re) => {
        if (err) res.send(err);
        else res.send(re);
      }
    );
  });

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
