import dotenv from 'dotenv'
dotenv.config()
import passport from "passport"
import PagesModel from "../schemas/pages.js"
import User from "../schemas/UserSchema.js";
import bcrypt from 'bcrypt'
import inviteModel from "../schemas/invites.js";
import settingsModel from "../schemas/Settings.js";
import path from 'path'
import {fileURLToPath} from 'url'


const saltRounds = 10; // Define saltRounds for bcrypt hashing

export const normalSignUp = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    const avatar = req.files?.avatar?.[0]?.filename || null;

    try {
        const isAccountExisted = await User.findOne({ email });
        if (isAccountExisted) {
            return res.status(400).json({
                error: true,
                message: "Account already exists"
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashedPassword, // Store the hashed password
            avatar
        });

        // Construct full avatar URL if avatar exists
        if (avatar) newUser.avatar = `http://localhost:8000/uploads/profile/avatars/${avatar}`;

        await newUser.save();

        // Log in the user right after signup using Passport's req.login
        req.login(newUser, (err) => {
            if (err) {
                console.error("Login after signup failed:", err);
                // If login fails, redirect to login page with a status
                return res.redirect(`${process.env.frontendURL}/login?auth_status=signup_login_failed`);
            }
            console.log("User logged in after signup (server-side):", req.user?._id || 'User object not available');
            // Redirect after successful login to ensure session cookie is properly set by browser
            res.redirect(`${process.env.frontendURL}/home`); // Redirect to home page
        });
    } catch (error) {
        console.error("Signup error:", error); // Log the actual error
        res.status(500).json({
            error: true,
            message: "Internal server problem" // Generic error for client
        });
    }
};

export const normalLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                error: true,
                message: "Account does not exist"
            });
        }

        if (!user.password) {
            return res.status(400).json({
                error: true,
                message: "This account was registered via social login. Please use Google or GitHub."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                error: true,
                message: "Incorrect password"
            });
        }

        // If credentials are correct, log in the user using Passport's req.login
        req.login(user, (err) => {
            if (err) {
                console.error("Login failed during session establishment:", err);
                // Ensure no headers have been sent before attempting to send an error response
                if (!res.headersSent) {
                    return res.status(500).json({
                        error: true,
                        message: "Login failed due to server error"
                    });
                }
                return; // Prevent further execution if headers were sent
            }

            
            if (!res.headersSent) { // Defensive check
                return res.status(200).json({
                    error: false,
                    message: "User has logged in successfully"
                });
            }
        });
    } catch (error) {
        console.error("Login attempt error:", error);
        if (!res.headersSent) { // Defensive check
            res.status(500).json({
                error: true,
                message: "Internal server problem"
            });
        }
    }
};

console.log('data in controllers.js')
console.log("frontendURL =", process.env.frontendURL);
console.log("DB =", process.env.DB);
console.log("SESSION_SECRET =", process.env.SESSION_SECRET);
console.log("googleClientID =", process.env.googleClientID);
console.log("googleClientSecret =", process.env.googleClientSecret);
console.log("googleCallbackURL =", process.env.googleCallbackURL);
console.log("githubClientID =", process.env.githubClientID);
console.log("githubClientSecret =", process.env.githubClientSecret);
console.log("githubCallbackURL =", process.env.githubCallbackURL);

export const firstGoogleRoute = passport.authenticate("google" , {
    scope: ['profile', 'email']
})

export const secondGoogleRoute =  passport.authenticate('google', {
    successRedirect: `${process.env.frontendURL}/home`, // Redirect if authentication succeeds
    failureRedirect: `${process.env.frontendURL}/login`,    // Redirect if authentication fails
})

export const firstGithubRoute = passport.authenticate('github' ,  { scope: ['user:email'] })

export const secondGithubRoute =  passport.authenticate('github', { 
   successRedirect: `${process.env.frontendURL}/home`, // No spaces, just the URL
failureRedirect: `${process.env.frontendURL}/login`
}
)

// ________________________________________________________________________________________

