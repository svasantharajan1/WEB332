var express = require("express");
var app = express();
const data = require("./blog-service.js");
const multer = require("multer");
var path = require("path");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
const upload = multer();
const stripJs = require("strip-js");
const exphbs = require("express-handlebars");
const aData = require("./auth-service.js");
const clientSession = require("client-sessions");
var HTTP_PORT = process.env.PORT || 8080;

app.engine(
    ".hbs",
    exphbs.engine({
        extname: ".hbs",
        helpers:{
            navLink:
            function(url, options)
            {
                return(
                    "<li" + (url == app.locals.activeRoute ? ' class="active" ' :"") + '><a href="' + url + '">' + options.fn(this) + "</a></li>");
            },

            equal: function(options, value1, value2)
            {
                if (arguments.length < 3)
                {
                    throw new Error("Handlebars Helpers equal needs 2 parameters");
                }
                if (value1 != value2)
                {
                    return options.inverse(this);
                }
                else{
                    return options.fn(this);
                }
            },
            safeHTML: function(item)
            {
                return stripJs(item);

            },
            formateDate: function(ddata)
            {
                let year = ddate.getFullYear();
                let month = (ddate.getMonth() + 1).toString();
                let day = ddate.getDate().toString();
                return `${year}-${month.padstart(2, "0")}-${dday.padstart(2, "0")}`;
            }
        }
    
    })
)
app.set("view engine", ".hbs");
app.use(
    clientSession({
        cookieName: "session",
        secret: "web-322-app",
        duration: 2 * 60 * 1000,
        activeDuration: 1000 * 60,
    })
);
app.use(express.static("static"));
app.use(express.urlencoded({extended:true}));
cloudinary.config(
    {
        cloud_name: "seneca-college11",
        api_key: "334783279742974",
        api_secret: "QlfTrwtIZquvMAYD8hYa7vAcRlg",
        secret: true,
    }
)
function onHTTPStart()
{
    console.log("Listening on: " + HTTP_PORT);
}

app.use(function(req,res,next)
{
    res.locals.session = req.session;
    next();
})

function letsLogin(req,res,next)
{
    if (!req.session.user)
    {
        res.redirect("/login");
    }
    else{
        next();
    }
}

app.use(function(req,res,next)
{
    let rr = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(rr.split("/")[1]) ? rr.replace(/\/(?!.*)/,""): rr.replace(/\/(.*)/,""));
    app.locals.viewingCategory = req.query.category; 
    next();
})

