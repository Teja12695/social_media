//importing mysql module
const mysql = require('mysql2')


// connection to database of mysql
const connection = mysql.createPool({
    host : '127.0.0.1',
    user:'root',
    password:'password',
    database:'real_news_media'
}).promise()


// reading posts from post table
async function readPosts(){
    const output = await connection.query("select * from posts")
    return output[0]
}

//reading required user information from users table with profile fieldname
async function readUsers(username){
    const output = await connection.query("select * from users where username = '"+ username+"'")
    return output[0]
}


//inserting data into users table
async function insertUsers(fullname,username,email,profile,headline,password){
    const output = await connection.query(
        "insert into users (fullname,username,email,profile,headline,password) values(?,?,?,?,?,?)",[fullname,username,email,profile,headline,password]
    )

}

//inserting data into posts table
async function insertPosts(username,profile,content){
    const output = connection.query("insert into posts(username,profile,content,likes,shares) values (?,?,?,?,?)",[username,profile,content,0,0])
}



// to increase the count of likes when click on the like button
async function like(content){
    const output = await connection.query("select likes from posts where content ='"+content+"' ")
    const like = output[0][0].likes
    const inclikes = like + 1
    await connection.query("update posts set likes='"+inclikes+"' where content ='"+content+"'  " )
}


// to increase the count of shares when click on the shares button
async function share(content){
    const output = await connection.query("select shares from posts where content ='"+content+"' ")
    const share = output[0][0].shares
    const incshares = share + 1
    await connection.query("update posts set shares='"+incshares+"' where content ='"+content+"'  " )
}

//to delete a post 
async function del(content){
    await connection.query("delete from posts where content ='"+content+"' ")
}




//exporting the created modules
module.exports = {
    readPosts,readUsers,insertUsers,insertPosts,like,share,del
}