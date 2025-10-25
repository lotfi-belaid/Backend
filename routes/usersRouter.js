var express = require('express');
var router = express.Router();
const userController=require('../controllers/userController')
router.post('/createUser',userController.createUser);
router.get('/getAllUsers',userController.getAllUsers);
router.get('/getUserById/:id',userController.getUserById);
router.put('/updateUserById/:id',userController.updateUserById);
router.delete('/deleteUserById/:id',userController.deleteUserById);
//Auth route
router.post('/login',userController.loginUser);


module.exports = router;  