// Pages
export const createPage = async(req ,res)=>{
    const {name , type , icon , color, content}=req.body
    const userId = req.user.id

    if (!name || !type) {
        return res.status(400).json({
            error: true,
            message: "Name and type are required"
        });
    }
    try{
        const checkPage = await PagesModel.findOne({name})
        if(checkPage){
            return res.status(400).json({
                error:true,
                message:"A page with this name already exists"
            })
        }

        const newPage = new PagesModel({
            user:userId,
            name,
            type,
            icon,
            color,
            content
        })
        await newPage.save()

        return res.status(200).json({
            error:false,
            message:"page has been created",
            newPage
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            error:true,
            message:"internal server error"
        })
    }
}

export const getPages = async(req ,res)=>{
  const userId = req?.user?.id
    try{
        const pages = await PagesModel.find({user:userId})
        return res.status(200).json({
            error:false,
            pages
        })

    }catch(error){
        return res.status("500").json({
            error:true,
            message:"Internal server error"
        })
    }
}

export const getSpecificPage = async(req ,res)=>{
    const id = req.params.id
    try{
        const page = await PagesModel.findById(id)
        if(!page){
            return res.status(400).json({
                error:true,
                message:"page is not found"
            })
        }
        return res.status(200).json({
            error:false,
            page
        })
    }catch(error){
        console.error(error);
        return res.status(500).json({
            error:true,
            message:"internal server error"
        })
    }
}

export const deletePage = async (req, res) => {
    try {
        const { id } = req.params
        const deletedPage = await PagesModel.findByIdAndDelete(id)
        if (!deletedPage) {
        return res.status(404).json({ 
            message: "Page not found" 
        })
        }
        return res.status(200).json({ 
            message: "Page deleted"
        })
    } catch (error) {
        res.status(500).json({ message: "Server error", error })
    }
  }

export const updatePageContent = async (req, res) => {
    try {
        const page = await PagesModel.findById(req.params.id);

        if (!page) {
            return res.status(404).json({ error: "Page not found" });
        }

            // Step 1: Initialize missing fields
    switch (page.type) {
        case "todo":
            if (!Array.isArray(page.content.tasks)) {
                page.content.tasks = [];
                await page.save();
            }
            break;
        case "calendar":
            if (!Array.isArray(page.content.events)) {
                page.content.events = [];
                await page.save();
            }
            break;
        case "kanban":
            if (!Array.isArray(page.content.columns)) {
                page.content.columns = [];
                await page.save();
            }
            break
        case "notes":
            if (!Array.isArray(page.content.notes)){
                page.content.notes =[]
                await page.save();
            }
            break;
      }

        let updateQuery = {};

    switch (page.type) {
        case "todo":
            updateQuery = { $push: { "content.tasks": req.body.task } };
            break;

        case "calendar":
            updateQuery = { $push: { "content.events": req.body.event } };
            break;

        case "kanban":
            updateQuery = { $push: { "content.columns": req.body.column } };
            break;

        case "notes":
            updateQuery = { $push: { "content.notes": req.body.note } };
            break;

        default:
            return res.status(400).json({ error: "Invalid page type" });
        }

        const updatedPage = await PagesModel.findByIdAndUpdate(
            req.params.id,
            updateQuery,
            {
            new: true,
            runValidators: true
            }
        );

    res.status(200).json({
        error: false,
        message: "Content updated successfully",
        page: updatedPage,
    });
    } catch (err) {
        console.error("Error updating page:", err);
        res.status(500).json({ error: err.message });
    }
};

export const updateColumns = async (req, res) => {
    const { id } = req.params;
    const { columns } = req.body;
  
    try {
      const page = await PagesModel.findById(id);
  
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
  
      // Update the correct path - columns are inside content object
      page.content.columns = columns;
      await page.save();
  
      res.status(200).json({ message: 'Columns updated successfully', page });
    } catch (error) {
      console.error('Error updating columns:', error);
      res.status(500).json({ message: 'Error updating columns', error });
    }
  };

  // Update a specific note
