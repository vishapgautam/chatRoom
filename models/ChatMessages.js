const mongoose=require('mongoose');
const {v4:uuidv4}=require('uuid');

const MESSAGE_TYPES={TYPE_TEXT:'text'};

const readByRecipientSchema=new mongoose.Schema(
    {
        _id: false,
        readByUserId: String,
        readAt: {
         type: Date,
         default: Date.now(),
    },
},
{
    timestamps: false,
  }
)

const chatMessageSchema = new mongoose.Schema(
    {
      _id: {
        type: String,
        default: () => uuidv4().replace(/\-/g, ""),
      },
      chatRoomId: String,
      message: mongoose.Schema.Types.Mixed,
      type: {
        type: String,
        default: () => MESSAGE_TYPES.TYPE_TEXT,
      },
      postedByUser: String,
      UserName:String,
      readByRecipients: [readByRecipientSchema],
    },
    {
      timestamps: true,
      collection: "chatmessages",
    }
  );

  chatMessageSchema.statics.createPostInChatRoom = async function (chatRoomId, message, postedByUser,UserName) {
    try {
      const post = await this.create({
        chatRoomId,
        message,
        postedByUser,
        UserName,
        readByRecipients: { readByUserId: postedByUser }
      });
      const aggregate = await this.aggregate([
        // get post where _id = post._id
        { $match: { _id: post._id } },
        // do a join on another table called users, and 
        // get me a user whose _id = postedByUser
        {
          $lookup: {
            from: 'users',
            localField: 'postedByUser',
            foreignField: '_id',
            as: 'postedByUser',
          }
        },
        { $unwind: '$postedByUser' },
        // do a join on another table called chatrooms, and 
        // get me a chatroom whose _id = chatRoomId
        {
          $lookup: {
            from: 'chatrooms',
            localField: 'chatRoomId',
            foreignField: '_id',
            as: 'chatRoomInfo',
          }
        },
        { $unwind: '$chatRoomInfo' },
        { $unwind: '$chatRoomInfo.userIds' },
        // do a join on another table called users, and 
        // get me a user whose _id = userIds
        {
          $lookup: {
            from: 'users',
            localField: 'chatRoomInfo.userIds',
            foreignField: '_id',
            as: 'chatRoomInfo.userProfile',
          }
        },
        { $unwind: '$chatRoomInfo.userProfile' },
        // group data
        {
          $group: {
            _id: '$chatRoomInfo._id',
            postId: { $last: '$_id' },
            chatRoomId: { $last: '$chatRoomInfo._id' },
            message: { $last: '$message' },
            type: { $last: '$type' },
            postedByUser: { $last: '$postedByUser' },
            readByRecipients: { $last: '$readByRecipients' },
            chatRoomInfo: { $addToSet: '$chatRoomInfo.userProfile' },
            createdAt: { $last: '$createdAt' },
            updatedAt: { $last: '$updatedAt' },
          }
        }
      ]);
      return aggregate[0];
    } catch (error) {
      throw error;
    }
  }

  chatMessageSchema.statics.getConversationByRoomId = async function (chatRoomId, options = {}) {
    try {
      return this.aggregate([
        { $match: { chatRoomId } },
        { $sort: { createdAt: -1 } },
        // do a join on another table called users, and 
        // get me a user whose _id = postedByUser
        {
          $lookup: {
            from: 'users',
            localField: 'postedByUser',
            foreignField: '_id',
            as: 'postedByUser',
          }
        },
        { $unwind: "$postedByUser" },
        // apply pagination
        { $skip: options.page * options.limit },
        { $limit: options.limit },
        { $sort: { createdAt: 1 } },
      ]);
    } catch (error) {
      throw error;
    }
  }

  chatMessageSchema.statics.markMessageRead = async function (chatRoomId, currentUserOnlineId) {
    try {
      return this.updateMany(
        {
          chatRoomId,
          'readByRecipients.readByUserId': { $ne: currentUserOnlineId }
        },
        {
          $addToSet: {
            readByRecipients: { readByUserId: currentUserOnlineId }
          }
        },
        {
          multi: true
        }
      );
    } catch (error) {
      throw error;
    }
  }
  
module.exports= mongoose.model("ChatMessage", chatMessageSchema)