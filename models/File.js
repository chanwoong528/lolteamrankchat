// models/File.js

var mongoose = require('mongoose');
var fs = require('fs'); // 1
var path = require('path'); // 2


// schema
var fileSchema = mongoose.Schema({ // 1
  originalFileName:{type:String},
  serverFileName:{type:String},
  size:{type:Number},
  uploadedBy:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  postId:{type:mongoose.Schema.Types.ObjectId, ref:'post'},
  isDeleted:{type:Boolean, default:false},
});


fileSchema.methods.processDelete = function(){ // 4
  this.isDeleted = true;
  this.save();
};

fileSchema.methods.getFileStream = function(){
  var stream;
  var filePath = path.join(__dirname,'..','uploadedFiles',this.serverFileName); // 5-1
  var fileExists = fs.existsSync(filePath); // 5-2
  if(fileExists){ // 5-3
    stream = fs.createReadStream(filePath);
  }
  else { // 5-4
    this.processDelete();
  }
  return stream; // 5-5
};

fileSchema.methods.bytesConversion = function(){
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  var bytes = this.size;
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

// model & export
var File = mongoose.model('file', fileSchema);

// model methods
File.createNewInstance = async function(file, uploadedBy, postId){ // 2
  return await File.create({
      originalFileName:file.originalname,
      serverFileName:file.filename,
      size:file.size,
      uploadedBy:uploadedBy,
      postId:postId,
    });
};

module.exports = File;
