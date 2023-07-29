const axios = require("axios");

const createIssueCommand = app => {
  app.command("/createissue", async ({ command, context, ack, say }) => {
    console.log("createIssue command called");
    try {
      await ack();

      const { channel } = await app.client.conversations.info({
        token: context.botToken,
        channel: command.channel_id
      });

      const res = await axios.post(`/issues.json`, {
        issue: {
          project_id: process.env.PROJECT_ID,
          subject: `${command.text || channel.name}`
        }
      });

      // console.log(res);
      const task_id = res.data.issue.id;

      await app.db.put(command.channel_id, {
        task_id
      });

      const url = task_id
        ? `${process.env.API_URL}/issues/${task_id}`
        : "There is no task for this channel";

      await app.client.chat.postEphemeral({
        token: context.botToken,
        channel: command.channel_id,
        user: command.user_id,
        text: `Created issue : ${url}`
      });
    } catch (e) {
      console.log(e);
      app.logger.error(e);
    }
  });
};

module.exports = createIssueCommand;
