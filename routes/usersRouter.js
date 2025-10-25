var express = require('express');
var router = express.Router();
const userController=require('../controllers/userController')
router.post('/',userController.createUser);
router.get('/',userController.getAllUsers);
router.get('/:id',userController.getUserById);
router.put('/:id',userController.updateUserById);
router.delete('/:id',userController.deleteUserById);
//Auth route
router.post('/login',userController.loginUser);


module.exports = router;  