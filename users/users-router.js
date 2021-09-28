const express = require("express")
const bcrypt = require("bcryptjs")
const knex = require("knex")
const Users = require("./users-model")
const db = require("../database/config")
const { validateUser, restrict } = require('./user-middleware');


const router = express.Router()

router.get('/users', restrict(), async (req, res, next) => {
    try{
        return res.status(200).json(await Users.getUsers());
    } catch(error){
        next(error)
    }
})


router.post('/register', validateUser(), async (req, res, next) => {
    try{
        const { username, password, department } = req.body;
        const user = await Users.getUserBy({ username });

        console.log(user);

        if(user){
            return res.status(409).json({
                errorMessage: "Username is taken"
            })
        }

        const newUser = await Users.addUser({
            username,
            password: await bcrypt.hash(password, 14),
            department
        })

        return res.status(200).json(newUser)
    } catch(error){
        next(error)
    }
})
router.post('/login', async (req, res, next) => {
    try{
        const { username, password } = req.body;
        const user = await Users.getUserBy({ username });

        if(!user){
            return res.status(401).json({
                errorMessage: "Invalid credentials"
            })
        }

        const passwordValidate = await bcrypt.compare(password, user.password);

        if(!passwordValidate){
            return res.status(401).json({
                errorMessage: "Invalid credentials"
            })
        }
				// Generate a new JSON web token
				const token = jwt.sign({
				            userID: user.id,
				            userDep: user.department
				        }, process.env.TOKEN_SECRET)

				        res.cookie("token", token);

				        return res.status(200).json({
				            message: `Welcome ${user.username}`
				        })

				    } catch(error){
				        next(error)
				    }
				})

				module.exports = router;
