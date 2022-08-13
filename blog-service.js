const Sequelize = require("sequelize");
var sequelize = new Sequelize('d2dub26c1ar7gf', 'phbhkinzlasfad', 'd424512494baf2f473a2eebe43d9b5a3a6c1b34c845a57971d220fc29cf5ec7e',
{
    host: 'ec2-52-207-15-147.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions:
    {
        ssl:
        {
            rejectUnauthorized:false
        }
    },
    query:
    {
        raw:true
    }
})

var Post = sequelize.define("Post", 
{
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,

});

var Category = sequelize.define("Category",
{

    category: Sequelize.STRING,
});

Post.belongsTo(Category,
    {
        foreignKey: "category"
    })


module.exports.initialize = function()
{
    return new Promise((resolve,reject)=>
    {
        sequelize.sync()
        sequelize.then(()=> {
            resolve();
        })
        .catch(()=>
        {
            reject("Unable to sync with the database");
        })

    })
}

module.exports.getCategories = function()
{
    return new Promise((resolve, reject)=>
    {
        Category.find()
            .then(function(data)
            {
                resolve(data);
            })
            .catch((err=>
                {
                 
                    reject("no results returned");
                }
                
                ))
    })
}

module.exports.getPostsByCategory = function(cat)
{
    return new Promise((resolve, reject)=>
    {
        Post.findall(
            {
                where:
                {
                    category:cat,
                },
            }
        )
        .then(function(data)
        {
            resolve(data);
        })
        .catch((err)=>
        {
            reject("no results returned");
        })
    })
}

module.exports.addCategory= function(cat)
{
    return new Promise((resolve,reject)=>
    {
        for(const i in cat)
        {
            if(`${cat[i]}`== "")
            {
                `cat.${i}== null`;
            }
        }
        Category.create(cat)
        .then(()=>
        {
            resolve();
        })
    })
}

module.exports.deleteCategoryById = function(data)
{
    return new Promise((resolve, reject)=>
    {
        Category.destroy({
            where:
            {
                id: data,
            },
        })
        .then(()=>
        {
            resolve();
        })
        .catch((err)=>
        {
            reject("Unable to delete category");
        })
    })
}

module.exports.getPublishedPostsByCategory = function(cat)
{
    return new Promise((resolve, reject)=>
    {
        Post.findAll(
            {
                where:
                {
                    published:true,
                    category: cat,
                },
            }
        )
        .then(function(data)
        {
            resolve(data);
        })
        .catch((err)=>
        {
            reject("no results returned");
        })
    })
}

module.exports.getAllPosts = function()
{
    return new Promise((resolve,reject)=>
    {
        Post.findAll()
        .then(function(data)
        {
            resolve(data);
        })
        .catch((err)=>
        {
            reject("no results returned");
        })
    })
}

module.exports.getPublishedPosts = function()
{
    return new Promise((resolve, reject)=>
    {
        Post.findAll(
            {
                where:
                {
                    published:true,
                },

            })
            .then(function(data)
            {
                resolve(data);
            })
            .catch((err)=>
            {
                reject("No results returned");
            })
    }   )
    
}

module.exports.addPost = function(data)
{
    return new Promise((resolve, reject)=>
    {
        data.published = data.published ? true: false;
        for(const a in data)
        {
            if(`${data[a]}`=="")
            {
                `data.$[a] = null`;
            }
        }
        Post.create(data)
        .then(()=>
        {
            resolve();
        })
        .catch((err)=>
        {
            reject("Unable to create post");
        })
    })
}

module.exports.getPostById = function(data)
{
    return new Promise((resolve, reject)=>
    {
        Post.findAll(
            {
                where:
                {
                    id: data,
                },
            }
        )
        .then(function(data)
        {
            resolve(data);
        })
        .catch((err)=>
        {
            reject("No results returned");
        })
    })
}

module.exports.getPostsByMinDate = function(data)
{
    return new Promise((resolve, reject)=>
    {
        Post.findAll(
            {
                where:
                {
                    postDate:
                    {
                        [gte] : new Date(data),
                    },
                },
            }
        )
        .then(function(data)
        {
            resolve(data);
        })
        .catch((err)=>
        {
            reject("No results returned");
        })
    })
}

module.exports.deletepostById = function(data)
{
    return new Promise((resolve, reject)=>
    {
        Post.destroy(
            {
                where:
                {
                    id: data,
                },
            }
        )
        .then(()=> {
            resolve();
        })
        .catch((err)=>
        {
            reject("Unable to delete post");
        })
    })
}