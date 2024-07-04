// Import firebase modules
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const { Timestamp } = require("firebase-admin/firestore");

// Using destructuring assignment to extract logger properties
// from functions and assign it to logger variable.
const {logger} = functions;

// Defining the firebase cloud function and assigning it to addMessage.
// Inorder to invoke the firebase function, just call addMessage
// from cilent side.
// Async arrow function which takes in data and context as input.
exports.addMessage = functions.https.onCall(async (data, context) => {
  try {
    logger.log("Received message request data:", data);

    // Validate required fields
    if (!data.text || !data.userId) {
      logger.log("Required fields (text or userId) are missing");
      throw new functions.https.HttpsError(
          "Invalid argument",
          "Required fields (text or userId) are missing",
      );
    }

    // Destructuring assignment -  extract text and userId from
    // data and assign it to variables.
    const {text, userId} = data;

    // Construct message data
    const messageData = {
      text,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add message to the user's message sub collection in firestore
    // await is used to wait for the asynchronous operation to complete
    // and get the reference to the newly created document.
    const messageRef = await admin
        .firestore()
        .collection("chats")
        .doc(userId)
        .collection("messages")
        .add(messageData);

    logger.log("Message added successfully, message ID: ", messageRef.id);

    return {status: "success", messageId: messageRef.id};
  } catch (error) {
    logger.error("Error adding message:", error);

    throw new functions.https.HttpsError(
        "unknown",
        "An error occured while adding the message",
        error.message,
    );
  }
});

