/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
async function getMessageDetail(req, res, next) {
    try {
      const messageId = req.params.id;
      const loggedInUser = req.user; 

const message = await Message.get(messageId); 

if (loggedInUser.username !== message.from_user.username && loggedInUser.username !== message.to_user.username) {
  return res.status(403).json({ error: "Unauthorized to access this message." });
}


const messageDetail = {
  id: message.id,
  body: message.body,
  sent_at: message.sent_at,
  read_at: message.read_at,
  from_user: {
    username: message.from_user.username,
    first_name: message.from_user.first_name,
    last_name: message.from_user.last_name,
    phone: message.from_user.phone
  },
  to_user: {
    username: message.to_user.username,
    first_name: message.to_user.first_name,
    last_name: message.to_user.last_name,
    phone: message.to_user.phone
  }
};

return res.json({ message: messageDetail });

    } catch (error) {
      return next(error);
    }
  }
  

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
app.post('/', async (req, res, next) => {
    try {
      const { to_username, body } = req.body;
      const from_username = req.user.username; // Assuming the user data is available in the request object
  
      // Validate that the 'to_username' exists in the database
      const toUser = await User.get(to_username); // Replace with your appropriate method for fetching the user details
      if (!toUser) {
        return res.status(404).json({ error: "User not found." });
      }
  
      // Create a new message with the provided data and the current timestamp
      const newMessage = await Message.create({
        from_username,
        to_username,
        body
      });
  
      const messageResponse = {
        id: newMessage.id,
        from_username,
        to_username,
        body,
        sent_at: newMessage.sent_at
      };
  
      return res.json({ message: messageResponse });
    } catch (error) {
      return next(error);
    }
  });
  

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

app.post('/:id/read', async (req, res, next) => {
    try {
      const { id } = req.params;
      const message = await Message.get(id); // Assuming the method for fetching the message is named 'get'
  
      if (!message) {
        return res.status(404).json({ error: "Message not found." });
      }
  
      // Check if the currently logged-in user is the intended recipient
      const username = req.user.username; // Assuming the user data is available in the request object
      if (message.to_user.username !== username) {
        return res.status(403).json({ error: "Unauthorized to mark message as read." });
      }
  
      // Update the 'read_at' field of the message with the current timestamp
      const updatedMessage = await message.markRead();
  
      const response = {
        id: updatedMessage.id,
        read_at: updatedMessage.read_at
      };
  
      return res.json({ message: response });
    } catch (error) {
      return next(error);
    }
  });
  