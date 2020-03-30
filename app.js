const express = require("express"), 
	  app = express(),
	  bodyParser  = require("body-parser"),
	  mongoose = require("mongoose"),
	  methodOverride = require("method-override"),
	  expressSanitizer = require("express-sanitizer");

// APP CONFIG
mongoose.set('useUnifiedTopology', true); 
mongoose.connect("mongodb://localhost/SemanticBlog", { useNewUrlParser: true }); // will create the yelp_database for us inside mongodb dynamically

app.use(express.static("public")); // allows us to use our custom CSS Stylesheet
app.set("view engine", "ejs"); // This line means the express now expects ejs template files by default, so we dont need to add .ejs e.g landing.ejs can be called simply landing
app.use(bodyParser.urlencoded({extended: true})); // tells app to use bodyParser for post requests, and sets some setting up
app.use(methodOverride("_method")); // whenever app gets a request which has _method, it will take what its equal to an treat it that way! Makes PUT and DELETE requests work
app.use(expressSanitizer()); // Needs to go after bodyParser. used to stop users adding script tags in the text field input, but allows them to add other html to make post look better

// MONGOOSE SCHEMA AND MODEL CONFIG
const blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

const Blog = mongoose.model("Blog", blogSchema);

// INITIAL DATA:

//Blog.create({
//	title: "Test Blog 2",
//	image: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
//	body: "Hello this is a seconds blog post"
//})

// RESTful ROUTES
// ROOT Route diverts straight to blogs to display all blog data
app.get("/", function(req, res){ // request , respond
	res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){ // {} means we are retriving ALL data, and whatever comes back we are sending into the ejs file as 'blogs'
		if(err){
			console.log(err)
		}
		else {
			res.render("index", {blogs: blogs}) // render the index.ejs page with the data from all the blogs
		}
	})
});

// NEW ROUTE - shows the form to create a new post
app.get("/blogs/new", function(req, res){
		res.render("new")
	}
);

// CREATE ROUTE
app.post("/blogs", function(req, res){
	// Create blog, then redirect to "/blogs" get route (index)
	req.body.blog.body = req.sanitize(req.body.blog.body);// sanitizer on input in text field. req.body is the form data, then we access the blog[body] input from the form and sanitise it.
	Blog.create(req.body.blog, function(err, newBlog){ // rew.body.blog takes all data from input form
		if(err){
			res.render("new");
		}
		else{
			res.redirect("/blogs");
		}
	})
})

// SHOW ROUTE - links to read more about a blog post
app.get("/blogs/:id", function(req,res){
		Blog.findById(req.params.id, function(err, foundBlog){
			if(err){
				res.redirect("/blogs");
			} else {
				res.render("show", {blog: foundBlog}) // pass in the foundBlog as blog into the show template
		}
	})
});

// EDIT ROUTE - need to get blog, load in the content so user can see what to edit, then edit it.
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
})

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);// sanitizer on input in text field. req.body is the form data, then we access the blog[body] input from the form and sanitise it.
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){ // id, newData, callback function
		if(err){
			res.redirect("/blogs");
		} else{
			res.redirect("/blogs/" + req.params.id);
		}
	}) 
});

// DESTROY ROUTE
app.delete("/blogs/:id", function(req,res){
	// destroy blog the redirect
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
		res.redirect("/blogs");
		}
	})
})



// required for server to listen on port 3000 - server always has to listen to something!
app.listen(process.env.PORT || 3000, function() { 
  console.log('Blog Server has started - Server listening on port 3000'); 
})