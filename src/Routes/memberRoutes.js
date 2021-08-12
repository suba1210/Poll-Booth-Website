const express = require('express');
const router = express.Router();
const passport = require('passport');
const Member = require("../models/membersModel");
const {checkAuth} =require('../middlewares/checkAuth');
const Poll = require('../models/pollModel');
const Team = require('../models/teamModels');

router.get('/register', (req,res)=>{
    res.render('auth/register');
})

router.post('/register',async(req,res)=>{
    try{
        const {email,username,password,gender,role,notify} = req.body;
        const user = new Member({email,username,gender,role,notify});
        const registerUser = await Member.register(user,password);
        req.flash("success_msg", "Successfully registered, You can Login now!");
        res.redirect('/login');        
    }catch(err){
        console.log(err);
        if(err.message == "A user with the given username is already registered"){
            req.flash("error_msg", "Username already in use! Try again!");
        }
        else if (err.keyValue.email){
            req.flash("error_msg", "This email is already registered! Try again!");
        }
        else {
            req.flash("error_msg", "Sorry! Unable to register");
        }
        res.redirect("/register");        
    }
})

router.get('/login', (req,res)=>{
        res.render('auth/login');
})

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash("success_msg", "Welcome to Poll Booth");
    res.redirect('/teams');
})

router.get('/logout', (req,res)=>{
    try {
        req.logout();
        req.flash("success_msg", "Successfully logged out");
        res.redirect("/login");
        
      } catch (err) {
        req.flash("error_msg", "Unable to logout");
        res.redirect("/teams");
      }
})

router.get('/member/notification',checkAuth, async(req,res)=>{
    try{
    const currentUser = await Member.findById(req.user._id).populate({
        path: 'invites',
        populate : {
            path : 'admin'
        }
    });
    currentUser.inviteGot = false;
    await currentUser.save();  
    res.render('notification',{currentUser});
}catch(err){
    console.log(err);
    req.flash("error_msg", "Something went wrong!");
    res.redirect('/teams');
}
})

router.get('/members/notification/:uid/accept/:tid',checkAuth, async(req,res)=>{
    try{
    const user = await Member.findById(req.params.uid).populate('teams');
    const team = await Team.findById(req.params.tid);
    const teamId = team._id;
    const index = user.invites.indexOf(teamId);
    user.invites.splice(index,1);
    await user.save();
    team.members = team.members.concat(user._id);
    await team.save();
    user.teams = user.teams.concat(team._id);
    await user.save();
    const adminId = team.admin;
    const admin = await Member.findById(adminId);
    admin.joinedMembers = admin.joinedMembers.concat(`${user.username} joined your team '${team.name}' via invite!`);
    admin.inviteGot = true ;
    await admin.save();
    res.redirect(`/teams/${team._id}`);
    }catch(err){
        console.log(err);
        req.flash("error_msg", "Something went wrong!");
        res.redirect('/teams');
    }
})

router.get('/members/notification/:uid/reject/:tid',checkAuth, async(req,res)=>{
    try{
    const user = await Member.findById(req.params.uid).populate('teams');
    const team = await Team.findById(req.params.tid);
    const teamId = team._id;
    const index = user.invites.indexOf(teamId);
    user.invites.splice(index,1);
    await user.save();
    res.redirect('/member/notification');
}catch(err){
    console.log(err);
    req.flash("error_msg", "Something went wrong!");
    res.redirect('/teams');
}
})

router.get('/member/clear/notification',checkAuth, async(req,res)=>{
    try{
    const user = await Member.findById(req.user._id);
    user.joinedMembers = [];
    await user.save();
    res.redirect('/member/notification');
}catch(err){
    console.log(err);
    req.flash("error_msg", "Something went wrong!");
    res.redirect('/teams');
}
})

router.get('/member/clear/invites',checkAuth, async(req,res)=>{
    try{
    const user = await Member.findById(req.user._id);
    user.invites = [];
    await user.save();
    res.redirect('/member/notification');
}catch(err){
    console.log(err);
    req.flash("error_msg", "Something went wrong!");
    res.redirect('/teams');
}
})

router.get('/profile',checkAuth, async(req,res)=>{
    try{
    const currentUser = await Member.findById(req.user._id);
    res.render('profile',{currentUser});
}catch(err){
    console.log(err);
    req.flash("error_msg", "Something went wrong!");
    res.redirect('/teams');
}
})

router.post('/notify',checkAuth,async(req,res)=>{
    try{
    const currentUser = await Member.findById(req.user._id);
    currentUser.notify = req.body.notify;
    await currentUser.save();
    req.flash("success_msg", "Your preference is saved!");
    res.redirect('/profile');
}catch(err){
    console.log(err);
    req.flash("error_msg", "Something went wrong!");
    res.redirect('/teams');
}
})




module.exports = router;