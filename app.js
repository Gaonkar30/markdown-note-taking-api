const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const bodyParser = require('body-parser');
const axios = require("axios");
const upload = multer({ dest: "uploads/" });
const marked = require('marked');
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`app listening on {PORT}`);
});
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.post("/grammer-check", async (req, res) => {
  const { text } = req.body;
  try {
    const response = await axios.post("https://api.languagetool.org/v2/check", {
      text: text,
      language: "en-US",
    });
    const matches = response.data.matches;
    const corrections = matches.map((match) => ({
      message: match.message,
      suggestions: match.replacements.map((replacement) => replacement.value),
      offset: match.offset,
      length: match.length,
    }));
    res.json(corrections);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error checking grammar");
  }
});
app.post('/savenote',async(req,res)=>{
  const content=req.body.content
  const title=req.body.title
  const filename=path.join(__dirname+'notes'+`${title}.md`);
  fs.writeFile(filename,content,(err)=>{
    if(err) throw err;
    res.json({ status: 'success', message: 'Note saved successfully' });
  })
});

app.post('/render-note', (req, res) => {
  const markdownContent = req.body.content;

  try {
    const htmlContent = marked(markdownContent);
    res.json({ html: htmlContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Failed to render the note' });
  }
});