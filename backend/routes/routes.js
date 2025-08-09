import express from "express"
import { 
    addCardToKanbanColumn, 
    cancelInvite, 
    createPage, 
    deleteAccount, 
    deleteKanbanCard, 
    deletePage, 
    deletePageContent, 
    firstGithubRoute, 
    firstGoogleRoute, 
    getAllColumns, 
    getAllEvents, 
    getAllNotes, 
    getAllTodos, 
    getAllUsers, 
    getLastTodos, 
    getPages, 
    getReceivedInvites, 
    getSentInvites, 
    getSpecificPage, 
    getSpecificUser, 
    logout, 
    normalLogin, 
    normalSignUp, 
    respondToInvite, 
    secondGithubRoute, 
    secondGoogleRoute, 
    sendInvites, 
    updateColumns, 
    updateColumnSettings, 
    updateDarkMode, 
    updateKanbanBoard, 
    updateNotesOrders, 
    updatePageContent, 
    updatePageFieldItem,
    updateUserInfo,
    }from "../controllers/controllers.js"
import uploadProfileImages from "../utils/multer.js"
const router = express.Router()

// Pages
router.post('/createPage', createPage)
router.get("/getPages" , getPages)
router.get("/getSpecificPage/:id" , getSpecificPage)
router.delete("/deletePage/:id", deletePage)
router.put("/updatePage/:id", updatePageContent)
router.delete("/deleteItem/:pageId/:itemId", deletePageContent);
router.patch("/updateItem/:pageId/:itemId", updatePageFieldItem)
router.delete('/deleteKanbanCard/:pageId/:columnId/:cardId', deleteKanbanCard);
router.patch("/updateColumnSettings/:pageId/:columnId", updateColumnSettings)
router.post('/addCard/:pageId/:columnId', addCardToKanbanColumn);
router.put('/updateColumns/:id', updateColumns);
router.put('/updateColumns/:id', updateColumns);

// get all things
router.get('/getLastTodos',getLastTodos )
router.get('/getAllTodos',getAllTodos )
router.get('/getAllEvents',getAllEvents )
router.get('/getAllColumns',getAllColumns )
router.get('/getAllNotes',getAllNotes )


// update the oreders of notes nad kanban
router.put('/updateNotesOrders/:pageId' , updateNotesOrders)
router.put('/updateColumnsOrders/:pageId' , updateKanbanBoard)

// teammates
router.get("/getSpecificUser" , getSpecificUser)
router.get("/getAllUsers" , getAllUsers)
router.post('/invite/sendInvites',sendInvites)
router.get('/invite/getReceivedInvites',getReceivedInvites)
router.get('/invite/getSentInvites',getSentInvites)
router.patch('/invite/respondToInvite',respondToInvite)
router.patch('/invite/cancelInvite',cancelInvite)

// settings
router.patch("/settings/updateUserInfo", uploadProfileImages , updateUserInfo)
router.delete("/settings/deleteAccount" , deleteAccount)
router.delete("/settings/logoutAccount" , logout)
router.patch("/settings/darkMode" , updateDarkMode)

// authentication
router.post("/signup" , uploadProfileImages ,normalSignUp)
router.post("/login" ,normalLogin)
router.get("/auth/google" , firstGoogleRoute)
router.get('/auth/google/callback', secondGoogleRoute)
router.get('/auth/github', firstGithubRoute);
router.get('/auth/github/callback', secondGithubRoute);
router.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        // Passport has put the user info on req.user
        res.json({
            error: false,
            user: req.user
        });
    } else {
        res.status(401).json({
            error: true,
            message: 'Not authenticated'
        });
    }
});

export default router

