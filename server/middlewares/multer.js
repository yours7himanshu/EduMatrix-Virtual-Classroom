const multer = require('multer');

const storage = multer.diskStorage({
    filename:function(req,file,callback){
        callback(null,file.originalname);
    }

});
const upload = multer({storage});
module.exports=upload;
