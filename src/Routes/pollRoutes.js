const express = require('express'); 
const router = express.Router();
const Team = require('../models/teamModels');
const Member = require('../models/membersModel');
const Poll = require('../models/pollModel');
const {checkAuth} =require('../middlewares/checkAuth');


// for creating new polls 
router.get('/teams/:id/poll/create',checkAuth, async(req,res)=>{
    try{
    const currentUser = await req.user;
    const team = await Team.findById(req.params.id);
    res.render('pollViews/createPoll',{currentUser,team});
}catch(err){
    console.log(err);
    req.flash("error_msg", "Oh Sorry!, Something went wrong!");
    res.redirect('/teams');
}
})

//for submitting poll info by admin
router.post('/teams/:id/poll/info',checkAuth,async(req,res)=>{
    try{
    if(req.body.deadline){
        let now = Date.now();
        let deadline = new Date(req.body.deadline);
        if(deadline<now){
            req.flash("error_msg", "Enter only future time for keeping deadlines!");
            res.redirect('back');
        }
        const deadlineDate = req.body.deadline;
        const pollTitle = req.body.title;
        const pollQue = req.body.question;
        const options = req.body.option;
        const allOptions = Object.values(options);
        const poll = new Poll({title:pollTitle, question:pollQue, options:allOptions,team:req.params.id, deadline:deadlineDate});
        await poll.save();
        const team = await Team.findById(req.params.id);
        team.polls.push(poll._id);
        await team.save();
        res.redirect(`/teams/${team._id}/poll/show/${poll._id}`)
    }
    else {
    const pollTitle = req.body.title;
    const pollQue = req.body.question;
    const options = req.body.option;
    const allOptions = Object.values(options);
    const poll = new Poll({title:pollTitle, question:pollQue, options:allOptions,team:req.params.id});
    await poll.save();
    const team = await Team.findById(req.params.id);
    team.polls.push(poll._id);
    await team.save();
    res.redirect(`/teams/${team._id}/poll/show/${poll._id}`)
    }
}catch(err){
    console.log(err);
    req.flash("error_msg", "Oh Sorry!, Something went wrong!");
    res.redirect('/teams');
}
})

//displaying poll info to admin and members
router.get('/teams/:id/poll/show/:pollid',checkAuth, async(req,res)=>{
    try{
    const team = await Team.findById(req.params.id).populate('polls');
    const poll = await Poll.findById(req.params.pollid);
    const currentUser = req.user;
    let now = Date.now();
    let deadline = new Date(poll.deadline);
    if(now>=deadline)
    {
        poll.isPresent = false;
    }
    await poll.save();
    if(req.user._id.equals(team.admin._id)){
        res.render('pollViews/adminPollView',{currentUser,poll,team});
    }else{
        res.render('pollViews/memberPollView',{currentUser,poll,team});
    }
}catch(err){
    console.log(err);
    req.flash("error_msg", "Oh Sorry!, Something went wrong!");
    res.redirect('/teams');
}
})

// for submitting poll by the member
router.post('/teams/:id/poll/show/:pollid',checkAuth, async(req,res)=>{
    try{
    const team = await Team.findById(req.params.id).populate('polls');
    const poll = await Poll.findById(req.params.pollid);
    const currentUser = req.user;
    poll.responded.push(currentUser._id);
    poll.results.push(req.body.answer);
    await poll.save();
    const adminId = team.admin;
    const admin = await Member.findById(adminId);
    admin.joinedMembers = admin.joinedMembers.concat(`${req.user.username} submitted a response for the poll '${poll.title}' in your team ${team.name}`);
    admin.inviteGot = true ;
    await admin.save();
    res.redirect(`/teams/${team._id}/poll/show/${poll._id}`);
}catch(err){
    console.log(err);
    req.flash("error_msg", "Oh Sorry!, Something went wrong!");
    res.redirect('/teams');
}
})

//for ending poll and showing results
router.get('/teams/:teamid/poll/endpoll/:pollid',checkAuth, async(req,res)=>{
    try{
    const team = await Team.findById(req.params.teamid).populate('polls');
    const poll = await Poll.findById(req.params.pollid);
    const currentUser = req.user;
    poll.isPresent=false;
    await poll.save();
    res.redirect(`/teams/${team._id}/poll/show/${poll._id}`);
}catch(err){
    console.log(err);
    req.flash("error_msg", "Oh Sorry!, Something went wrong!");
    res.redirect('/teams');
}
})

module.exports = router;