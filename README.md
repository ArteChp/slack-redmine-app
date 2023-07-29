# Slack app setup  

slack docs guide https://api.slack.com/tutorials/hello-world-bolt
  
go to https://api.slack.com/apps and create a new app.  
  
in created app go to permissions sections and add next permissions   
to **Bot Token Scopes**:   
*app_mentions:read,channels:history,channels:read,chat:write,chat:write.public,
commands,im:history,mpim:history,users:read,groups:read*  
to **User Token Scopes**:  
*channels:history,im:history*  

click **Install app to workspace**  
  
create *.env* file in project root and copy values from *.env_example* 
 
**SLACK_SIGNING_SECRET** can be found at Basic information section - App Credentials - Signing Secret  

**SLACK_BOT_TOKEN** can be found  at OAuth & Permissions section - Bot User OAuth Access Token  

insert also your redmine api key and general task id  
  
# Node app setup  
run `npm i`

run `npm install pm2@latest -g`  

run `pm2 start app.js --no-daemon` to start a server     
  
next we need public url where slack can redirect events.   

one of options - https://ngrok.com/  

run `ngrok http 3000` and it will print urls like:  
*Forwarding  https://someUrl.ngrok.io -> http://localhost:3000*  

go to slack app page , Event Subscriptions section, turn on and in Request URL paste *https://someUrl.ngrok.io/slack/events* 
 
next go to Slash commands section, create new command, name it "*/writeto*" and paste same url as on step before *https://someUrl.ngrok.io/slack/events*  ``

Bot commands:
1. `/writeto`:

`/writeto 123` - messages will be send to task with id 123

`/writeto`  - stop sending from this channel

`/writeto which` - get link to task configured for this channel

2. `/createissue`

`/createissue` - create issue with channel name as subject

`/createissue customName` - create issue with custom name as subject

3. `/updateissue`

`/updateissue desc some new description` - inserts new description to issue