export const updateNote = async (req, res) => {
    const { id } = req.params; // Note ID
    const { title, content, category } = req.body;
  
    try {
      // Find the page containing this note
      const page = await PagesModel.findOne({ "content.notes._id": id });
      
      if (!page) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      // Update the specific note in the notes array
      await PagesModel.updateOne(
        { "content.notes._id": id },
        { 
          $set: { 
            "content.notes.$.title": title,
            "content.notes.$.content": content,
            "content.notes.$.category": category,
            "content.notes.$.updatedAt": new Date()
          } 
        }
      );
      
      res.status(200).json({ message: 'Note updated successfully' });
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ message: 'Error updating note', error });
    }
  };
  
  // Update the full notes array (for reordering)
  export const updateNotes = async (req, res) => {
    const { id } = req.params; // Page ID
    const { notes } = req.body;
  
    try {
      const page = await PagesModel.findById(id);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      // Replace the entire notes array
      page.content.notes = notes;
      await page.save();
      
      res.status(200).json({ message: 'Notes order updated successfully' });
    } catch (error) {
      console.error('Error updating notes order:', error);
      res.status(500).json({ message: 'Error updating notes order', error });
    }
  };

export const deletePageContent = async (req, res) => {
    try {
        const pageId = req.params.pageId; // Changed from req.params.id
        const itemId = req.params.itemId;
        
        const page = await PagesModel.findById(pageId); // Changed from req.params.id

        if (!page) {
            return res.status(404).json({ error: "Page not found" });
        }
        
        if (!itemId) {
            return res.status(400).json({ error: "Item ID is required" });
        }

        let updateQuery = {};

        switch (page.type) {
            case "todo":
                updateQuery = { $pull: { "content.tasks": { _id: itemId } } };
                break;

            case "calendar":
                updateQuery = { $pull: { "content.events": { _id: itemId } } };
                break;

            case "kanban":
                updateQuery = { $pull: { "content.columns": { _id: itemId } } };
                break;

            case "notes":
                updateQuery = { $pull: { "content.notes": { _id: itemId } } };
                break;

            default:
                return res.status(400).json({ error: "Invalid page type" });
        }

        const updatedPage = await PagesModel.findByIdAndUpdate(
            pageId, // Changed from req.params.id
            updateQuery,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedPage) {
            return res.status(404).json({ error: "Failed to update page" });
        }

        res.status(200).json({
            error: false,
            message: `${page.type} item deleted successfully`,
            page: updatedPage,
        });
    } catch (err) {
        console.error("Error deleting page content:", err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteKanbanCard = async (req, res) => {
    try {
    const { pageId, columnId,cardId } = req.params;

    const page = await PagesModel.findById(pageId);

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    if (page.type !== "kanban") {
      return res.status(400).json({ error: "This page is not a kanban type" });
    }

    await PagesModel.findOneAndUpdate(
        {
          _id: pageId,
          "content.columns._id": columnId // Find the right column first
        },
        {
          $pull: {
            "content.columns.$.cards": { _id: cardId } // Remove the card from the matched column
          }
        },
        { new: true }
      );

    res.status(200).json({
      error: false,
      message: "Card deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting kanban card:", err);
    res.status(500).json({ error: err.message });
  }
};


export const updatePageFieldItem = async (req, res) => {
    try {
        const { pageId, itemId } = req.params;
        const updatedFields = req.body;
        
        if (!updatedFields || typeof updatedFields !== "object") {
            return res.status(400).json({ error: "updatedFields data is required in request body" });
        }
        
        const page = await PagesModel.findById(pageId);
        if (!page) {
            return res.status(404).json({ error: "Page not found" });
        }
        
        switch (page.type) {
            case "todo":
                // Create dynamic update object based on fields in request body
                let todoUpdate = {};
                Object.keys(updatedFields).forEach(field => {
                    todoUpdate[`content.tasks.$.${field}`] = updatedFields[field];
                });
                
                // Perform the update
                const updatedTodoPage = await PagesModel.findOneAndUpdate(
                    { _id: pageId, "content.tasks._id": itemId },
                    { $set: todoUpdate },
                    { new: true }
                );
                
                if (!updatedTodoPage) {
                    return res.status(404).json({ error: "Todo item not found" });
                }
                
                res.status(200).json({
                    error: false,
                    message: "Todo item updated successfully",
                    page: updatedTodoPage
                });
                break;
                
            case "calendar":
                let calendarUpdate = {};
                Object.keys(updatedFields).forEach(field => {
                    calendarUpdate[`content.events.$.${field}`] = updatedFields[field];
                });
                
                const updatedCalendarPage = await PagesModel.findOneAndUpdate(
                    { _id: pageId, "content.events._id": itemId },
                    { $set: calendarUpdate },
                    { new: true }
                );
                
                if (!updatedCalendarPage) {
                    return res.status(404).json({ error: "Calendar event not found" });
                }
                
                res.status(200).json({
                    error: false,
                    message: "Calendar event updated successfully",
                    page: updatedCalendarPage
                });
                break;
                
            case "kanban":
                // For kanban, we need to use array filters to update nested arrays
                let kanbanUpdate = {};
                Object.keys(updatedFields).forEach(field => {
                    kanbanUpdate[`content.columns.$[column].cards.$[card].${field}`] = updatedFields[field];
                });
                
                const updatedKanbanPage = await PagesModel.findOneAndUpdate(
                    { _id: pageId },
                    { $set: kanbanUpdate },
                    { 
                        new: true,
                        arrayFilters: [
                            { "column.cards._id": itemId },  // Find column containing the card
                            { "card._id": itemId }          // Find the specific card
                        ]
                    }
                );
                
                if (!updatedKanbanPage) {
                    return res.status(404).json({ error: "Kanban card not found" });
                }
                
                res.status(200).json({
                    error: false,
                    message: "Kanban card updated successfully",
                    page: updatedKanbanPage
                });
                break;
                
            case "notes":
                let notesUpdate = {};
                Object.keys(updatedFields).forEach(field => {
                    notesUpdate[`content.notes.$.${field}`] = updatedFields[field];
                });
                
                const updatedNotesPage = await PagesModel.findOneAndUpdate(
                    { _id: pageId, "content.notes._id": itemId },
                    { $set: notesUpdate },
                    { new: true }
                );
                
                if (!updatedNotesPage) {
                    return res.status(404).json({ error: "Note not found" });
                }
                
                res.status(200).json({
                    error: false,
                    message: "Note updated successfully",
                    page: updatedNotesPage
                });
                break;
                
            default:
                return res.status(400).json({ error: "Invalid page type" });
        }
    } catch (err) {
        console.error("Error updating item:", err);
        res.status(500).json({ error: err.message });
    }
};

export const updateColumnSettings = async (req, res) => {
    const { pageId, columnId } = req.params;
    const { name, color , status } = req.body;
  
    try {
      // Build the dynamic update object
      const update = {};
      if (name !== undefined) update["content.columns.$.name"] = name;
      if (color !== undefined) update["content.columns.$.color"] = color;
      if (status !== undefined) update["content.columns.$.status"] = status;
  
      // Perform update using $set and arrayFilters
      const result = await PagesModel.findOneAndUpdate(
        { _id: pageId, "content.columns._id": columnId },
        { $set: update },
        { new: true }
      );
  
      if (!result) {
        return res.status(404).json({ message: 'Page or column not found' });
      }
  
      // Find the updated column from the returned document
      const updatedColumn = result.content.columns.find(col => col._id.toString() === columnId);
  
      res.status(200).json({ message: 'Column settings updated successfully', column: updatedColumn });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while updating column settings', error });
    }
  };

  
export const addCardToKanbanColumn = async (req, res) => {
    const { pageId, columnId } = req.params;
    const { card } = req.body;
  
    try {
      const result = await PagesModel.findOneAndUpdate(
        {
          _id: pageId,
          'content.columns._id': columnId, // this allows the `$` to work
          type: 'kanban',
        },
        {
          $push: { 'content.columns.$.cards': card },
        },
        { new: true }
      );
  
      if (!result) {
        return res.status(404).json({ message: 'Page or column not found or not a kanban type' });
      }
  
      res.status(200).json({ message: 'Card added successfully', updatedPage: result });
    } catch (error) {
      console.error('Error adding card:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// teammates
export const getSpecificUser =async (req , res)=>{
    const {searchTerm}=req.body
    try{
        const normalUser = await validationModel.find({
            $or: [{ name: searchTerm }, { email: searchTerm }]
        })
        const googleUser = await googleModel.find({
            $or: [{ name: searchTerm }, { email: searchTerm }]
        })
        const gitHubUser = await githubModel.find({
            $or: [{ name: searchTerm }, { email: searchTerm }]
        })

        if(normalUser){
            return res.status(200).json({
                error:false,
                normalUser
            })
        }else if(googleUser){
            return res.status(200).json({
                error:false,
                googleUser
            })
        }else if(gitHubUser){
            return res.status(200).json({
                error:false,
                gitHubUser
            })
        }
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}

export const getAllUsers =async (req , res)=>{
    try{
        const users = await User.find()

        return res.status(200).json({
            error:false,
            users
        })
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}

export const updateNotesOrders = async (req, res) => {
    const { pageId } = req.params;
    const { notes } = req.body; // This 'notes' array is the new, ordered array from the frontend

    console.log(`[BACKEND] Received PUT request for pageId: ${pageId}`);
    // Optional: Log a few titles to confirm content
    // notes.slice(0, 2).forEach((n, i) => console.log(`  ${i}: ${n.title}`)); 

    try {
        // Use findOneAndUpdate to directly update the content.notes field
        const updatedPage = await PagesModel.findOneAndUpdate(
            { _id: pageId }, // Query: Find the document by ID
            { $set: { "content.notes": notes } }, // Update: Set the 'content.notes' field to the new 'notes' array
            { new: true, runValidators: true } // Options: Return the updated document, run schema validators
        );

        if (!updatedPage) {
            console.log(`[BACKEND] Page with ID ${pageId} not found.`);
            return res.status(404).json({ error: "Page not found" });
        }

        console.log(`[BACKEND] Notes order updated successfully for pageId: ${pageId}`);
        res.status(200).json({ message: "Notes updated successfully" });

    } catch (error) {
        console.error(`[BACKEND] Error updating notes for pageId ${pageId}:`, error);
        // In a real application, you might want to differentiate errors.
        // For now, a generic 500 is fine.
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateKanbanBoard = async (req, res) => {
    const { pageId } = req.params;
    const { columns } = req.body; // This 'columns' array will contain the updated order of columns and cards

    console.log(`[BACKEND] Received PUT request to update Kanban board for pageId: ${pageId}`);
    // Optional: Log a snippet of the received columns for debugging
    // if (columns && columns.length > 0) {
    //   console.log(`[BACKEND] Received columns (first column name): ${columns[0]?.name}`);
    // }

    try {
        // Use findOneAndUpdate to directly update the 'content.columns' field
        const updatedPage = await PagesModel.findOneAndUpdate(
            { _id: pageId, type: 'kanban' }, // Query: Find the document by ID and ensure it's a kanban type
            { $set: { "content.columns": columns } }, // Update: Set the 'content.columns' field to the new 'columns' array
            { new: true, runValidators: true } // Options: Return the updated document, run schema validators
        );

        if (!updatedPage) {
            console.log(`[BACKEND] Kanban page with ID ${pageId} not found or not of type 'kanban'.`);
            return res.status(404).json({ error: "Kanban page not found" });
        }

        console.log(`[BACKEND] Kanban board columns updated successfully for pageId: ${pageId}`);
        res.status(200).json({ message: "Kanban board updated successfully" });

    } catch (error) {
        console.error(`[BACKEND] Error updating Kanban board for pageId ${pageId}:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendInvites = async (req, res) => {
  try {
    const { receiverIds, pageId} = req.body;
    const senderId = req.user._id; // From auth middleware

    // Validate input
    if (!receiverIds || !Array.isArray(receiverIds) || receiverIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Receiver IDs are required and must be an array' 
      });
    }

    // Check if users exist
    const receivers = await User.find({ _id: { $in: receiverIds } });
    if (receivers.length !== receiverIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Some users not found' 
      });
    }

    // Get sender info
    const sender = await User.findById(senderId)

    const invites = [];

    for (const receiverId of receiverIds) {
      // Check for existing pending invite
      const existingInvite = await inviteModel.findOne({
        senderId,
        receiverId,
        status: 'pending',
        pageId
      });

      if (existingInvite) {
        continue; // Skip if already invited
      }

      // Create invite
      const invite = new inviteModel({
        senderId,
        receiverId,
        pageId
      });

      const savedInvite = await invite.save();
      invites.push(savedInvite);
      await savedInvite.populate("pageId");
      await savedInvite.populate("senderId");

      const populatedInvite = savedInvite;

      // Emit socket event
      const io = req.app.get('io');
      io.to(receiverId.toString()).emit('newInvite', {
        populatedInvite
      });
    }

    res.status(201).json({
      success: true,
      message: `${invites.length} invites sent successfully`,
        invites: invites
    });

  } catch (error) {
    console.error('Send invites error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get user's received invites
export const getReceivedInvites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = 'pending'} = req.query;


    const invites = await inviteModel.find({
      receiverId: userId,
      ...(status !== 'all' && { status })
    })
    .populate('senderId')
    .populate('pageId')
    .sort({ createdAt: -1 })

    res.json({
      success: true,
      invites
    });

  } catch (error) {
    console.error('Get received invites error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get user's sent invites
export const getSentInvites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = 'all'} = req.query;

    const invites = await inviteModel.find({
      senderId: userId,
      ...(status !== 'all' && { status })
    })
    .populate('receiverId')
    .populate('pageId')
    .sort({ createdAt: -1 })

    res.json({
      success: true,
        invites,
    });

  } catch (error) {
    console.error('Get sent invites error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Respond to invite (accept/decline)
export const respondToInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user._id;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Action must be either accept or decline' 
      });
    }

    const invite = await inviteModel.findOne({
      _id: inviteId,
      receiverId: userId,
      status: 'pending'
    }).populate('senderId').populate('receiverId')

    if (!invite) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invite not found or already processed' 
      });
    }

    // Update invite status
    invite.status = action === 'accept' ? 'accepted' : 'declined';
    await invite.save();

    // Emit socket event to sender
    const io = req.app.get('io');
    io.to(invite.senderId._id.toString()).emit('inviteResponse', {
      invite: invite,
      action: action,
      responder: invite.receiverId,
    });

    res.json({
      success: true,
      message: `Invite ${action === 'accept' ? 'accepted' : 'declined'} successfully`,
      data: { invite }
    });

  } catch (error) {
    console.error('Respond to invite error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Cancel sent invite
export const cancelInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user._id;

    const invite = await inviteModel.findOne({
      _id: inviteId,
      senderId: userId,
      status: 'pending'
    }).populate('receiverId');

    if (!invite) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invite not found or cannot be cancelled' 
      });
    }

    invite.status = 'cancelled';
    await invite.save();

    // Emit socket event to receiver
    const io = req.app.get('io');
    io.to(invite.receiverId._id.toString()).emit('inviteCancelled', {
      invite: invite,
    });

    res.json({
      success: true,
      message: 'Invite cancelled successfully',
      data: { invite }
    });

  } catch (error) {
    console.error('Cancel invite error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

export const getLastTodos = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is available from authentication
    const pages = await PagesModel.find({ user: userId, type: "todo" })
      .sort({ createdAt: -1 }) // Sort pages by creation date to prioritize recent pages
      .limit(10); // Limit to 10 pages, then extract tasks

    let allTodos = [];
    pages.forEach(page => {
      if (page.content && page.content.tasks) {
        allTodos = allTodos.concat(page.content.tasks);
      }
    });

    // You might want to sort these todos further if they have their own creation date
    // For now, we'll take the first 10 after flattening
    const last10Todos = allTodos.slice(0, 10).sort((a, b) => {
      // Assuming 'createdAt' exists on the individual todo objects
      // and can be reliably converted to a Date.
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      // Add checks for invalid dates in case 'createdAt' is missing or malformed
      // This ensures the sort doesn't throw an error if a date is invalid.
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0; // Both invalid, treat as equal
      if (isNaN(dateA.getTime())) return 1; // 'a' is invalid, push to end
      if (isNaN(dateB.getTime())) return -1; // 'b' is invalid, push to end

      // For descending order (newest first), subtract A's timestamp from B's
      return dateB.getTime() - dateA.getTime();
    });

    return res.status(200).json({
      error: false,
      todos: last10Todos,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err:err.message, // Send only the message for clarity
    });
  }
};

export const getAllTodos = async (req, res) => {
  try {
    const userId = req.user.id;
    const pages = await PagesModel.find({ user: userId, type: "todo" });

    let allTodos = [];
    pages.forEach(page => {
      if (page.content && page.content.tasks) {
        allTodos = allTodos.concat(page.content.tasks);
      }
    });

    return res.status(200).json({
      error: false,
      todos: allTodos,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err:err.message,
    });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const pages = await PagesModel.find({ user: userId, type: "calendar" });

    let allEvents = [];
    pages.forEach(page => {
      if (page.content && page.content.events) {
        allEvents = allEvents.concat(page.content.events);
      }
    });

    return res.status(200).json({
      error: false,
      events: allEvents,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err:err.message,
    });
  }
};

export const getAllColumns = async (req, res) => {
  try {
    const userId = req.user.id;
    const pages = await PagesModel.find({ user: userId, type: "kanban" });

    let allColumns = [];
    pages.forEach(page => {
      if (page.content && page.content.columns) {
        allColumns = allColumns.concat(page.content.columns);
      }
    });

    return res.status(200).json({
      error: false,
      columns: allColumns,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err:err.message,
    });
  }
};

export const getAllNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const pages = await PagesModel.find({ user: userId, type: "notes" });

    let allNotes = [];
    pages.forEach(page => {
      if (page.content && page.content.notes) { // Assuming 'notes' is the field for note content
        allNotes = allNotes.concat(page.content.notes);
      }
    });

    return res.status(200).json({
      error: false,
      notes: allNotes,
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      err:err.message,
    });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const updateUserInfo = async (req, res) => {
  try {
    // Ensure req.user.id is available from your authentication middleware
    const userId = req.user.id;
    // Use 'username' to match frontend, and ensure 'currentPassword' and 'newPassword' are destructured
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username if provided
    if (name !== undefined) { // Check for undefined to allow empty string updates if desired
      user.username = name;
    }

    // Update email if provided
    if (email !== undefined) { // Check for undefined
      user.email = email;
    }

    // Handle profile image upload
    // Assuming you have a multer middleware setup that populates req.files
    // Changed 'profileImage' to 'avatar' to match your multer configuration
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      const newAvatarFilename = req.files.avatar[0].filename;
      const newAvatarPath = `http://localhost:8000/uploads/profile/avatars/${newAvatarFilename}`;

      // Delete old avatar if it exists and is a local path (not a social media avatar URL)
      // You need to adjust the path.join based on your actual file structure
      // Example: if your uploads are in a 'uploads' directory one level up from your controllers
      if (user.avatar && user.avatar.startsWith('http://localhost:8000/uploads/profile/avatars/')) {
        const oldAvatarFilename = user.avatar.split('/').pop();
        // Construct the absolute path to the old avatar file
        const oldAvatarFilePath = path.join(__dirname, '..', '..', 'uploads', 'profile', 'avatars', oldAvatarFilename);
        if (fs.existsSync(oldAvatarFilePath)) {
          fs.unlinkSync(oldAvatarFilePath);
          console.log(`Deleted old avatar: ${oldAvatarFilePath}`);
        }
      }
      user.avatar = newAvatarPath;
    }

    // Handle password update
    if (newPassword) {
      // Check if the user has a social login ID (Google or GitHub)
      const isSocialUser = user.googleId || user.githubId;

      if (!isSocialUser) {
        // For non-social login users, current password is required to change password
        if (!currentPassword) {
          return res.status(400).json({ message: "Current password is required to change your password." });
        }

        // Verify current password for non-social users
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Current password is incorrect." });
        }
      } else if (user.password && !currentPassword) {
      }

      // Hash and update the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    // Return the updated user object so the frontend can update its state
    res.status(200).json({ message: "Settings updated successfully", user: user });

  } catch (error) {
    console.error("Error in updateUserInfo:", error);
    res.status(500).json({ message: "Server error during update." });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndDelete(userId);

    // Destroy session after account deletion
    req.session.destroy(err => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Account deleted but logout failed" });
      }

      res.clearCookie("connect.sid"); // Clear session cookie
      return res.status(200).json({ message: "Account deleted successfully" });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid"); // Clear the session cookie
    return res.status(200).json({ message: "Logged out successfully" });
  });
};

export const updateDarkMode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { darkMode } = req.body;

    if (typeof darkMode !== "boolean") {
      return res.status(400).json({ message: "darkMode must be a boolean" });
    }

    const updatedSettings = await settingsModel.findOneAndUpdate(
      { user: userId },
      { darkMode },
      { new: true, upsert: true } // create doc if not exists
    );

    res.status(200).json({ message: "Dark mode updated", settings: updatedSettings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};