app.get("/", function(req,res)
{
    res.redirect("/blog");
})
app.get("/about", function(req,res)
{
    res.render(path.join(__dirname, "/views/about.hbs"));
})
app.get("/blog", async(req,res)=>
{
    let view = {};
    try{


        let post = [];
        if(req.query.category)
        {
            post = await data.getPostsByCategory(req.query.category);
        }
        else{
            post = await data.getPublishedPosts();
        }
        post.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        let posts = post[0];
        view.post = post;
        view.posts = posts;
    }catch(err)
    {
        view.message= "no results";
    }

    try{
        let categories = await  data.getCategories();
        view.categories = categories;
    }catch(err)
    {
        view.categoriesMessage = "no results";
    }
    res.render("blog", 
    {
        data:view
    })    
})
app.get("/blog/:id", async(req,res)=>
{
    let view= {};
    try{
        let posts=[];

        if(req.query.category)
        {
            posts = await data.getPublishedPostsByCategory(req.query.category);
        }
        else{
            posts = await data.getPublishedPosts();
        }
        posts.sort((a,b)=> new Date(b.postDate)- new Date(a.postDate));
        view.posts = posts;
    }catch(err)
    {
        view.message = "no results";
    }

    try{
        view.post = await data.getPostBtId(req.params.id);
    }catch(err)
    {
        view.message = "no results found";
    }
    try{
        let cat = await data.getCategories();
        view.categories = categories;
    }catch(err)
    {
        view.categoriesMessage = "no results";
    }
    res.render("blog", {data: viewData});

})
app.get("/posts", letsLogin, (req,res)=>
{
    try{
        if(req.query.category)
        {
            data.getPostsByCategory(req.query.category).then((data)=>
            {
                res.render("posts", 
                {
                    posts: data
                })
            })
        }
        else if (req.query.minDate)
        {
            data.getPostsByMinDate(req.query.minDate).then((data)=>
            {
                res.render("posts", 
                {
                    posts: data
                })
            })
        }
        else{
            data.getAllPosts().then((data)=>
            {
                if(data.length > 0)
                {
                    res.render("posts",
                    {
                        posts:data
                    })
                }
                else{
                    res.render("posts",
                    {
                        message: "no results founds"
                    })
                }
            })
        }
    } catch(err)
    {
        res.render("posts", 
        {
            message: "no results found"
        })
    }
})
app.get("/posts/:id", letsLogin, function(req,res)
{
    try
    {
        
        data.getPostById(req.params.id).then((data) =>
        {
            res.render("posts", 
            {
                posts: data
            })
        })
    }catch(err)
    {
        res.render("posts", {message: "no results founds"})
    }
})
app.get("/categories", letsLogin, (req,res)=>
{
    try
    {

        data.getCategories().then((data)=>
        {
            if (data > 0)
            {
                res.render("categories", 
                {
                    categories: data
                })
            }
            else {
                res.render("categories",
                {
                    messages: "no results"
                })
            }
        })
    }catch(err)
    {
        res.render("categories",
        {
            message: "no results found"
        })
    }
})
app.get("/posts/add", letsLogin, (req,res)=>
{
    data.getCategories.then((data)=>
    {
        res.render("addPost.hbs",
        {
            categories: data
        })
    })
    .catch((err)=>
    {
        res.render("addPost.hbs",
        {
            categories: []
        })
    })
})
app.get("/categories/add", letsLogin, (req,res)=>
{
    res.render(path.join(__dirname, "views/addCategory.hbs"));
})
app.get("/categories/delete/:id", letsLogin, (req,res)=>
{
    data.deleteCategoryById(req.params.id)
    .then(()=>
    {
        res.redirect("/categories");
    })
    .catch(function(err)
    {
        res.status(500).send("Unable to Remove Category / Category not found");
    })
})
app.get("/posts/delete/:id", letsLogin, (req,res) => 
{
    data.deletepostById(req.params.id)
    .then(()=>{
        res.redirect("/posts");
    })
    .catch(function(err)
    {
        res.status(500).send("Unable to Remove post/ post not found")
    })
})
app.get("/login", (req,res)=>
{
    res.render(path.join(__dirname, "/views/login.hbs"))
})
app.get("/register", (req,res) => 
{
    res.render(path.join(__dirname, "/views/register.hbs"))
})

app.post("/posts/add", letsLogin, upload.single("featureImage"), (req,res) => 
{
    let streamCloud = (req)=>
    {
        return new Promise((resolve, reject)=>
        {
            let stream = cloudinary.uploader.upload_stream((error,result)=> {
                if (result)
                {
                    resolve(result);
                }
                else{
                    reject(error);
                }
            })
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        })

    }
    async function upload(req)
    {
        let answer = await streamUpload(req);
        console.log(answer);
        return answer;
    }
    upload(req).then((uploaded) =>
    {
        req.body.featureImagine = uploaded.url;
        data.addPost(req.body).then(()=>
        {
            res.redirect("/posts");
        })
    })
    
})
app.post("/categories/add", letsLogin, (req,res)=>
{
    data.addCategory(req.body).catch.then(()=>{
        res.redirect("/categories");
    })
})
app.post("/register", (req,res)=>
{
    aData.registerUser(req.bod)
    .then(()=>{
        res.render("register.hbs",
        {
            message: "User Created",
        })
    })
    .catch(function(err)
    {
        res.render("register.hbs",
        {
            message: err,
            userName: req.body.userName,
        })
    })
})
app.post("/login", (req,res)=>
{
    req.body.userAgent = req.get("User-Agent");
    aData
    .checkUser(req.body)
    .then((user)=>
    {
        req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
        }
        res.redirect("/posts");
    }).catch(function(err)
    {
        res.render("login.hbs",
        {
            errorMessage: err,
            userName: req.body.userName,
        })
    })

})
app.get("/userHistory", letsLogin, (req,res)=>
{
    res.render("userHistory.hbs");
})
app.get("/logout", (req,res)=>
{
    req.session.reset();
    res.redirect("/");
})
app.use((req,res)=> {
    res.status(404).render("404.hbs");
})
data
.initialize()
.then(aData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT);
    })
})
.catch(function(err)
{
    console.log("unable to start server: " + err);
})
