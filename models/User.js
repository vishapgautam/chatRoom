const mongoose=require("mongoose");
const { v4: uuidv4 } = require('uuid');//in place of import {v4 as uuidv4} from "uuid"

module.exports.USER_TYPES = {
  CONSUMER: "consumer",
  SUPPORT: "support"
};

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    firstName: String,
    lastName: String,
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    type: String,
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.statics.createUser = async function (
	firstName, 
    	lastName,
      email,
      password,
    	type
) {
  try {
    const user = await this.create({ firstName, lastName,email,password, type });
    return user;
  } catch (error) {
    throw error;
  }
}

userSchema.statics.getUserById = async function (id) {
    try {
      const user = await this.findOne({ _id: id });
      if (!user) throw ({ error: 'No user with this id found' });
      return user;
    } catch (error) {
      throw error;
    }
  }

  userSchema.statics.getUsers = async function () {
    try {
      const users = await this.find();
      return users;
    } catch (error) {
      throw error;
    }
  }

  userSchema.statics.deleteByUserById = async function (id) {
    try {
      const result = await this.remove({ _id: id });
      return result;
    } catch (error) {
      throw error;
    }
  }

  userSchema.statics.getUserByIds = async function (ids) {
    try {
      const users = await this.find({ _id: { $in: ids } });
      return users;
    } catch (error) {
      throw error;
    }
  }

module.exports=mongoose.model("User", userSchema);