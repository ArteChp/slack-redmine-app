const { App } = require("@slack/bolt");
const axios = require("axios");
const level = require("level");
const createIssueCommand = require("./src/commands/create-issue");
const updateIssueCommand = require("./src/commands/update-issue");
const db = level("./db", { valueEncoding: "json" });
require("dotenv").config();
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error"
    }),
    new winston.transports.File({ filename: "./logs/combined.log" })
  ]
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.logger = logger;
app.db = db;

createIssueCommand(app);
updateIssueCommand(app);

axios.defaults.baseURL = process.env.API_URL;
axios.defaults.headers.common["X-Redmine-API-Key"] = process.env.REDMINE_KEY;

const GENERAL_TASK_ID = process.env.GENERAL_TASK_ID;

app.message(async ({ message, context, say }) => {
  console.log("message recieved!");
  try {
    const res = await app.client.users.info({
      // The token you used to initialize your app is stored in the `context` object
      token: context.botToken,
      // Call users.info for the user that send message
      user: message.user
    });
    // console.log(res.user);
    let task_id = GENERAL_TASK_ID;
    db.get(message.channel, function(err, value) {
      if (!err && value.task_id) {
        task_id = value.task_id;
        console.log(message.text + "=> is sending to task: " + task_id);
        axios.put(`/issues/${task_id}.json`, {
          issue: {
            notes: `${res.user.profile.display_name}: ${message.text}`
          }
        });
      }
    });
  } catch (e) {
    console.log(e);
    logger.error(e);
  }
});

app.command("/writeto", async ({ command, context, ack, say }) => {
  console.log("writeTo command called");
  try {
    await ack();
    if (command.text.toLowerCase() === "which") {
      const { task_id } = await db.get(command.channel_id);
      console.log(task_id);
      const url = task_id
        ? `${process.env.API_URL}/issues/${task_id}`
        : "There is no task for this channel";
      await app.client.chat.postEphemeral({
        token: context.botToken,
        channel: command.channel_id,
        user: command.user_id,
        text: url
      });
    } else {
      console.log(command.channel_id);
      await db.put(command.channel_id, {
        task_id:
          command.text.toLowerCase() === "general"
            ? GENERAL_TASK_ID
            : command.text
      });
      const result = await db.get(command.channel_id);
      console.log(result);
    }
  } catch (e) {
    console.log(e);
    logger.error(e);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
