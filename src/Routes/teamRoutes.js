const express = require('express'); 
const router = express.Router();
const Team = require('../models/teamModels');
const {checkAuth} =require('../middlewares/checkAuth')
const Member = require('../models/membersModel');
const Poll = require('../models/pollModel');
const nodemailer = require('nodemailer');


router.get('/teams',checkAuth,async(req,res)=>{
    const currentUser = req.user;
    const myTeams = await Team.find({admin:req.user._id});
    let myTeamIds=[];
    if(myTeams.length!=0){
    myTeams.forEach(team=>{
        myTeamIds.push(team._id);
    })}
    const teamIds = myTeamIds.concat(currentUser.teams);
    let teams=[];
    if(teamIds.length!=0){
        for(let i=0;i<teamIds.length;i++){
            teams.push( await Team.findById(teamIds[i]));
        }
    }
    res.render('teamViews/index',{teams , currentUser});
})

router.get('/teams/new',checkAuth ,(req,res)=>{
    const currentUser = req.user;
    res.render('teamViews/new',{currentUser});
})

router.post('/teams',checkAuth ,async(req,res)=>{
    try{
        const currentUser = req.user;
        const team = new Team(req.body);
        team.admin = currentUser._id;
        await team.save();
        const teamId = team._id;
        req.flash("success_msg", "New Team is created!");
        res.redirect(`/teams/invite/${teamId}`);
    }catch(err){
        console.log(err)
        req.flash("error_msg", "Sorry!, Unable to create new team");
        res.redirect('/teams');
    } 
})

router.get('/teams/:id',checkAuth ,async(req,res)=>{
    try{
        const currentUser = req.user;
        const team = await (Team.findById(req.params.id)).populate('admin').populate('polls');
        if(req.user._id.equals(team.admin._id)){
            res.render('teamViews/show',{team,currentUser});
        }
        else{
            res.render('teamViews/othersTeamShow',{team,currentUser});
        }
        
    }catch(err){
        console.log(err);
        req.flash("error_msg", "Team not found!");
        res.redirect('/teams');
    }
})

router.get('/teams/:id/edit',checkAuth ,async(req,res)=>{
    try{
        const team = await Team.findById(req.params.id);
        const currentUser = req.user;
        res.render('teamViews/edit', {team,currentUser});
    }catch(err){
        console.log(err);
        req.flash("error_msg", "Team not found");
        res.redirect('/teams');
    }
})

router.get('/teams/:id/members',checkAuth , async(req,res)=>{
    try{
    const currentUser = req.user;
    const team = await (Team.findById(req.params.id));
    const teamMemberIds = team.members;
    let teamMembers=[];
    for(let i=0;i<teamMemberIds.length;i++){
        teamMembers.push(await Member.findById(teamMemberIds[i]));
    }
    res.render('teamViews/members',{teamMembers,currentUser,team});
    }catch(err){
        console.log(err);
        req.flash("error_msg", "Sorry, Unable to show members! Try again later!");
        res.redirect(`/teams/${req.params.id}`);
    }
})

router.put('/teams/:id',checkAuth ,async(req,res)=>{
    try{
    const {id}=req.params;
    const team= await Team.findByIdAndUpdate(id,{...req.body});
    const currentUser = req.user;
    req.flash("success_msg", "Successfully updated team details!");
    res.redirect(`/teams/${team._id}`);
    }catch(err){
        console.log(err);
        req.flash("error_msg", "Unable to edit team details!");
        res.redirect('/teams');
    }
});

router.get('/teams/invite/:teamid',checkAuth,async(req,res)=>{
    try{
    const currentUser = req.user;
    const team = await Team.findOne({_id:req.params.teamid});
    console.log(team);
    const allUsers = await Member.find();
    allUninvitedUsers = allUsers.filter(user=>{
        if(user.username == currentUser.username){
            return false;
        }
        return !(team.invitedUsers.includes(user._id));
    })
    res.render('teamViews/invite',{team,allUninvitedUsers,currentUser});
    }catch(err){
    console.log(err);
    req.flash("error_msg", "Sorry, Unable to invite members! Try Again!");
    res.redirect(`/teams/${req.params.teamid}`);
    }
})

router.get('/teams/invite/:teamid/:userid',checkAuth,async(req,res)=>{
    try{
    const team = await Team.findOne({_id:req.params.teamid}).populate('admin');
    const user = await Member.findOne({_id:req.params.userid});
    const currentUser = req.user;
    team.invitedUsers=team.invitedUsers.concat(req.params.userid);
    user.invites=user.invites.concat(team._id);
    user.inviteGot=true;
    await user.save();
    await team.save();
    if(user.notify == 'yes'){
    var transporter = nodemailer.createTransport({
    service: 'gmail',auth: {user: 'deltatask003@gmail.com',pass: 'delta3@task'}});
      
    var mailOptions = {
        from: 'deltatask003@gmail.com',
        to: `${user.email}`,
        subject: 'Notifications from Poll Booth',
        text: `Hello ${user.username},\n Greetings from Poll Booth! \n ${currentUser.username} invited you to join the team '${team.name}' \n If you wish to join the team, Open Poll Booth application and accept the invite.`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }
    res.redirect(`/teams/invite/${team._id}`);
    }catch(err){    
    console.log(err);
    req.flash("error_msg", "Sorry, Unable to invite! Try Again!");
    res.redirect(`/teams/${req.params.teamid}`);
    }
})
module.exports = router;