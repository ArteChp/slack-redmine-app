const axios = require("axios");

const updateIssueCommand = app => {
  app.command("/updateissue", async ({ command, context, ack, say }) => {
    console.log("updateissue command called");
    try {
      await ack();
      const { task_id } = await app.db.get(command.channel_id);

      if (task_id) {
        if (command.text.includes("desc\n")) {
          const { data } = await axios.get(`/issues/${task_id}.json`);
          const res = await axios.put(`/issues/${task_id}.json`, {
            issue: {
              description:
                data.issue.description +
                "\r\n" +
                command.text.replace("desc\n", "")
            }
          });
        }
      }

      const message = task_id
        ? `Issue ${process.env.API_URL}/issues/${task_id} was updated`
        : "There is no task for this channel";

      await app.client.chat.postEphemeral({
        token: context.botToken,
        channel: command.channel_id,
        user: command.user_id,
        text: message
      });
    } catch (e) {
      console.log(e);
      app.logger.error(e);
    }
  });
};

module.exports = updateIssueCommand;
