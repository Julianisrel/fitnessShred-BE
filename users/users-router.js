const express = require("express")
const bcrypt = require("bcryptjs")
const knex = require("knex")({ client: 'sqlite3', useNullAsDefault: true });
const Users = require("./users-model")
const db = require("../database/config")
const jwt = require("jsonwebtoken")
const secret = require("./serect")
const { validateUser, restrict } = require('./user-middleware');

const router = express.Router()

router.get('/users', restrict(), async (req, res, next) => {
    try {
        return res.status(200).json(await Users.getUsers());
    } catch (error) {
        next(error)
    }
})

router.post('/register', validateUser(), async (req, res, next) => {
    try {
        const { username, password, department } = req.body;
        const user = await Users.getUserBy({ username });

        if (user) {
            return res.status(409).json({
                errorMessage: "Username is taken"
            })
        } else {
            const newUser = await Users.addUser({
                username,
                password: await bcrypt.hash(password, 14),
                department
            })

            return res.status(200).json(newUser)
        }
    } catch (error) {
        next(error)
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await Users.getUserBy({ username });

        if (!user) {
            return res.status(401).json({
                errorMessage: "Invalid credentials"
            })
        }

        const passwordValidate = await bcrypt.compare(password, user.password);

        if (!passwordValidate) {
            return res.status(401).json({
                errorMessage: "Invalid credentials"
            })
        }
        // Generate a new JSON web token
        const token = jwt.sign({
            userID: user.id,
            userDep: user.department
        }, secret.jwtSecret)

        // res.cookie("token", token);

        user.token = token;

        return res.status(200).json({
            user
        })

    } catch (error) {
        next(error)
    }
});

module.exports = router;
